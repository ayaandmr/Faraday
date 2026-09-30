import type { LearnerLevel, LearningPhase, ProgressStatus, TeachingStyle } from "../../../learning/contracts";

export type MemoryContext = { type: string; content: string };
export type RecentTurn = { studentMessage: string | null; teacherMessage: string };

export type TeacherContext = {
  userId: string;
  requestId: string;
  gradeLevel: number;
  style: TeachingStyle;
  level: LearnerLevel;
  topic: string;
  subtopic: string | null;
  phase: LearningPhase;
  sessionSummary: string;
  progress: { status: ProgressStatus; confidence: number };
  memories: MemoryContext[];
  recentTurns: RecentTurn[];
  studentMessage?: string;
};

export type ModelChoice = { id: string; label: string; detail: string };
export type TopicPlan = { intro: string; subtopics: ModelChoice[]; summary: string };
export type EvidenceKind = "correct" | "partial" | "incorrect" | "uncertain" | "none";
export type MemoryCandidate = { type: "preference" | "interest" | "goal" | "misconception" | "strategy_success"; content: string; confidence: number };
export type TeacherTurn = {
  teacherMessage: string;
  prompt: string;
  interaction: "choice" | "free" | "complete";
  choices: ModelChoice[];
  placeholder: string;
  nextAction: LearningPhase;
  summary: string;
  evidenceKind: EvidenceKind;
  memoryCandidates: MemoryCandidate[];
};

export interface TeacherProvider {
  readonly id: string;
  readonly model: string;
  planTopic(context: Omit<TeacherContext, "subtopic" | "phase" | "sessionSummary" | "progress" | "recentTurns">): Promise<TopicPlan>;
  generateTurn(context: TeacherContext): Promise<TeacherTurn>;
}
