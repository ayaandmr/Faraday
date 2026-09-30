import { z } from "zod";
import { learnerLevels, teachingStyles } from "../../learning/contracts";

const text = (maximum: number) => z.string().trim().min(1).max(maximum);
const gradeSchema = z.union([z.literal(8), z.literal(9), z.literal(10), z.literal(11), z.literal(12)]);

export const startSessionSchema = z.object({
  topic: text(160),
  style: z.enum(teachingStyles),
  level: z.enum(learnerLevels),
  gradeLevel: gradeSchema.optional(),
  pilotConsent: z.boolean().optional(),
});

export const turnSchema = z.object({
  action: z.enum(["choose_subtopic", "answer", "ask_follow_up", "mark_confident"]),
  choiceId: z.string().trim().min(1).max(80).optional(),
  answer: text(2_000).optional(),
}).superRefine((value, context) => {
  if ((value.action === "choose_subtopic" || value.action === "answer") && !value.choiceId) {
    context.addIssue({ code: "custom", message: "Choose one of the available answers.", path: ["choiceId"] });
  }
  if (value.action === "ask_follow_up" && !value.answer) {
    context.addIssue({ code: "custom", message: "Write a short question first.", path: ["answer"] });
  }
});

export function parseBody<T>(schema: z.ZodType<T>, value: unknown): { success: true; data: T } | { success: false; message: string } {
  const parsed = schema.safeParse(value);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, message: parsed.error.issues[0]?.message ?? "The request is invalid." };
}
