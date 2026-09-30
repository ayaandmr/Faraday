import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { LearningError } from "../../../../lib/learning/contracts";
import { listStudentMemories } from "../../../../lib/server/learning/database";

export const dynamic = "force-dynamic";
const fail = (code: string, message: string, status: number) => NextResponse.json<LearningError>({ error: { code, message, retryable: status >= 500 } }, { status });

export async function GET() {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to see your memories.", 401);
  try { return NextResponse.json({ memories: await listStudentMemories(userId) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return fail("MEMORIES_UNAVAILABLE", "Faraday could not load your memories.", 503); }
}
