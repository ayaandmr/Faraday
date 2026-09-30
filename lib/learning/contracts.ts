export const teachingStyles = ["sports", "practical", "story", "space", "game-like", "direct"] as const;
export const learnerLevels = ["new", "some_knowledge", "test_me"] as const;
export const gradeLevels = [8, 9, 10, 11, 12] as const;

export type TeachingStyle = (typeof teachingStyles)[number];
export type LearnerLevel = (typeof learnerLevels)[number];
export type GradeLevel = (typeof gradeLevels)[number];
export type LearningPhase = "choose_subtopic" | "diagnose" | "teach" | "check_understanding" | "complete";
export type ProgressStatus = "exploring" | "learning" | "needs_review" | "confident";
export type TurnAction = "choose_subtopic" | "answer" | "ask_follow_up" | "mark_confident";

export type LessonChoice = { id: string; label: string; detail: string };

export type LessonUi =
  | { type: "subtopic_selection"; prompt: string; choices: LessonChoice[] }
  | { type: "choice_question"; prompt: string; choices: LessonChoice[] }
  | { type: "free_response"; prompt: string; placeholder: string }
  | { type: "lesson_complete"; summary: string };

export type LearningTurn = {
  sessionId: string;
  topic: string;
  teacherMessage: string;
  ui: LessonUi;
  nextAction: LearningPhase;
  progress: { status: ProgressStatus; confidence: number; evidenceLabel: string };
  sessionSummary: string;
  meta: { provider: string; model: string; prototype: false };
};

export type SessionCard = {
  id: string;
  topic: string;
  subtopic: string | null;
  progressStatus: ProgressStatus;
  confidence: number;
  lastActiveAt: string;
};

export type ProfileState = {
  complete: boolean;
  gradeLevel: GradeLevel | null;
  preferredStyle: TeachingStyle | null;
};

export type LearningError = {
  error: { code: string; message: string; retryable: boolean };
};
