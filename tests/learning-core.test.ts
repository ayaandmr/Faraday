import { describe, expect, it } from "vitest";
import { calculateProgress, normalizeMemory } from "../lib/server/learning/database";
import { parseBody, startSessionSchema, turnSchema } from "../lib/server/learning/validation";

describe("learning request validation", () => {
  it("accepts a complete first-session request", () => {
    const parsed = parseBody(startSessionSchema, { topic: "Why do planets orbit?", style: "space", level: "some_knowledge", gradeLevel: 9, pilotConsent: true });
    expect(parsed.success).toBe(true);
  });

  it("rejects a choice action without an on-screen choice id", () => {
    const parsed = parseBody(turnSchema, { action: "answer" });
    expect(parsed.success).toBe(false);
  });
});

describe("evidence progress", () => {
  it("raises confidence for a correct response and caps it at 100", () => {
    expect(calculateProgress(70, "correct", "answer")).toMatchObject({ confidence: 92, status: "confident" });
    expect(calculateProgress(95, "correct", "answer").confidence).toBe(100);
  });

  it("marks uncertainty for review and preserves a subtopic start", () => {
    expect(calculateProgress(20, "uncertain", "answer").status).toBe("needs_review");
    expect(calculateProgress(80, "correct", "choose_subtopic").status).toBe("exploring");
  });

  it("normalizes duplicate memory text consistently", () => {
    expect(normalizeMemory("  Likes   football examples ")).toBe("likes football examples");
  });
});
