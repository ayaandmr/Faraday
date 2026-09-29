import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { LearningError } from "../../../../lib/learning/contracts";
import { generateLearningTurn } from "../../../../lib/server/learning/service";
import { parseLearningRequest } from "../../../../lib/server/learning/validation";

export const dynamic = "force-dynamic";

function errorResponse(code: string, message: string, status: number, retryable = false) {
  return NextResponse.json<LearningError>({ error: { code, message, retryable } }, { status });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHENTICATED", "Sign in to start a learning session.", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "Send a valid JSON request body.", 400);
  }

  const parsed = parseLearningRequest(body);
  if (!parsed.success) return errorResponse("INVALID_REQUEST", parsed.message, 400);

  try {
    const result = await generateLearningTurn(userId, parsed.data, crypto.randomUUID());
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Learning provider failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse("TEACHER_UNAVAILABLE", "Faraday could not prepare the next step. Please try again.", 503, true);
  }
}
