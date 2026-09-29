import type { LearningRequest, LearningResponse } from "../../learning/contracts";
import { getTeacherProvider } from "./providers/provider-factory";

export async function generateLearningTurn(userId: string, input: LearningRequest, requestId: string): Promise<LearningResponse> {
  const provider = getTeacherProvider();
  return provider.generateTurn(input, { userId, requestId });
}
