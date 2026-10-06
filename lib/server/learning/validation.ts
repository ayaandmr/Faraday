import { z } from "zod";
import { learnerLevels, responseFormats, teachingStyles } from "../../learning/contracts";

const text = (maximum: number) => z.string().trim().min(1).max(maximum);
const gradeSchema = z.union([z.literal(8), z.literal(9), z.literal(10), z.literal(11), z.literal(12)]);

export const startSessionSchema = z.object({
  topic: text(160),
  style: z.enum(teachingStyles),
  format: z.enum(responseFormats),
  level: z.enum(learnerLevels),
  goal: text(160),
  stickingPoint: text(160),
  priorKnowledge: text(160),
  focusQuestion: text(160),
  gradeLevel: gradeSchema.optional(),
  pilotConsent: z.boolean().optional(),
});

export const intakeQuestionSchema = z.object({
  topic: text(160),
  level: z.enum(learnerLevels),
  priorKnowledge: text(160),
  gradeLevel: gradeSchema.optional(),
  pilotConsent: z.boolean().optional(),
});

export const turnSchema = z.object({
  action: z.enum(["understand", "submit_check", "skip_step", "confused", "ask_follow_up", "accept_plan", "revise_plan", "start_advanced"]),
  answer: text(2_000).optional(),
}).superRefine((value, context) => {
  if ((value.action === "ask_follow_up" || value.action === "revise_plan" || value.action === "submit_check") && !value.answer) {
    context.addIssue({ code: "custom", message: "Write a short question first.", path: ["answer"] });
  }
});

export const preferenceSchema = z.object({ style: z.enum(teachingStyles), format: z.enum(responseFormats) });

export function parseBody<T>(schema: z.ZodType<T>, value: unknown): { success: true; data: T } | { success: false; message: string } {
  const parsed = schema.safeParse(value);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, message: parsed.error.issues[0]?.message ?? "The request is invalid." };
}
