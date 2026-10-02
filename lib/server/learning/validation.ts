import { z } from "zod";
import { learnerLevels, responseFormats, teachingStyles } from "../../learning/contracts";

const text = (maximum: number) => z.string().trim().min(1).max(maximum);
const gradeSchema = z.union([z.literal(8), z.literal(9), z.literal(10), z.literal(11), z.literal(12)]);

export const startSessionSchema = z.object({
  topic: text(160),
  style: z.enum(teachingStyles),
  format: z.enum(responseFormats),
  level: z.enum(learnerLevels),
  gradeLevel: gradeSchema.optional(),
  pilotConsent: z.boolean().optional(),
});

export const turnSchema = z.object({
  action: z.enum(["understand", "confused", "ask_follow_up"]),
  answer: text(2_000).optional(),
}).superRefine((value, context) => {
  if (value.action === "ask_follow_up" && !value.answer) {
    context.addIssue({ code: "custom", message: "Write a short question first.", path: ["answer"] });
  }
});

export const preferenceSchema = z.object({ style: z.enum(teachingStyles), format: z.enum(responseFormats) });

export function parseBody<T>(schema: z.ZodType<T>, value: unknown): { success: true; data: T } | { success: false; message: string } {
  const parsed = schema.safeParse(value);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, message: parsed.error.issues[0]?.message ?? "The request is invalid." };
}
