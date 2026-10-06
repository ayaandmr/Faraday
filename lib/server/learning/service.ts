import type { LearnerLevel, LearningContext, LearningPlan, LessonHistoryItem, LessonStage, LessonUi, LearningTurn, ProgressStatus, ResponseFormat, TeachingStyle, TurnAction } from "../../learning/contracts";
import { countRecentTurns, createSession, ensureProfile, getProfileState, getRecentTurns, getRelevantMemories, getSession, getSessionHistory, saveTurn, updatePlanPreview } from "./database";
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
async function toTurn(session: StoredSession, provider: { id: string; model: string }, fallbackStudentMessage?: string): Promise<LearningTurn> {
  const history = await getSessionHistory(session.id);
  const savedCurrent = history.at(-1);
  const currentMatchesSavedTurn = savedCurrent?.teacherMessage === session.current_teacher_message;
  const studentMessage = currentMatchesSavedTurn ? savedCurrent.studentMessage : fallbackStudentMessage ?? session.topic;
  if (!currentMatchesSavedTurn) {
    history.push({ id: `current-${session.id}`, studentMessage, teacherMessage: session.current_teacher_message, ui: session.current_ui });
  }
  return { sessionId: session.id, topic: session.topic, studentMessage, teacherMessage: session.current_teacher_message, ui: session.current_ui, history, nextAction: session.phase, progress: { status: session.progress_status, confidence: session.progress_confidence, evidenceLabel: evidenceLabel(session.progress_status, session.progress_confidence) }, sessionSummary: session.summary, meta: { provider: provider.id, model: provider.model, prototype: false } };
}

function lessonUi(lesson: TeacherLesson, plan?: LearningPlan, stepIndex?: number, stage: LessonStage = "basic", basicPlan?: LearningPlan, skippedSteps: string[] = [], title?: string): LessonUi {
  return { type: "teaching_cards", title: title ?? lesson.lessonTitle, cards: lesson.cards, nextTopics: lesson.nextTopics, ...(plan ? { plan, stepIndex, stage, ...(basicPlan ? { basicPlan } : {}), ...(skippedSteps.length ? { skippedSteps } : {}) } : {}) };
}

function plannedSteps(plan: LearningPlan) { return plan.chapters.flatMap((chapter) => chapter.steps); }

function reportFailure(stage: string, requestId: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Faraday learning:${stage}] request=${requestId} ${message}`);
}

async function limitTurns(internalUserId: string) {
  if (await countRecentTurns(internalUserId) >= 30) throw new LearningServiceError("RATE_LIMITED", "Faraday needs a short breather. Try again in a few minutes.", true, 429);
}

export async function profileForUser(userId: string) { return getProfileState(userId); }

export async function startLearningSession(userId: string, input: { topic: string; style: TeachingStyle; format: ResponseFormat; level: LearnerLevel; goal: string; stickingPoint: string; priorKnowledge: string; focusQuestion: string; gradeLevel?: 8 | 9 | 10 | 11 | 12; pilotConsent?: boolean }, requestId: string): Promise<LearningTurn> {
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
    const learnerContext: LearningContext = { goal: input.goal, stickingPoint: input.stickingPoint, priorKnowledge: input.priorKnowledge, focusQuestion: input.focusQuestion };
    const plan = await provider.createPlan({ topic: input.topic, gradeLevel: ensured.profile.grade_level, style: input.style, format: input.format, level: input.level, learnerContext, memories });
    const ui: LessonUi = { type: "plan_preview", plan, context: learnerContext };
    const session = await createSession({ userId: ensured.user.id, topic: input.topic, style: input.style, format: input.format, level: input.level, summary: `Goal: ${input.goal}. Already knows: ${input.priorKnowledge}. Asked ${input.focusQuestion} Answer: ${input.stickingPoint}.`, teacherMessage: plan.introduction, ui, modelId: provider.model });
    return await toTurn(session, provider, input.topic);
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

  if (session.current_ui.type === "plan_preview") {
    if (input.action !== "accept_plan" && input.action !== "revise_plan") throw new LearningServiceError("PLAN_NOT_APPROVED", "Review your chapter map and start it when you are ready.");
    const { plan, context } = session.current_ui;
    try {
      const [memories, profile] = await Promise.all([getRelevantMemories(session.user_id), getProfileState(userId)]);
      if (input.action === "revise_plan") {
        const revised = await provider.createPlan({ topic: session.topic, gradeLevel: profile.gradeLevel ?? 9, style: session.style, format: profile.preferredFormat ?? "real_examples", level: session.declared_level, learnerContext: context, feedback: input.answer, previousPlan: plan, memories });
        const saved = await updatePlanPreview(session, { type: "plan_preview", plan: revised, context });
        return await toTurn(saved, provider, session.topic);
      }
      const first = plannedSteps(plan)[0];
      session = { ...session, selected_subtopic_id: first.id, selected_subtopic_label: first.title };
      const studentMessage = `Start with ${first.title}.`;
      const lesson = await provider.createLesson({ userId, requestId, gradeLevel: profile.gradeLevel ?? 9, style: session.style, format: profile.preferredFormat ?? "real_examples", level: session.declared_level, topic: session.topic, subtopic: first.title, phase: "teach", sessionSummary: `${session.summary} Approved short plan: ${plan.chapters.map((chapter) => chapter.title).join(", ")}.`, progress: { status: "exploring", confidence: 0 }, memories, recentTurns: [], studentMessage, shortStep: true });
      const ui = lessonUi(lesson, plan, 0, "basic", undefined, [], first.title);
      const saved = await saveTurn({ session, action: "accept_plan", studentMessage, teacherMessage: lesson.teacherMessage, ui, summary: lesson.summary, phase: "teach", evidence: "none", modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
      return await toTurn(saved, provider, studentMessage);
    } catch (error) {
      reportFailure("plan", requestId, error);
      throw new LearningServiceError("TEACHER_UNAVAILABLE", "Faraday could not update your chapter map. Your plan is saved; please retry.", true, 503);
    }
  }

  if (input.action === "start_advanced") {
    if (session.current_ui.type !== "lesson_complete" || session.current_ui.stage === "advanced" || !session.current_ui.plan) {
      throw new LearningServiceError("ADVANCED_NOT_READY", "Finish the basic lesson before starting the advanced path.");
    }
    const basicPlan = session.current_ui.plan;
    try {
      const [memories, profile] = await Promise.all([getRelevantMemories(session.user_id), getProfileState(userId)]);
      const advancedPlan = await provider.createPlan({
        topic: session.topic, gradeLevel: profile.gradeLevel ?? 9, style: session.style, format: profile.preferredFormat ?? "real_examples", level: "test_me", stage: "advanced", previousPlan: basicPlan, memories,
        learnerContext: { goal: "Go beyond the basics", stickingPoint: "Show deeper ideas and useful applications", priorKnowledge: "The basic lesson is complete", focusQuestion: "What comes after the basics?" },
      });
      const first = plannedSteps(advancedPlan)[0];
      session = { ...session, selected_subtopic_id: first.id, selected_subtopic_label: first.title };
      const studentMessage = "I finished the basics. Teach me the advanced path.";
      const lesson = await provider.createLesson({ userId, requestId, gradeLevel: profile.gradeLevel ?? 9, style: session.style, format: profile.preferredFormat ?? "real_examples", level: "test_me", topic: session.topic, subtopic: first.title, phase: "teach", sessionSummary: `${session.summary} The student completed the basic path and chose advanced learning.`, progress: { status: session.progress_status, confidence: session.progress_confidence }, memories, recentTurns: [], studentMessage, shortStep: true });
      const ui = lessonUi(lesson, advancedPlan, 0, "advanced", basicPlan, [], first.title);
      const saved = await saveTurn({ session, action: input.action, studentMessage, teacherMessage: lesson.teacherMessage, ui, summary: lesson.summary, phase: "teach", evidence: "none", modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
      return await toTurn(saved, provider, studentMessage);
    } catch (error) {
      reportFailure("advanced", requestId, error);
      throw new LearningServiceError("TEACHER_UNAVAILABLE", "Faraday could not build the advanced path yet. Your basic lesson is safely completed; please retry.", true, 503);
    }
  }

  if (session.status === "completed") throw new LearningServiceError("LESSON_COMPLETE", "This lesson is complete. Open another topic to keep learning.");
  if (session.current_ui.type === "lesson_complete") throw new LearningServiceError("LESSON_COMPLETE", "The basic lesson is complete. Choose Learn advanced or open another topic.");
  if (input.action === "accept_plan" || input.action === "revise_plan") throw new LearningServiceError("PLAN_ALREADY_STARTED", "This chapter plan is already in progress.");

  const planned = session.current_ui.plan;
  const stepIndex = session.current_ui.stepIndex ?? 0;
  const stage: LessonStage = session.current_ui.stage ?? "basic";
  const basicPlan = session.current_ui.basicPlan;
  const skippedSteps = session.current_ui.skippedSteps ?? [];

  try {
    const [memories, recentTurns, profile] = await Promise.all([getRelevantMemories(session.user_id), getRecentTurns(session.id), getProfileState(userId)]);
    const teacherContext = { userId, requestId, gradeLevel: profile.gradeLevel ?? 9, style: session.style, format: profile.preferredFormat ?? "real_examples", level: stage === "advanced" ? "test_me" as const : session.declared_level, topic: session.topic, subtopic: session.selected_subtopic_label, phase: "teach" as const, sessionSummary: session.summary, progress: { status: session.progress_status, confidence: session.progress_confidence }, memories, recentTurns, shortStep: Boolean(planned) };

    if (input.action === "understand") {
      if (session.current_ui.type !== "teaching_cards" || !planned) throw new LearningServiceError("CHECK_NOT_READY", "Read the current step before starting its quick check.");
      const checkpoint = await provider.createCheckpoint({ ...teacherContext, studentMessage: "I am ready for one quick check." });
      const studentMessage = "I understand this step. Check me once.";
      const ui: LessonUi = { type: "step_check", title: session.current_ui.title, check: checkpoint, plan: planned, stepIndex, stage, ...(basicPlan ? { basicPlan } : {}), ...(skippedSteps.length ? { skippedSteps } : {}), nextTopics: session.current_ui.nextTopics };
      const saved = await saveTurn({ session, action: input.action, studentMessage, teacherMessage: "One quick question will confirm this step before we move on.", ui, summary: session.summary, phase: "teach", evidence: "none", modelId: provider.model, memoryCandidates: [], complete: false });
      return await toTurn(saved, provider, studentMessage);
    }

    if (input.action === "skip_step") {
      if (session.current_ui.type !== "step_check" || !planned) throw new LearningServiceError("CHECK_NOT_READY", "Open the quick check before skipping this step.");
      const currentCheck = session.current_ui;
      const steps = plannedSteps(planned);
      const current = steps[stepIndex];
      const nextSkippedSteps = Array.from(new Set([...skippedSteps, current?.id ?? session.selected_subtopic_id ?? `step-${stepIndex + 1}`]));
      const lastStep = stepIndex >= steps.length - 1;

      if (lastStep) {
        const advancedComplete = stage === "advanced";
        const teacherMessage = advancedComplete
          ? "You reached the end of the advanced path. I saved this skipped step for review, so it is not counted as understood."
          : "You reached the end of the basic path. I saved this skipped step for review, so it is not counted as understood.";
        const ui: LessonUi = { type: "lesson_complete", summary: session.summary, nextTopics: currentCheck.nextTopics, plan: planned, stepIndex: steps.length, stage, ...(basicPlan ? { basicPlan } : {}), skippedSteps: nextSkippedSteps, canAdvance: !advancedComplete };
        const saved = await saveTurn({ session, action: input.action, studentMessage: "Skip this check for now.", teacherMessage, ui, summary: session.summary, phase: "complete", evidence: "skipped", modelId: provider.model, memoryCandidates: [], complete: true });
        return await toTurn(saved, provider, "Skip this check for now.");
      }

      const next = steps[stepIndex + 1];
      if (!next) throw new LearningServiceError("NO_NEXT_TOPICS", "Faraday could not find the next lesson step.");
      session = { ...session, selected_subtopic_id: next.id, selected_subtopic_label: next.title };
      const studentMessage = "Skip this check for now.";
      const lesson = await provider.createLesson({
        ...teacherContext,
        subtopic: next.title,
        recentTurns: [],
        studentMessage: `The student skipped the previous check. Teach ONLY the next planned step, "${next.title}": ${next.detail}. Do not repeat the skipped step.`,
      });
      const ui = lessonUi(lesson, planned, stepIndex + 1, stage, basicPlan, nextSkippedSteps, next.title);
      const saved = await saveTurn({ session, action: input.action, studentMessage, teacherMessage: `No problem - I saved that step for review. ${lesson.teacherMessage}`, ui, summary: lesson.summary, phase: "teach", evidence: "skipped", evidenceConcept: current ? { id: current.id, label: current.title } : undefined, modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
      return await toTurn(saved, provider, studentMessage);
    }

    if (input.action === "submit_check") {
      if (session.current_ui.type !== "step_check" || !input.answer) throw new LearningServiceError("CHECK_NOT_READY", "Open the step check and write your answer first.");
      const currentCheck = session.current_ui;
      const result = await provider.evaluateCheckpoint({ ...teacherContext, studentMessage: input.answer }, currentCheck.check.question, input.answer);
      if (!result.passed) {
        const ui: LessonUi = { ...currentCheck, check: { ...currentCheck.check, feedback: result.feedback } };
        const saved = await saveTurn({ session, action: input.action, studentMessage: input.answer, teacherMessage: result.feedback, ui, summary: session.summary, phase: "teach", evidence: "confused", modelId: provider.model, memoryCandidates: [], complete: false });
        return await toTurn(saved, provider, input.answer);
      }

      const steps = planned ? plannedSteps(planned) : [];
      const lastStep = stepIndex >= steps.length - 1;
      if (lastStep && planned) {
        const advancedComplete = stage === "advanced";
        const teacherMessage = advancedComplete ? `${result.feedback} You completed both the basic and advanced paths.` : `${result.feedback} You completed the basic path.`;
        const ui: LessonUi = { type: "lesson_complete", summary: session.summary, nextTopics: currentCheck.nextTopics, plan: planned, stepIndex: steps.length, stage, ...(basicPlan ? { basicPlan } : {}), ...(skippedSteps.length ? { skippedSteps } : {}), canAdvance: !advancedComplete };
        const saved = await saveTurn({ session, action: input.action, studentMessage: input.answer, teacherMessage, ui, summary: session.summary, phase: "complete", evidence: "understood", modelId: provider.model, memoryCandidates: [], complete: true });
        return await toTurn(saved, provider, input.answer);
      }

      const next = steps[stepIndex + 1];
      if (!next) throw new LearningServiceError("NO_NEXT_TOPICS", "Faraday could not find the next lesson step.");
      session = { ...session, selected_subtopic_id: next.id, selected_subtopic_label: next.title };
      const studentMessage = input.answer;
      const lesson = await provider.createLesson({ ...teacherContext, subtopic: next.title, recentTurns: [], studentMessage: `The check passed. The previous step is finished. Teach ONLY the next planned step, "${next.title}": ${next.detail}. Do not repeat the previous step.` });
      const ui = lessonUi(lesson, planned, stepIndex + 1, stage, basicPlan, skippedSteps, next.title);
      const current = steps[stepIndex];
      const saved = await saveTurn({ session, action: input.action, studentMessage, teacherMessage: `${result.feedback} ${lesson.teacherMessage}`, ui, summary: lesson.summary, phase: "teach", evidence: "understood", evidenceConcept: current ? { id: current.id, label: current.title } : undefined, modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
      return await toTurn(saved, provider, studentMessage);
    }

    const studentMessage = input.action === "confused" ? "I am confused. Please make this easier." : input.answer ?? "";
    const lesson = await provider.createLesson({ ...teacherContext, studentMessage });
    const ui = lessonUi(lesson, planned, planned ? stepIndex : undefined, stage, basicPlan, skippedSteps, session.selected_subtopic_label ?? undefined);
    const evidence: EvidenceKind = input.action === "confused" ? "confused" : "engaged";
    const saved = await saveTurn({ session, action: input.action, studentMessage, teacherMessage: lesson.teacherMessage, ui, summary: lesson.summary, phase: "teach", evidence, modelId: provider.model, memoryCandidates: lesson.memoryCandidates, complete: false });
    return await toTurn(saved, provider, studentMessage);
  } catch (error) {
    if (error instanceof LearningServiceError) throw error;
    reportFailure("continue", requestId, error);
    throw new LearningServiceError("TEACHER_UNAVAILABLE", "Faraday could not continue this step. Your answer is still here - please retry.", true, 503);
  }
}
