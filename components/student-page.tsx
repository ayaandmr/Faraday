import { auth, currentUser } from "@clerk/nextjs/server";
import { LearningExperience, type LearningPage } from "./learning-experience";

export async function StudentPage({ page }: { page: LearningPage }) {
  await auth.protect();
  const user = await currentUser();
  return <LearningExperience firstName={user?.firstName ?? "Learner"} page={page} />;
}
