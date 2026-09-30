import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { LearningError } from "../../../../lib/learning/contracts";
import { deleteStudentLearningData } from "../../../../lib/server/learning/database";
import { profileForUser } from "../../../../lib/server/learning/service";

export const dynamic = "force-dynamic";
const fail = (code: string, message: string, status: number, retryable = false) => NextResponse.json<LearningError>({ error: { code, message, retryable } }, { status });

export async function GET() {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to use Faraday.", 401);
  try { return NextResponse.json(await profileForUser(userId), { headers: { "Cache-Control": "no-store" } }); }
  catch { return fail("SETUP_REQUIRED", "Faraday's learning database is not configured yet.", 503, true); }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to manage your data.", 401);
  try { await deleteStudentLearningData(userId); return new NextResponse(null, { status: 204 }); }
  catch { return fail("DELETE_FAILED", "Faraday could not remove your learning data. Please try again.", 503, true); }
}
