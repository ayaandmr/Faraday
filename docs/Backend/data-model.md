# Pilot learning data

Run migrations in filename order. Existing projects that already ran the first migration must also run `202609300002_saved_teaching_preferences.sql`.

- `app_users`: Clerk user ID to internal UUID mapping.
- `student_profiles`: grade, pilot consent time, preferred example style, and preferred answer format.
- `learning_sessions`: durable topic, selected learning step, answer format, current teaching cards, compact summary, and progress snapshot.
- `lesson_turns`: raw student/teacher content and card output; each row expires after 90 days.
- `concept_progress`: evidence-derived confidence per active concept.
- `student_memories`: harmless, high-confidence preferences, interests, goals, misconceptions, and successful strategies.

RLS is enabled on every table with no browser policies. The Supabase secret key is used only inside route handlers, and every query is scoped through the authenticated Clerk user. `GET /api/cron/cleanup-learning` removes expired raw lesson turns daily and accepts only Vercel's `CRON_SECRET` bearer token.
