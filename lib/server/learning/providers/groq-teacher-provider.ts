import Groq from "groq-sdk";
import { z } from "zod";
import type { TeacherContext, TeacherLesson, TeacherProvider } from "./teacher-provider";

const cardSchema = z.object({ id: z.string().min(1).max(80), title: z.string().min(1).max(80), body: z.string().min(1).max(600), example: z.string().max(400), kind: z.enum(["concept", "example", "remember"]) });
const choiceSchema = z.object({ id: z.string().min(1).max(80), label: z.string().min(1).max(90), detail: z.string().min(1).max(150) });
const lessonSchema = z.object({
  teacherMessage: z.string().min(1).max(900), lessonTitle: z.string().min(1).max(100), cards: z.array(cardSchema).min(3).max(6), nextTopics: z.array(choiceSchema).min(2).max(4), summary: z.string().min(1).max(900),
  memoryCandidates: z.array(z.object({ type: z.enum(["preference", "interest", "goal", "misconception", "strategy_success"]), content: z.string().min(1).max(220), confidence: z.number().min(0).max(1) })).max(3),
});

const cardJson = { type: "object", properties: { id: { type: "string" }, title: { type: "string" }, body: { type: "string" }, example: { type: "string" }, kind: { type: "string", enum: ["concept", "example", "remember"] } }, required: ["id", "title", "body", "example", "kind"], additionalProperties: false };
const choiceJson = { type: "object", properties: { id: { type: "string" }, label: { type: "string" }, detail: { type: "string" } }, required: ["id", "label", "detail"], additionalProperties: false };
const lessonJson = { type: "object", properties: {
  teacherMessage: { type: "string" }, lessonTitle: { type: "string" }, cards: { type: "array", minItems: 3, maxItems: 6, items: cardJson }, nextTopics: { type: "array", minItems: 2, maxItems: 4, items: choiceJson }, summary: { type: "string" },
  memoryCandidates: { type: "array", maxItems: 3, items: { type: "object", properties: { type: { type: "string", enum: ["preference", "interest", "goal", "misconception", "strategy_success"] }, content: { type: "string" }, confidence: { type: "number" } }, required: ["type", "content", "confidence"], additionalProperties: false } },
}, required: ["teacherMessage", "lessonTitle", "cards", "nextTopics", "summary", "memoryCandidates"], additionalProperties: false };

const policy = `You are Faraday, a patient personal teacher for an age-13+ learning pilot. Write so clearly that a much younger learner could follow. Teach before asking anything. Define every new word. Start from zero when level is new. Make 3 or 4 cards with one tiny idea per card, ordered easiest to harder. Each card has 2 to 4 short sentences and one concrete example. Never quiz the student in these cards. Never shame confusion. When the learner is confused, re-teach the same idea with simpler words and a different everyday example. Never claim to browse, recommend an unverified video, infer sensitive traits, help cheating, or provide dangerous instructions. Only create harmless memory candidates explicitly stated by the learner.`;

function contextText(context: TeacherContext) {
  const memories = context.memories.map((item) => `${item.type}: ${item.content}`).join(" | ") || "none";
  const recent = context.recentTurns.map((turn) => `Student: ${turn.studentMessage ?? "—"}\nFaraday: ${turn.teacherMessage}`).join("\n") || "none";
  return `Grade: ${context.gradeLevel}. Topic: ${context.topic}. Current part: ${context.subtopic ?? `${context.topic} basics`}. Starting level: ${context.level}. Teaching style: ${context.style}. Response format: ${context.format}. Phase: ${context.phase}. Progress: ${context.progress.status} ${context.progress.confidence}/100.\nSummary: ${context.sessionSummary || "new topic"}.\nUseful memories: ${memories}.\nRecent conversation: ${recent}.\nLatest student message: ${context.studentMessage ?? context.topic}.`;
}

export class GroqTeacherProvider implements TeacherProvider {
  readonly id = "groq";
  readonly model: string;
  private readonly client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");
    this.model = process.env.FARADAY_TEACHER_MODEL?.trim() || "openai/gpt-oss-20b";
    this.client = new Groq({ apiKey, timeout: 25_000, maxRetries: 0 });
  }

  async createLesson(context: TeacherContext): Promise<TeacherLesson> {
    const instruction = context.studentMessage?.startsWith("I am confused")
      ? "Re-teach the current part from the beginning. Use easier words, a new everyday example, and no test question."
      : context.studentMessage?.startsWith("I understand")
        ? "Teach the named next part now. Connect it to the previous part, but make it only one small step harder."
      : context.phase === "teach" && !context.sessionSummary
        ? "Create the first foundations lesson. If the learner is brand new, begin with what the topic means before any deeper idea."
        : "Continue the lesson by directly answering the latest message or teaching the selected next part. Do not test the learner.";
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const completion = await this.client.chat.completions.create({
          model: this.model, reasoning_effort: "low", max_completion_tokens: 1_800,
          messages: [{ role: "system", content: policy }, { role: "user", content: `${contextText(context)}\n${instruction}\nReturn concise cards. At the end, propose 2-4 next parts ordered easiest to harder.${attempt ? " Keep the JSON especially short." : ""}` }],
          response_format: { type: "json_schema", json_schema: { name: "faraday_card_lesson", strict: true, schema: lessonJson } },
        });
        const content = completion.choices[0]?.message.content;
        if (!content) throw new Error("Groq returned an empty lesson.");
        return lessonSchema.parse(JSON.parse(content));
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Groq could not create a valid lesson.");
  }
}
