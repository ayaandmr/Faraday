# Pilot learning data

Run `supabase/migrations/202609300001_faraday_learning.sql` in the configured Supabase project before enabling the backend.

- `app_users`: Clerk user ID to internal UUID mapping.
- `student_profiles`: grade, pilot consent time, and latest teaching style.
- `learning_sessions`: durable topic, selected subtopic, phase, current card, compact summary, and progress snapshot.
- `lesson_turns`: raw student/teacher content and card output; each row expires after 90 days.
- `concept_progress`: evidence-derived confidence per active concept.
- `student_memories`: harmless, high-confidence preferences, interests, goals, misconceptions, and successful strategies.

RLS is enabled on every table with no browser policies. The Supabase secret key is used only inside route handlers, and every query is scoped through the authenticated Clerk user. `GET /api/cron/cleanup-learning` removes expired raw lesson turns daily and accepts only Vercel's `CRON_SECRET` bearer token.
