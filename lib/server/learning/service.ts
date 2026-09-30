import type { LearnerLevel, LessonChoice, LessonUi, LearningTurn, ProgressStatus, ResponseFormat, TeachingStyle, TurnAction } from "../../learning/contracts";
import { countRecentTurns, createSession, ensureProfile, getProfileState, getRecentTurns, getRelevantMemories, getSession, saveTurn, selectSubtopic } from "./database";
import { getTeacherProvider } from "./providers/provider-factory";
import type { EvidenceKind, TeacherLesson } from "./providers/teacher-provider";

export class LearningServiceError extends Error {
  constructor(readonly code: string, message: string, readonly retryable = false, readonly status = 400) { super(message); }
}

function evidenceLabel(status: ProgressStatus, confidence: number) {
  if (status === "confident") return `This topic is feeling strong · ${confidence}%`;
  if (status === "needs_review") return "Faraday is making this part simpler";
  if (status === "learning") return `Building this topic step by step · ${confidence}%`;
  return "Starting with the easiest idea";
}

type StoredSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;
function toTurn(session: StoredSession, provider: { id: string; model: string }, studentMessage = session.topic): LearningTurn {
  return { sessionId: session.id, topic: session.topic, studentMessage, teacherMessage: session.current_teacher_message, ui: session.current_ui, nextAction: session.phase, progress: { status: session.progress_status, confidence: session.progress_confidence, evidenceLabel: evidenceLabel(session.progress_status, session.progress_confidence) }, sessionSummary: session.summary, meta: { provider: provider.id, model: provider.model, prototype: false } };
}

function lessonUi(lesson: TeacherLesson): LessonUi {
  return { type: "teaching_cards", title: lesson.lessonTitle, cards: lesson.cards, nextTopics: lesson.nextTopics };
}

function choicesFrom(ui: LessonUi): LessonChoice[] {
  if (ui.type === "next_topics") return ui.choices;
  if (ui.type === "teaching_cards") return ui.nextTopics;
  return [];
}

async function limitTurns(internalUserId: string) {
  if (await countRecentTurns(internalUserId) >= 12) throw new LearningServiceError("RATE_LIMITED", "Faraday needs a short breather. Try again in a few minutes.", true, 429);
}

export async function profileForUser(userId: string) { return getProfileState(userId); }

export async function startLearningSession(userId: string, input: { topic: string; style: TeachingStyle; format: ResponseFormat; level: LearnerLevel; gradeLevel?: 8 | 9 | 10 | 11 | 12; pilotConsent?: boolean }, requestId: string): Promise<LearningTurn> {
  let ensured;
  try { ensured = await ensureProfile(userId, input.gradeLevel, input.pilotConsent, input.style, input.format); }
  catch (error) {
    if (error instanceof Error && error.message === "PROFILE_REQUIRED") throw new LearningServiceError("PROFILE_REQUIRED", "Choose your grade and accept the pilot notice before starting.");
    throw error;
  }
  await limitTurns(ensured.user.id);
  const provider = getTeacherProvider();
  try {
    const memories = await getRelevantMemories(ensured.user.id);
    const lesson = await provider.createLesson({ userId, requestId, gradeLevel: ensured.profile.grade_level, style: input.style, format: input.format, level: input.level, topic: input.topic, subtopic: `${input.topic} basics`, phase: "teach", sessionSummary: "", progress: { status: "exploring", confidence: 0 }, memories, recentTurns: [], studentMessage: input.topic });
    const ui = lessonUi(lesson);
    const session = await createSession({ userId: ensured.user.id, topic: input.topic, style: input.style, format: input.format, level: input.level, summary: lesson.summary, teacherMessage: lesson.teacherMessage, ui, modelId: provider.model });
    const saved = await saveTurn({ session, action: "start_topic", studentMessage: input.topic, teacherMessage: lesson.teacherMessage, ui, summary: lesson.summary, phase: "teach", evidence: "none", modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
    return toTurn(saved, provider, input.topic);
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
  await limitTurns(session.user_id);
  const provider = getTeacherProvider();

  if (input.action === "understand") {
    const choices = choicesFrom(session.current_ui);
    if (!choices.length) throw new LearningServiceError("NO_NEXT_TOPICS", "Ask Faraday a follow-up before moving on.");
    const ui: LessonUi = { type: "next_topics", prompt: "Great — what should we learn next?", choices };
    const saved = await saveTurn({ session, action: input.action, studentMessage: "I understand.", teacherMessage: "Nice. You have the foundation. Pick the next small part — the easiest choices are first.", ui, summary: session.summary, phase: "choose_next", evidence: "understood", modelId: provider.model, memoryCandidates: [], complete: false });
    return toTurn(saved, provider, "I understand.");
  }

  let studentMessage = input.action === "confused" ? "I am confused." : input.answer ?? "";
  if (input.action === "choose_next") {
    const selected = choicesFrom(session.current_ui).find((choice) => choice.id === input.choiceId);
    if (!selected) throw new LearningServiceError("INVALID_CHOICE", "Choose one of the next-topic cards on screen.");
    studentMessage = `Teach me: ${selected.label}`;
    session = await selectSubtopic(session, selected);
  }

  try {
    const [memories, recentTurns, profile] = await Promise.all([getRelevantMemories(session.user_id), getRecentTurns(session.id), getProfileState(userId)]);
    const lesson = await provider.createLesson({ userId, requestId, gradeLevel: profile.gradeLevel ?? 9, style: session.style, format: session.content_format ?? "real_examples", level: session.declared_level, topic: session.topic, subtopic: session.selected_subtopic_label, phase: "teach", sessionSummary: session.summary, progress: { status: session.progress_status, confidence: session.progress_confidence }, memories, recentTurns, studentMessage });
    const ui = lessonUi(lesson);
    const evidence: EvidenceKind = input.action === "confused" ? "confused" : "engaged";
    const saved = await saveTurn({ session, action: input.action, studentMessage, teacherMessage: lesson.teacherMessage, ui, summary: lesson.summary, phase: "teach", evidence, modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
    return toTurn(saved, provider, studentMessage);
  } catch (error) {
    if (error instanceof LearningServiceError) throw error;
    throw new LearningServiceError("TEACHER_UNAVAILABLE", "Faraday could not prepare the next cards. Your message is still here — please try again.", true, 503);
  }
}
