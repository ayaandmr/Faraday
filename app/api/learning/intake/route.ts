import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { LearningError } from "../../../../lib/learning/contracts";
import { getIntakeMemories, getProfileState } from "../../../../lib/server/learning/database";
import { getTeacherProvider } from "../../../../lib/server/learning/providers/provider-factory";
import { intakeQuestionSchema, parseBody } from "../../../../lib/server/learning/validation";

export const dynamic = "force-dynamic";
const fail = (code: string, message: string, status: number, retryable = false) => NextResponse.json<LearningError>({ error: { code, message, retryable } }, { status });

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to start a topic.", 401);
  let body: unknown;
  try { body = await request.json(); } catch { return fail("INVALID_JSON", "Send a valid request.", 400); }
  const parsed = parseBody(intakeQuestionSchema, body);
  if (!parsed.success) return fail("INVALID_REQUEST", parsed.message, 400);
  try {
    const profile = await getProfileState(userId);
    if (!profile.complete && (!parsed.data.pilotConsent || !parsed.data.gradeLevel)) return fail("PILOT_CONSENT_REQUIRED", "Confirm your age and pilot notice before asking Faraday.", 400);
    const question = await getTeacherProvider().createIntakeQuestion({
      topic: parsed.data.topic,
      level: parsed.data.level,
      priorKnowledge: parsed.data.priorKnowledge,
      gradeLevel: profile.gradeLevel ?? parsed.data.gradeLevel ?? 9,
      memories: await getIntakeMemories(userId),
    });
    return NextResponse.json(question, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[Faraday intake]", error instanceof Error ? error.message : error);
    return fail("QUESTION_UNAVAILABLE", "Faraday could not tailor the question. You can still tell it what feels tricky.", 503, true);
  }
}
