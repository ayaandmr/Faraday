export const teachingStyles = ["sports", "practical", "story", "space", "game-like", "direct"] as const;
export const responseFormats = ["visual_cards", "real_examples", "step_by_step", "video_style"] as const;
export const learnerLevels = ["new", "some_knowledge", "revise"] as const;
export const gradeLevels = [8, 9, 10, 11, 12] as const;

export type TeachingStyle = (typeof teachingStyles)[number];
export type ResponseFormat = (typeof responseFormats)[number];
export type LearnerLevel = (typeof learnerLevels)[number];
export type GradeLevel = (typeof gradeLevels)[number];
export type LearningPhase = "teach" | "choose_next" | "complete";
export type ProgressStatus = "exploring" | "learning" | "needs_review" | "confident";
export type TurnAction = "understand" | "confused" | "ask_follow_up" | "choose_next";

export type LessonChoice = { id: string; label: string; detail: string };
export type TeachingCard = { id: string; title: string; body: string; example: string; kind: "concept" | "example" | "remember" };

export type LessonUi =
  | { type: "teaching_cards"; title: string; cards: TeachingCard[]; nextTopics: LessonChoice[] }
  | { type: "next_topics"; prompt: string; choices: LessonChoice[] }
  | { type: "lesson_complete"; summary: string };

export type LearningTurn = {
  sessionId: string;
  topic: string;
  studentMessage: string;
  teacherMessage: string;
  ui: LessonUi;
  nextAction: LearningPhase;
  progress: { status: ProgressStatus; confidence: number; evidenceLabel: string };
  sessionSummary: string;
  meta: { provider: string; model: string; prototype: false };
};

export type SessionCard = { id: string; topic: string; subtopic: string | null; progressStatus: ProgressStatus; confidence: number; lastActiveAt: string };

export type ProfileState = {
  complete: boolean;
  gradeLevel: GradeLevel | null;
  preferredStyle: TeachingStyle | null;
  preferredFormat: ResponseFormat | null;
};

export type StudentMemory = { id: string; type: "preference" | "interest" | "goal" | "misconception" | "strategy_success"; content: string; confidence: number; createdAt: string };
export type LearningError = { error: { code: string; message: string; retryable: boolean } };
