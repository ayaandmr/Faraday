import type { IntakeQuestion, LearnerLevel, LearningContext, LearningPhase, LearningPlan, LessonStage, ProgressStatus, ResponseFormat, TeachingCard, TeachingStyle } from "../../../learning/contracts";

export type MemoryContext = { type: string; content: string };
export type RecentTurn = { studentMessage: string | null; teacherMessage: string };
export type ModelChoice = { id: string; label: string; detail: string };
export type EvidenceKind = "understood" | "confused" | "skipped" | "engaged" | "none";
export type MemoryCandidate = { type: "preference" | "interest" | "goal" | "misconception" | "strategy_success"; content: string; confidence: number };

export type TeacherContext = {
  userId: string; requestId: string; gradeLevel: number; style: TeachingStyle; format: ResponseFormat; level: LearnerLevel;
  topic: string; subtopic: string | null; phase: LearningPhase; sessionSummary: string;
  progress: { status: ProgressStatus; confidence: number }; memories: MemoryContext[]; recentTurns: RecentTurn[]; studentMessage?: string; shortStep?: boolean;
};

export type TeacherLesson = {
  teacherMessage: string;
  lessonTitle: string;
  cards: TeachingCard[];
  nextTopics: ModelChoice[];
  summary: string;
  memoryCandidates: MemoryCandidate[];
};

export type TeacherCheckpoint = { question: string };
export type CheckEvaluation = { passed: boolean; feedback: string };

export type PlanContext = {
  topic: string; gradeLevel: number; style: TeachingStyle; format: ResponseFormat; level: LearnerLevel;
  learnerContext: LearningContext; feedback?: string; previousPlan?: LearningPlan; memories: MemoryContext[]; stage?: LessonStage;
};
export type IntakeContext = { topic: string; gradeLevel: number; level: LearnerLevel; priorKnowledge: string; memories: MemoryContext[] };

export interface TeacherProvider {
  readonly id: string;
  readonly model: string;
  createLesson(context: TeacherContext): Promise<TeacherLesson>;
  createPlan(context: PlanContext): Promise<LearningPlan>;
  createIntakeQuestion(context: IntakeContext): Promise<IntakeQuestion>;
  createCheckpoint(context: TeacherContext): Promise<TeacherCheckpoint>;
  evaluateCheckpoint(context: TeacherContext, question: string, answer: string): Promise<CheckEvaluation>;
}
