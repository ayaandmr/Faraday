import { auth, currentUser } from "@clerk/nextjs/server";
import { getLessonLibrary } from "../lib/server/learning/database";
import type { LessonLibrary } from "../lib/learning/contracts";
import { LearningExperience, type LearningPage } from "./learning-experience";

export async function StudentPage({ page }: { page: LearningPage }) {
  const { userId } = await auth.protect();
  const user = await currentUser();
  let lessonLibrary: LessonLibrary = { active: [], completed: [], suggested: [] };
  if ((page === "learning" || page === "lessons" || page === "suggested") && userId) {
    try { lessonLibrary = await getLessonLibrary(userId); } catch { lessonLibrary = { active: [], completed: [], suggested: [] }; }
  }
  return <div className="learning-app"><LearningExperience firstName={user?.firstName ?? "Learner"} page={page} lessonLibrary={lessonLibrary} /></div>;
}
