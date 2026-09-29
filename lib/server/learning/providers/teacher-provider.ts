import type { LearningRequest, LearningResponse } from "../../../learning/contracts";

export type TeacherProviderContext = {
  userId: string;
  requestId: string;
};

export interface TeacherProvider {
  readonly id: string;
  readonly model: string;
  generateTurn(input: LearningRequest, context: TeacherProviderContext): Promise<LearningResponse>;
}
