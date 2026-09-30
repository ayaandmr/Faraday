import type { LearnerLevel, LearningPhase, ProgressStatus, ResponseFormat, TeachingCard, TeachingStyle } from "../../../learning/contracts";

export type MemoryContext = { type: string; content: string };
export type RecentTurn = { studentMessage: string | null; teacherMessage: string };
export type ModelChoice = { id: string; label: string; detail: string };
export type EvidenceKind = "understood" | "confused" | "engaged" | "none";
export type MemoryCandidate = { type: "preference" | "interest" | "goal" | "misconception" | "strategy_success"; content: string; confidence: number };

export type TeacherContext = {
  userId: string; requestId: string; gradeLevel: number; style: TeachingStyle; format: ResponseFormat; level: LearnerLevel;
  topic: string; subtopic: string | null; phase: LearningPhase; sessionSummary: string;
  progress: { status: ProgressStatus; confidence: number }; memories: MemoryContext[]; recentTurns: RecentTurn[]; studentMessage?: string;
};

export type TeacherLesson = {
  teacherMessage: string;
  lessonTitle: string;
  cards: TeachingCard[];
  nextTopics: ModelChoice[];
  summary: string;
  memoryCandidates: MemoryCandidate[];
};

export interface TeacherProvider {
  readonly id: string;
  readonly model: string;
  createLesson(context: TeacherContext): Promise<TeacherLesson>;
}
