import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { LearningError } from "../../../../../lib/learning/contracts";
import { LearningServiceError, resumeLearningSession } from "../../../../../lib/server/learning/service";

export const dynamic = "force-dynamic";
const fail = (code: string, message: string, status: number, retryable = false) => NextResponse.json<LearningError>({ error: { code, message, retryable } }, { status });

export async function GET(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to continue learning.", 401);
  try { return NextResponse.json(await resumeLearningSession(userId, (await params).sessionId), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    if (error instanceof LearningServiceError) return fail(error.code, error.message, error.status, error.retryable);
    return fail("LEARNING_UNAVAILABLE", "Faraday could not restore this lesson.", 503, true);
  }
}
