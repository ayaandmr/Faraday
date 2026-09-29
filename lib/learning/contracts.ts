export const teachingStyles = ["sports", "practical", "story", "space", "game-like", "direct"] as const;
export const learnerLevels = ["new", "some_knowledge", "test_me"] as const;
export const learningActions = ["start_topic", "answer_check", "ask_follow_up"] as const;

export type TeachingStyle = (typeof teachingStyles)[number];
export type LearnerLevel = (typeof learnerLevels)[number];
export type LearningAction = (typeof learningActions)[number];

export type LearningRequest = {
  action: LearningAction;
  topic: string;
  style: TeachingStyle;
  level: LearnerLevel;
  sessionId?: string;
  answer?: string;
  conceptId?: string;
  sessionSummary?: string;
};

export type LessonChoice = {
  id: string;
  label: string;
};

export type LessonUi =
  | { type: "choice_question"; prompt: string; choices: LessonChoice[] }
  | { type: "free_response"; prompt: string; placeholder: string }
  | { type: "lesson_complete"; summary: string; nextTopic?: string };

export type LearningResponse = {
  sessionId: string;
  teacherMessage: string;
  conceptId: string;
  ui: LessonUi;
  nextAction: "diagnose" | "teach" | "check_understanding" | "reteach_differently" | "complete_lesson";
  progress: {
    status: "exploring" | "learning" | "needs_review" | "confident";
    evidenceLabel: string;
  };
  sessionSummary: string;
  meta: {
    provider: string;
    model: string;
    prototype: boolean;
  };
};

export type LearningError = {
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
};
