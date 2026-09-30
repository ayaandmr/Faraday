import { InfoPage } from "../../components/info-page";

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="Privacy" title="A straightforward note about this site.">
      <p><strong>Last updated: September 30, 2026</strong></p>
      <p>Faraday is an age-13+ learning pilot. When you start a lesson, we store your chosen grade, teaching style, topic, progress, lesson summary, and limited learning memories such as an explicitly stated preference or misconception.</p>
      <p>Raw student and teacher lesson messages are retained for up to 90 days so a lesson can be safely continued and improved, then removed by scheduled cleanup. Progress, summaries, and learning memories remain until you delete your Faraday learning data or the pilot ends.</p>
      <p>Authentication is provided by Clerk. Lesson generation is provided by Groq, and learning records are stored in Supabase Postgres. Do not include sensitive personal, medical, financial, or private information in lesson answers.</p>
      <p>You can delete all Faraday learning data from Settings. This removes your sessions, progress, and stored memories while leaving your account itself in place.</p>
    </InfoPage>
  );
}
