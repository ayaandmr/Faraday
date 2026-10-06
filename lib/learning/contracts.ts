export const teachingStyles = ["sports", "practical", "story", "space", "game-like", "direct"] as const;
export const responseFormats = ["visual_cards", "real_examples", "step_by_step", "video_style"] as const;
export const learnerLevels = ["new", "some_knowledge", "test_me"] as const;
export const gradeLevels = [8, 9, 10, 11, 12] as const;

export type TeachingStyle = (typeof teachingStyles)[number];
export type ResponseFormat = (typeof responseFormats)[number];
export type LearnerLevel = (typeof learnerLevels)[number];
export type GradeLevel = (typeof gradeLevels)[number];
export type LearningPhase = "choose_subtopic" | "teach" | "complete";
export type ProgressStatus = "exploring" | "learning" | "needs_review" | "confident";
export type LessonStage = "basic" | "advanced";
export type TurnAction = "understand" | "submit_check" | "skip_step" | "confused" | "ask_follow_up" | "accept_plan" | "revise_plan" | "start_advanced";

export type PlanStep = { id: string; title: string; detail: string };
export type PlanChapter = { id: string; title: string; focus: string; steps: PlanStep[] };
export type LearningPlan = { title: string; introduction: string; estimatedMinutes: number; chapters: PlanChapter[] };
export type LearningContext = { goal: string; stickingPoint: string; priorKnowledge?: string; focusQuestion?: string };
export type IntakeQuestion = { prompt: string; choices: string[] };

export type LessonChoice = { id: string; label: string; detail: string };
export type TeachingCard = { id: string; title: string; body: string; example: string; kind: "concept" | "example" | "remember" };
export type StepCheck = { question: string; feedback?: string };

export type LessonUi =
  | { type: "plan_preview"; plan: LearningPlan; context: LearningContext }
  | { type: "teaching_cards"; title: string; cards: TeachingCard[]; nextTopics: LessonChoice[]; plan?: LearningPlan; stepIndex?: number; stage?: LessonStage; basicPlan?: LearningPlan; skippedSteps?: string[] }
  | { type: "step_check"; title: string; check: StepCheck; plan: LearningPlan; stepIndex: number; stage: LessonStage; basicPlan?: LearningPlan; nextTopics: LessonChoice[]; skippedSteps?: string[] }
  | { type: "lesson_complete"; summary: string; nextTopics: LessonChoice[]; plan?: LearningPlan; stepIndex?: number; stage?: LessonStage; basicPlan?: LearningPlan; canAdvance?: boolean; skippedSteps?: string[] };

export type LessonHistoryItem = { id: string; studentMessage: string; teacherMessage: string; ui: LessonUi };

export type LearningTurn = {
  sessionId: string;
  topic: string;
  studentMessage: string;
  teacherMessage: string;
  ui: LessonUi;
  history: LessonHistoryItem[];
  nextAction: LearningPhase;
  progress: { status: ProgressStatus; confidence: number; evidenceLabel: string };
  sessionSummary: string;
  meta: { provider: string; model: string; prototype: false };
};

export type SessionCard = { id: string; topic: string; subtopic: string | null; progressStatus: ProgressStatus; confidence: number; lastActiveAt: string; plan?: LearningPlan; stepIndex?: number; awaitingApproval?: boolean };
export type SuggestedLesson = { id: string; topic: string; detail: string; sourceTopic: string | null };
export type LessonLibrary = { active: SessionCard[]; completed: SessionCard[]; suggested: SuggestedLesson[] };

export type ProfileState = {
  complete: boolean;
  gradeLevel: GradeLevel | null;
  preferredStyle: TeachingStyle | null;
  preferredFormat: ResponseFormat | null;
};

export type StudentMemory = { id: string; type: "preference" | "interest" | "goal" | "misconception" | "strategy_success"; content: string; confidence: number; createdAt: string };
export type LearningError = { error: { code: string; message: string; retryable: boolean } };
