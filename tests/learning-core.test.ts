import { describe, expect, it } from "vitest";
import { calculateProgress, normalizeMemory } from "../lib/server/learning/database";
import { intakeQuestionSchema, parseBody, startSessionSchema, turnSchema } from "../lib/server/learning/validation";

describe("learning request validation", () => {
  it("accepts a complete first-session request", () => {
    const parsed = parseBody(startSessionSchema, { topic: "Why do planets orbit?", style: "space", format: "visual_cards", level: "some_knowledge", priorKnowledge: "I know gravity pulls things down", focusQuestion: "Which part of orbits feels strange?", goal: "Understand the basics", stickingPoint: "Why planets don't crash", gradeLevel: 9, pilotConsent: true });
    expect(parsed.success).toBe(true);
  });

  it("requires learning context before building a chapter map", () => {
    const parsed = parseBody(startSessionSchema, { topic: "Motion", style: "sports", format: "real_examples", level: "new" });
    expect(parsed.success).toBe(false);
  });

  it("validates context-question requests before calling the teacher", () => {
    expect(parseBody(intakeQuestionSchema, { topic: "Motion", level: "new", priorKnowledge: "Nothing yet", gradeLevel: 9, pilotConsent: true }).success).toBe(true);
    expect(parseBody(intakeQuestionSchema, { topic: "Motion", level: "new" }).success).toBe(false);
  });

  it("accepts a chapter-map revision only with feedback", () => {
    expect(parseBody(turnSchema, { action: "revise_plan" }).success).toBe(false);
    expect(parseBody(turnSchema, { action: "revise_plan", answer: "Please make chapter 2 easier" }).success).toBe(true);
    expect(parseBody(turnSchema, { action: "accept_plan" }).success).toBe(true);
  });

  it("rejects a follow-up action without a question", () => {
    const parsed = parseBody(turnSchema, { action: "ask_follow_up" });
    expect(parsed.success).toBe(false);
  });

  it("requires an answer for a step check and accepts the advanced action", () => {
    expect(parseBody(turnSchema, { action: "submit_check" }).success).toBe(false);
    expect(parseBody(turnSchema, { action: "submit_check", answer: "Motion means changing position over time." }).success).toBe(true);
    expect(parseBody(turnSchema, { action: "skip_step" }).success).toBe(true);
    expect(parseBody(turnSchema, { action: "start_advanced" }).success).toBe(true);
  });
});

describe("evidence progress", () => {
  it("raises confidence when the learner understands and caps it at 100", () => {
    expect(calculateProgress(70, "understood", "understand")).toMatchObject({ confidence: 88, status: "confident" });
    expect(calculateProgress(95, "understood", "understand").confidence).toBe(100);
  });

  it("marks uncertainty for review and preserves a subtopic start", () => {
    expect(calculateProgress(20, "confused", "confused").status).toBe("needs_review");
    expect(calculateProgress(80, "skipped", "skip_step")).toMatchObject({ confidence: 78, status: "needs_review", correctChecks: 0 });
    expect(calculateProgress(20, "understood", "understand").status).toBe("learning");
  });

  it("normalizes duplicate memory text consistently", () => {
    expect(normalizeMemory("  Likes   football examples ")).toBe("likes football examples");
  });
});
