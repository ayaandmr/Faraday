import type { LearnerLevel, LessonChoice, LessonUi, LearningPhase, LearningTurn, ProgressStatus, TeachingStyle, TurnAction } from "../../learning/contracts";
import { getTeacherProvider } from "./providers/provider-factory";
import type { EvidenceKind, TeacherTurn } from "./providers/teacher-provider";
import { countRecentTurns, createSession, ensureProfile, getProfileState, getRecentTurns, getRelevantMemories, getSession, saveTurn, selectSubtopic } from "./database";

export class LearningServiceError extends Error {
  constructor(readonly code: string, message: string, readonly retryable = false, readonly status = 400) { super(message); }
}

function evidenceLabel(status: ProgressStatus, confidence: number) {
  if (status === "confident") return `Strong evidence so far · ${confidence}%`;
  if (status === "needs_review") return `One part needs another angle · ${confidence}%`;
  if (status === "learning") return `Your understanding is growing · ${confidence}%`;
  return "Finding the best place to begin";
}

type StoredSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;
function toTurn(session: StoredSession, provider: { id: string; model: string }): LearningTurn {
  return { sessionId: session.id, topic: session.topic, teacherMessage: session.current_teacher_message, ui: session.current_ui, nextAction: session.phase, progress: { status: session.progress_status, confidence: session.progress_confidence, evidenceLabel: evidenceLabel(session.progress_status, session.progress_confidence) }, sessionSummary: session.summary, meta: { provider: provider.id, model: provider.model, prototype: false } };
}

function asUi(model: TeacherTurn): LessonUi {
  if (model.interaction === "complete") return { type: "lesson_complete", summary: model.prompt };
  if (model.interaction === "free") return { type: "free_response", prompt: model.prompt, placeholder: model.placeholder || "Write what you think..." };
  return { type: "choice_question", prompt: model.prompt, choices: model.choices };
}

function choicesFrom(ui: LessonUi): LessonChoice[] {
  return ui.type === "subtopic_selection" || ui.type === "choice_question" ? ui.choices : [];
}

async function limitTurns(internalUserId: string) {
  if (await countRecentTurns(internalUserId) >= 12) throw new LearningServiceError("RATE_LIMITED", "Faraday needs a short breather. Please try again in a few minutes.", true, 429);
}

export async function profileForUser(userId: string) { return getProfileState(userId); }

export async function startLearningSession(userId: string, input: { topic: string; style: TeachingStyle; level: LearnerLevel; gradeLevel?: 8 | 9 | 10 | 11 | 12; pilotConsent?: boolean }, requestId: string): Promise<LearningTurn> {
  let ensured;
  try { ensured = await ensureProfile(userId, input.gradeLevel, input.pilotConsent, input.style); }
  catch (error) {
    if (error instanceof Error && error.message === "PROFILE_REQUIRED") throw new LearningServiceError("PROFILE_REQUIRED", "Choose your grade and accept the pilot notice before starting.");
    throw error;
  }
  await limitTurns(ensured.user.id);
  const provider = getTeacherProvider();
  try {
    const plan = await provider.planTopic({ userId, requestId, gradeLevel: ensured.profile.grade_level, style: input.style, level: input.level, topic: input.topic, memories: [], studentMessage: undefined });
    const choices = [...plan.subtopics, { id: "whole-topic", label: `The whole of ${input.topic}`, detail: "Start broad and let Faraday choose the first small idea." }];
    const ui: LessonUi = { type: "subtopic_selection", prompt: "Pick your first mini-mission.", choices };
    const session = await createSession({ userId: ensured.user.id, topic: input.topic, style: input.style, level: input.level, summary: plan.summary, teacherMessage: plan.intro, ui, modelId: provider.model });
    const saved = await saveTurn({ session, action: "start_topic", studentMessage: null, teacherMessage: plan.intro, ui, summary: plan.summary, phase: "choose_subtopic", evidence: "none", modelId: provider.model, memoryCandidates: [], complete: false });
    return toTurn(saved, provider);
  } catch (error) {
    if (error instanceof LearningServiceError) throw error;
    throw new LearningServiceError("TEACHER_UNAVAILABLE", "Faraday could not prepare this lesson. Please try again.", true, 503);
  }
}

export async function resumeLearningSession(userId: string, sessionId: string): Promise<LearningTurn> {
  const session = await getSession(userId, sessionId);
  if (!session) throw new LearningServiceError("SESSION_NOT_FOUND", "That learning session was not found.", false, 404);
  return toTurn(session, { id: "groq", model: session.model_id });
}

export async function submitLearningTurn(userId: string, sessionId: string, input: { action: TurnAction; choiceId?: string; answer?: string }, requestId: string): Promise<LearningTurn> {
  let session = await getSession(userId, sessionId);
  if (!session) throw new LearningServiceError("SESSION_NOT_FOUND", "That learning session was not found.", false, 404);
  if (session.status === "completed") throw new LearningServiceError("SESSION_COMPLETE", "This lesson is complete. Start a new topic whenever you are curious.", false, 409);
  await limitTurns(session.user_id);
  let studentMessage: string;
  if (input.action === "choose_subtopic" || input.action === "answer") {
    const selected = choicesFrom(session.current_ui).find((choice) => choice.id === input.choiceId);
    if (!selected) throw new LearningServiceError("INVALID_CHOICE", "That choice is no longer available. Please choose a card on screen.");
    studentMessage = selected.label;
    if (input.action === "choose_subtopic") session = await selectSubtopic(session, selected.id === "whole-topic" ? { id: "whole-topic", label: session.topic } : selected);
  } else if (input.action === "ask_follow_up") studentMessage = input.answer ?? "";
  else studentMessage = "I got it.";
  const provider = getTeacherProvider();
  try {
    const [memories, recentTurns, profile] = await Promise.all([getRelevantMemories(session.user_id), getRecentTurns(session.id), getProfileState(userId)]);
    const model = await provider.generateTurn({ userId, requestId, gradeLevel: profile.gradeLevel ?? 9, style: session.style, level: session.declared_level, topic: session.topic, subtopic: session.selected_subtopic_label, phase: session.phase, sessionSummary: session.summary, progress: { status: session.progress_status, confidence: session.progress_confidence }, memories, recentTurns, studentMessage });
    const readyToComplete = input.action === "mark_confident" && session.progress_confidence >= 80;
    const ui = readyToComplete ? { type: "lesson_complete" as const, summary: model.teacherMessage } : asUi(model);
    const phase: LearningPhase = readyToComplete ? "complete" : model.nextAction;
    const evidence: EvidenceKind = input.action === "mark_confident" ? "none" : model.evidenceKind;
    const saved = await saveTurn({ session, action: input.action, studentMessage, teacherMessage: model.teacherMessage, ui, summary: model.summary, phase, evidence, modelId: provider.model, memoryCandidates: model.memoryCandidates, complete: readyToComplete });
    return toTurn(saved, provider);
  } catch (error) {
    if (error instanceof LearningServiceError) throw error;
    throw new LearningServiceError("TEACHER_UNAVAILABLE", "Faraday could not prepare the next step. Your answer is still here—please try again.", true, 503);
  }
}
