import { auth, currentUser } from "@clerk/nextjs/server";
import { HomeDashboard } from "../../components/home-dashboard";

export default async function DashboardPage() {
  await auth.protect();
  const user = await currentUser();
  const firstName = user?.firstName ?? "Learner";

  return <HomeDashboard firstName={firstName} />;
}
