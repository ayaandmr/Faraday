export const teachingStyles = ["sports", "practical", "story", "space", "game-like", "direct"] as const;
export const responseFormats = ["visual_cards", "real_examples", "step_by_step", "video_style"] as const;
export const learnerLevels = ["new", "some_knowledge", "test_me"] as const;
export const gradeLevels = [8, 9, 10, 11, 12] as const;

export type TeachingStyle = (typeof teachingStyles)[number];
export type ResponseFormat = (typeof responseFormats)[number];
export type LearnerLevel = (typeof learnerLevels)[number];
export type GradeLevel = (typeof gradeLevels)[number];
export type LearningPhase = "teach" | "complete";
export type ProgressStatus = "exploring" | "learning" | "needs_review" | "confident";
export type TurnAction = "understand" | "confused" | "ask_follow_up";

export type LessonChoice = { id: string; label: string; detail: string };
export type TeachingCard = { id: string; title: string; body: string; example: string; kind: "concept" | "example" | "remember" };

export type LessonUi =
  | { type: "teaching_cards"; title: string; cards: TeachingCard[]; nextTopics: LessonChoice[] }
  | { type: "lesson_complete"; summary: string; nextTopics: LessonChoice[] };

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

export type SessionCard = { id: string; topic: string; subtopic: string | null; progressStatus: ProgressStatus; confidence: number; lastActiveAt: string };
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
