import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { LearningError } from "../../../../../lib/learning/contracts";
import { deleteStudentMemory } from "../../../../../lib/server/learning/database";

const fail = (code: string, message: string, status: number) => NextResponse.json<LearningError>({ error: { code, message, retryable: status >= 500 } }, { status });

export async function DELETE(_: Request, { params }: { params: Promise<{ memoryId: string }> }) {
  const { userId } = await auth();
  if (!userId) return fail("UNAUTHENTICATED", "Sign in to manage memories.", 401);
  try { await deleteStudentMemory(userId, (await params).memoryId); return new NextResponse(null, { status: 204 }); }
  catch { return fail("DELETE_FAILED", "Faraday could not remove that memory.", 503); }
}
