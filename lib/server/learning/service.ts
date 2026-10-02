import type { LearnerLevel, LessonChoice, LessonHistoryItem, LessonUi, LearningTurn, ProgressStatus, ResponseFormat, TeachingStyle, TurnAction } from "../../learning/contracts";
import { countRecentTurns, createSession, ensureProfile, getProfileState, getRecentTurns, getRelevantMemories, getSession, getSessionHistory, saveTurn } from "./database";
import { getTeacherProvider } from "./providers/provider-factory";
import type { EvidenceKind, TeacherLesson } from "./providers/teacher-provider";

export class LearningServiceError extends Error {
  constructor(readonly code: string, message: string, readonly retryable = false, readonly status = 400) { super(message); }
}

function evidenceLabel(status: ProgressStatus, confidence: number) {
  if (status === "confident") return `This topic is feeling strong - ${confidence}%`;
  if (status === "needs_review") return "Faraday is making this part simpler";
  if (status === "learning") return `Building this topic step by step - ${confidence}%`;
  return "Starting with the easiest idea";
}

type StoredSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;
async function toTurn(session: StoredSession, provider: { id: string; model: string }, studentMessage = session.topic): Promise<LearningTurn> {
  const history = await getSessionHistory(session.id);
  const current: LessonHistoryItem = { id: `current-${session.id}`, studentMessage, teacherMessage: session.current_teacher_message, ui: session.current_ui };
  if (!history.length || history.at(-1)?.teacherMessage !== current.teacherMessage || history.at(-1)?.studentMessage !== current.studentMessage) history.push(current);
  return { sessionId: session.id, topic: session.topic, studentMessage, teacherMessage: session.current_teacher_message, ui: session.current_ui, history, nextAction: session.phase, progress: { status: session.progress_status, confidence: session.progress_confidence, evidenceLabel: evidenceLabel(session.progress_status, session.progress_confidence) }, sessionSummary: session.summary, meta: { provider: provider.id, model: provider.model, prototype: false } };
}

function lessonUi(lesson: TeacherLesson): LessonUi {
  return { type: "teaching_cards", title: lesson.lessonTitle, cards: lesson.cards, nextTopics: lesson.nextTopics };
}

function choicesFrom(ui: LessonUi): LessonChoice[] {
  return ui.nextTopics ?? [];
}

function reportFailure(stage: string, requestId: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Faraday learning:${stage}] request=${requestId} ${message}`);
}

async function limitTurns(internalUserId: string) {
  if (await countRecentTurns(internalUserId) >= 12) throw new LearningServiceError("RATE_LIMITED", "Faraday needs a short breather. Try again in a few minutes.", true, 429);
}

export async function profileForUser(userId: string) { return getProfileState(userId); }

export async function startLearningSession(userId: string, input: { topic: string; style: TeachingStyle; format: ResponseFormat; level: LearnerLevel; gradeLevel?: 8 | 9 | 10 | 11 | 12; pilotConsent?: boolean }, requestId: string): Promise<LearningTurn> {
  let ensured;
  try {
    ensured = await ensureProfile(userId, input.gradeLevel, input.pilotConsent, input.style, input.format);
  } catch (error) {
    if (error instanceof Error && error.message === "PROFILE_REQUIRED") throw new LearningServiceError("PROFILE_REQUIRED", "Choose your grade and accept the pilot notice before starting.");
    reportFailure("profile", requestId, error);
    throw new LearningServiceError("DATABASE_UNAVAILABLE", "Faraday could not save your learning profile. Please retry.", true, 503);
  }

  try {
    await limitTurns(ensured.user.id);
  } catch (error) {
    if (error instanceof LearningServiceError) throw error;
    reportFailure("rate-limit", requestId, error);
    throw new LearningServiceError("DATABASE_UNAVAILABLE", "Faraday could not open your lesson history. Please retry.", true, 503);
  }

  const provider = getTeacherProvider();
  try {
    const memories = await getRelevantMemories(ensured.user.id);
    const lesson = await provider.createLesson({ userId, requestId, gradeLevel: ensured.profile.grade_level, style: input.style, format: input.format, level: input.level, topic: input.topic, subtopic: `${input.topic} basics`, phase: "teach", sessionSummary: "", progress: { status: "exploring", confidence: 0 }, memories, recentTurns: [], studentMessage: input.topic });
    const ui = lessonUi(lesson);
    const session = await createSession({ userId: ensured.user.id, topic: input.topic, style: input.style, format: input.format, level: input.level, summary: lesson.summary, teacherMessage: lesson.teacherMessage, ui, modelId: provider.model });
    const saved = await saveTurn({ session, action: "start_topic", studentMessage: input.topic, teacherMessage: lesson.teacherMessage, ui, summary: lesson.summary, phase: "teach", evidence: "none", modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
    return await toTurn(saved, provider, input.topic);
  } catch (error) {
    if (error instanceof LearningServiceError) throw error;
    reportFailure("start", requestId, error);
    throw new LearningServiceError("TEACHER_UNAVAILABLE", "Faraday could not prepare this lesson. Please try again.", true, 503);
  }
}

export async function resumeLearningSession(userId: string, sessionId: string): Promise<LearningTurn> {
  const session = await getSession(userId, sessionId);
  if (!session) throw new LearningServiceError("SESSION_NOT_FOUND", "That learning session was not found.", false, 404);
  return await toTurn(session, { id: "groq", model: session.model_id });
}

export async function submitLearningTurn(userId: string, sessionId: string, input: { action: TurnAction; answer?: string }, requestId: string): Promise<LearningTurn> {
  let session = await getSession(userId, sessionId);
  if (!session) throw new LearningServiceError("SESSION_NOT_FOUND", "That learning session was not found.", false, 404);
  await limitTurns(session.user_id);
  const provider = getTeacherProvider();

  if (input.action === "understand" && session.progress_confidence >= 72) {
    const teacherMessage = "You built this topic from the basics and made sense of each step. This lesson is complete, and you can revisit it any time.";
    const ui: LessonUi = { type: "lesson_complete", summary: session.summary, nextTopics: choicesFrom(session.current_ui) };
    const saved = await saveTurn({ session, action: input.action, studentMessage: "I understand.", teacherMessage, ui, summary: session.summary, phase: "complete", evidence: "understood", modelId: provider.model, memoryCandidates: [], complete: true });
    return await toTurn(saved, provider, "I understand.");
  }

  if (input.action === "understand") {
    const next = choicesFrom(session.current_ui)[0];
    if (!next) throw new LearningServiceError("NO_NEXT_TOPICS", "Faraday could not find the next lesson step. Ask a follow-up or start a new topic.");
    session = { ...session, selected_subtopic_id: next.id, selected_subtopic_label: next.label };
  }

  const studentMessage = input.action === "confused"
    ? "I am confused. Please make this easier."
    : input.action === "understand"
      ? `I understand. Teach me the next easiest part: ${session.selected_subtopic_label}.`
      : input.answer ?? "";

  try {
    const [memories, recentTurns, profile] = await Promise.all([getRelevantMemories(session.user_id), getRecentTurns(session.id), getProfileState(userId)]);
    const lesson = await provider.createLesson({ userId, requestId, gradeLevel: profile.gradeLevel ?? 9, style: session.style, format: profile.preferredFormat ?? "real_examples", level: session.declared_level, topic: session.topic, subtopic: session.selected_subtopic_label, phase: "teach", sessionSummary: session.summary, progress: { status: session.progress_status, confidence: session.progress_confidence }, memories, recentTurns, studentMessage });
    const ui = lessonUi(lesson);
    const evidence: EvidenceKind = input.action === "confused" ? "confused" : input.action === "understand" ? "understood" : "engaged";
    const saved = await saveTurn({ session, action: input.action, studentMessage, teacherMessage: lesson.teacherMessage, ui, summary: lesson.summary, phase: "teach", evidence, modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
    return await toTurn(saved, provider, studentMessage);
  } catch (error) {
    if (error instanceof LearningServiceError) throw error;
    reportFailure("continue", requestId, error);
    throw new LearningServiceError("TEACHER_UNAVAILABLE", "Faraday could not prepare the next cards. Your message is still here - please try again.", true, 503);
  }
}
