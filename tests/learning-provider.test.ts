import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GroqTeacherProvider } from "../lib/server/learning/providers/groq-teacher-provider";

const completionMock = vi.hoisted(() => vi.fn());
vi.mock("groq-sdk", () => ({ default: class { chat = { completions: { create: completionMock } }; } }));

const planContext = {
  topic: "Motion", gradeLevel: 9, style: "practical" as const, format: "real_examples" as const, level: "new" as const,
  learnerContext: { goal: "Understand the basics", stickingPoint: "What makes things speed up?", priorKnowledge: "Nothing yet", focusQuestion: "Which part of motion feels tricky?" },
  memories: [],
};

beforeEach(() => { vi.stubEnv("GROQ_API_KEY", "test-key"); completionMock.mockReset(); });
afterEach(() => vi.unstubAllEnvs());

describe("Groq learning plan boundary", () => {
  it("turns a valid short map into stable chapter and step IDs", async () => {
    completionMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({
      title: "Motion in a nutshell", introduction: "See how things move.", chapters: [
        { title: "Getting started", focus: "Meaning and movement", steps: [{ title: "What is motion?", detail: "Changing place" }, { title: "How fast?", detail: "A little speed" }] },
        { title: "Going further", focus: "Speed changes", steps: [{ title: "Speeding up", detail: "Acceleration" }, { title: "Slowing down", detail: "Braking" }] },
      ],
    }) } }] });
    const plan = await new GroqTeacherProvider().createPlan(planContext);
    expect(plan.estimatedMinutes).toBe(8);
    expect(plan.chapters).toHaveLength(2);
    expect(plan.chapters[1].steps[0].id).toBe("chapter-2-step-1");
    expect(completionMock.mock.calls[0][0].messages[1].content).toContain("Nothing yet");
  });

  it("rejects malformed chapter lengths after the bounded retry", async () => {
    completionMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ title: "Too short", introduction: "Intro", chapters: [{ title: "One", focus: "One", steps: [{ title: "Only", detail: "One step" }] }] }) } }] });
    await expect(new GroqTeacherProvider().createPlan(planContext)).rejects.toThrow();
    expect(completionMock).toHaveBeenCalledTimes(2);
  });

  it("rejects a planned lesson that exceeds two cards", async () => {
    completionMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({
      teacherMessage: "Let's learn motion.", lessonTitle: "Motion", cards: [1, 2, 3].map((number) => ({ id: String(number), title: `Card ${number}`, body: "A short idea.", example: "A toy car.", kind: "concept" })),
      nextTopics: [{ id: "a", label: "Speed", detail: "How fast" }, { id: "b", label: "Direction", detail: "Which way" }], summary: "Motion means moving.", memoryCandidates: [],
    }) } }] });
    await expect(new GroqTeacherProvider().createLesson({
      userId: "student", requestId: "request", gradeLevel: 9, style: "practical", format: "real_examples", level: "new", topic: "Motion", subtopic: "What is motion?", phase: "teach", sessionSummary: "", progress: { status: "exploring", confidence: 0 }, memories: [], recentTurns: [], shortStep: true,
    })).rejects.toThrow("exactly two cards");
  });

  it("creates one grade-aware checkpoint and evaluates its answer", async () => {
    completionMock
      .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ question: "How can you tell that an object is in motion?" }) } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ passed: true, feedback: "Yes. You connected motion to a change in position." }) } }] });
    const provider = new GroqTeacherProvider();
    const context = {
      userId: "student", requestId: "request", gradeLevel: 8, style: "practical" as const, format: "real_examples" as const, level: "new" as const,
      topic: "Motion", subtopic: "What is motion?", phase: "teach" as const, sessionSummary: "Motion changes position.", progress: { status: "exploring" as const, confidence: 0 }, memories: [], recentTurns: [], shortStep: true,
    };
    const check = await provider.createCheckpoint(context);
    const result = await provider.evaluateCheckpoint(context, check.question, "Its position changes over time.");
    expect(check.question).toContain("motion");
    expect(result.passed).toBe(true);
    expect(completionMock.mock.calls[0][0].messages[1].content).toContain("Grade: 8");
  });

  it("tells the model to leave the completed step and teach only the next planned step", async () => {
    completionMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({
      teacherMessage: "Now we are learning velocity.", lessonTitle: "Velocity", cards: [
        { id: "velocity-idea", title: "Speed with direction", body: "Velocity tells us speed and direction.", example: "A bike moving east at 10 km/h.", kind: "concept" },
        { id: "velocity-example", title: "Why direction matters", body: "Changing direction changes velocity.", example: "Turning a corner changes velocity.", kind: "example" },
      ],
      nextTopics: [{ id: "acceleration", label: "Acceleration", detail: "How velocity changes" }, { id: "graphs", label: "Motion graphs", detail: "Show movement visually" }],
      summary: "Velocity combines speed and direction.", memoryCandidates: [],
    }) } }] });
    await new GroqTeacherProvider().createLesson({
      userId: "student", requestId: "request", gradeLevel: 9, style: "practical", format: "real_examples", level: "new", topic: "Motion", subtopic: "Velocity", phase: "teach", sessionSummary: "Distance and displacement are complete.", progress: { status: "learning", confidence: 30 }, memories: [], recentTurns: [], shortStep: true,
      studentMessage: "The check passed. The previous step is finished. Teach ONLY the next planned step, Velocity: speed with direction. Do not repeat the previous step.",
    });
    const prompt = completionMock.mock.calls[0][0].messages[1].content as string;
    expect(prompt).toContain("Current part: Velocity");
    expect(prompt).toContain("Do not repeat, rename, or continue explaining the previous step");
  });

  it("uses advanced IDs for an advanced extension map", async () => {
    completionMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({
      title: "Motion advanced", introduction: "Go deeper.", chapters: [
        { title: "Vectors", focus: "Direction", steps: [{ title: "Vector motion", detail: "Magnitude and direction" }, { title: "Components", detail: "Split a vector" }] },
        { title: "Graphs", focus: "Representations", steps: [{ title: "Velocity graph", detail: "Read slope" }, { title: "Acceleration graph", detail: "Read change" }] },
      ],
    }) } }] });
    const plan = await new GroqTeacherProvider().createPlan({ ...planContext, stage: "advanced", previousPlan: { title: "Basics", introduction: "Start", estimatedMinutes: 8, chapters: [] } });
    expect(plan.chapters[0].steps[0].id).toBe("advanced-chapter-1-step-1");
    expect(completionMock.mock.calls[0][0].messages[1].content).toContain("advanced extension");
  });
});
