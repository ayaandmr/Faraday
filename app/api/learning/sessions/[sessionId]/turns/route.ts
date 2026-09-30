import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { LearningError } from "../../../../../../lib/learning/contracts";
import { LearningServiceError, submitLearningTurn } from "../../../../../../lib/server/learning/service";
import { parseBody, turnSchema } from "../../../../../../lib/server/learning/validation";

export const dynamic = "force-dynamic";
const fail = (code: string, message: string, status: number, retryable = false) => NextResponse.json<LearningError>({ error: { code, message, retryable } }, { status });

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to continue learning.", 401);
  let body: unknown;
  try { body = await request.json(); } catch { return fail("INVALID_JSON", "Send a valid JSON request body.", 400); }
  const parsed = parseBody(turnSchema, body);
  if (!parsed.success) return fail("INVALID_REQUEST", parsed.message, 400);
  try { return NextResponse.json(await submitLearningTurn(userId, (await params).sessionId, parsed.data, crypto.randomUUID()), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    if (error instanceof LearningServiceError) return fail(error.code, error.message, error.status, error.retryable);
    return fail("LEARNING_UNAVAILABLE", "Faraday could not prepare the next step.", 503, true);
  }
}
