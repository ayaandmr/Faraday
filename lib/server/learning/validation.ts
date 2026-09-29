import { learnerLevels, learningActions, teachingStyles, type LearnerLevel, type LearningAction, type LearningRequest, type TeachingStyle } from "../../learning/contracts";

type ParseResult = { success: true; data: LearningRequest } | { success: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maximum: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > maximum) return undefined;
  return cleaned;
}

export function parseLearningRequest(value: unknown): ParseResult {
  if (!isRecord(value)) return { success: false, message: "The request body must be a JSON object." };

  const action = cleanText(value.action, 40);
  const topic = cleanText(value.topic, 160);
  const style = cleanText(value.style, 40);
  const level = cleanText(value.level, 40);

  if (!action || !learningActions.includes(action as LearningAction)) return { success: false, message: "Choose a valid learning action." };
  if (!topic) return { success: false, message: "Enter a topic between 1 and 160 characters." };
  if (!style || !teachingStyles.includes(style as TeachingStyle)) return { success: false, message: "Choose a valid teaching style." };
  if (!level || !learnerLevels.includes(level as LearnerLevel)) return { success: false, message: "Choose a valid starting level." };

  const answer = cleanText(value.answer, 2_000);
  if (action !== "start_topic" && !answer) return { success: false, message: "An answer or follow-up question is required." };

  return {
    success: true,
    data: {
      action: action as LearningAction,
      topic,
      style: style as TeachingStyle,
      level: level as LearnerLevel,
      sessionId: cleanText(value.sessionId, 120),
      answer,
      conceptId: cleanText(value.conceptId, 160),
      sessionSummary: cleanText(value.sessionSummary, 2_000),
    },
  };
}
