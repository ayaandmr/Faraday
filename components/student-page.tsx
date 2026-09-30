import { auth, currentUser } from "@clerk/nextjs/server";
import { getActiveSessionCards } from "../lib/server/learning/database";
import type { SessionCard } from "../lib/learning/contracts";
import { LearningExperience, type LearningPage } from "./learning-experience";

export async function StudentPage({ page }: { page: LearningPage }) {
  const { userId } = await auth.protect();
  const user = await currentUser();
  let activeSessions: SessionCard[] = [];
  if (page === "learning" && userId) {
    try { activeSessions = await getActiveSessionCards(userId); } catch { activeSessions = []; }
  }
  return <div className="learning-app"><LearningExperience firstName={user?.firstName ?? "Learner"} page={page} activeSessions={activeSessions} /></div>;
}
