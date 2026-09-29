import type { LearningRequest, LearningResponse, LessonChoice } from "../../../learning/contracts";
import type { TeacherProvider, TeacherProviderContext } from "./teacher-provider";

const styleExamples: Record<LearningRequest["style"], string> = {
  sports: "a sports example",
  practical: "a real-world experiment",
  story: "a short story",
  space: "a space mission",
  "game-like": "a small challenge",
  direct: "a clear step-by-step explanation",
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "topic";
}

function diagnosticChoices(topic: string): LessonChoice[] {
  return [
    { id: "know", label: `I can explain the basic idea of ${topic}` },
    { id: "heard", label: "I have heard of it, but cannot explain it yet" },
    { id: "unsure", label: "I'm not sure yet" },
  ];
}

export class MockTeacherProvider implements TeacherProvider {
  readonly id = "mock";
  readonly model = "faraday-demo-teacher-v1";

  async generateTurn(input: LearningRequest, context: TeacherProviderContext): Promise<LearningResponse> {
    const sessionId = input.sessionId ?? `demo_${context.requestId}`;
    const conceptId = input.conceptId ?? `${slug(input.topic)}-foundations`;

    if (input.action === "start_topic") {
      return {
        sessionId,
        teacherMessage: `Let's make ${input.topic} feel simple. I will begin with ${styleExamples[input.style]} and adjust as you answer.`,
        conceptId,
        ui: {
          type: "choice_question",
          prompt: `Before we begin, which sentence is closest to how ${input.topic} feels right now?`,
          choices: diagnosticChoices(input.topic),
        },
        nextAction: "diagnose",
        progress: { status: "exploring", evidenceLabel: "Finding your starting point" },
        sessionSummary: `The student started ${input.topic} at ${input.level} level and prefers ${input.style} teaching.`,
        meta: { provider: this.id, model: this.model, prototype: true },
      };
    }

    const unsure = input.answer?.toLowerCase().includes("not sure") || input.answer?.toLowerCase().includes("don't know");
    const followUp = input.action === "ask_follow_up";
    const teacherMessage = unsure
      ? `That is completely fine. We will slow down and use ${styleExamples[input.style]}. The simplest starting point is that ${input.topic} becomes easier when we connect one small idea at a time.`
      : followUp
        ? `Good question. In the real AI version, Faraday will answer that exact question using your ${input.style} preference and the lesson history. For now, notice how your question points to the core idea behind ${input.topic}.`
        : `Useful answer. Faraday would now compare it with the key idea, explain any gap through ${styleExamples[input.style]}, and check the same concept in a new situation.`;

    return {
      sessionId,
      teacherMessage,
      conceptId,
      ui: {
        type: "choice_question",
        prompt: `After that explanation, what should Faraday do next with ${input.topic}?`,
        choices: [
          { id: "example", label: "Show me one concrete example" },
          { id: "check", label: "Give me a tiny check question" },
          { id: "simpler", label: "Explain it more simply" },
        ],
      },
      nextAction: unsure ? "reteach_differently" : "check_understanding",
      progress: { status: unsure ? "needs_review" : "learning", evidenceLabel: unsure ? "Needs another explanation" : "One learning response recorded" },
      sessionSummary: `${input.sessionSummary ?? `The student is learning ${input.topic}.`} Latest response: ${input.answer}.`,
      meta: { provider: this.id, model: this.model, prototype: true },
    };
  }
}
