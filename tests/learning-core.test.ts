import { describe, expect, it } from "vitest";
import { calculateProgress, normalizeMemory } from "../lib/server/learning/database";
import { parseBody, startSessionSchema, turnSchema } from "../lib/server/learning/validation";

describe("learning request validation", () => {
  it("accepts a complete first-session request", () => {
    const parsed = parseBody(startSessionSchema, { topic: "Why do planets orbit?", style: "space", format: "visual_cards", level: "some_knowledge", gradeLevel: 9, pilotConsent: true });
    expect(parsed.success).toBe(true);
  });

  it("rejects a next-topic action without an on-screen choice id", () => {
    const parsed = parseBody(turnSchema, { action: "choose_next" });
    expect(parsed.success).toBe(false);
  });
});

describe("evidence progress", () => {
  it("raises confidence when the learner understands and caps it at 100", () => {
    expect(calculateProgress(70, "understood", "understand")).toMatchObject({ confidence: 88, status: "confident" });
    expect(calculateProgress(95, "understood", "understand").confidence).toBe(100);
  });

  it("marks uncertainty for review and preserves a subtopic start", () => {
    expect(calculateProgress(20, "confused", "confused").status).toBe("needs_review");
    expect(calculateProgress(20, "engaged", "choose_next").status).toBe("learning");
  });

  it("normalizes duplicate memory text consistently", () => {
    expect(normalizeMemory("  Likes   football examples ")).toBe("likes football examples");
  });
});
