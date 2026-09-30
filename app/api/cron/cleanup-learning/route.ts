import { NextResponse } from "next/server";
import { cleanupExpiredTurns } from "../../../../lib/server/learning/database";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });
  try { return NextResponse.json({ deletedTurns: await cleanupExpiredTurns() }); }
  catch { return NextResponse.json({ error: "Cleanup failed" }, { status: 503 }); }
}
