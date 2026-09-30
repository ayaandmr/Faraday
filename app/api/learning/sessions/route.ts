import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { LearningError } from "../../../../lib/learning/contracts";
import { getActiveSessionCards } from "../../../../lib/server/learning/database";
import { LearningServiceError, startLearningSession } from "../../../../lib/server/learning/service";
import { parseBody, startSessionSchema } from "../../../../lib/server/learning/validation";

export const dynamic = "force-dynamic";
const fail = (code: string, message: string, status: number, retryable = false) => NextResponse.json<LearningError>({ error: { code, message, retryable } }, { status });
function serviceFail(error: unknown) {
  if (error instanceof LearningServiceError) return fail(error.code, error.message, error.status, error.retryable);
  return fail("LEARNING_UNAVAILABLE", "Faraday is not ready right now. Please try again.", 503, true);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to see your learning.", 401);
  try { return NextResponse.json({ sessions: await getActiveSessionCards(userId) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return fail("LEARNING_UNAVAILABLE", "Faraday could not load your learning sessions.", 503, true); }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to start a learning session.", 401);
  let body: unknown;
  try { body = await request.json(); } catch { return fail("INVALID_JSON", "Send a valid JSON request body.", 400); }
  const parsed = parseBody(startSessionSchema, body);
  if (!parsed.success) return fail("INVALID_REQUEST", parsed.message, 400);
  try { return NextResponse.json(await startLearningSession(userId, parsed.data, crypto.randomUUID()), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return serviceFail(error); }
}
