# Backend

The durable Start a Topic backend is implemented. It uses Clerk identity, Groq `openai/gpt-oss-20b` strict structured output, and Supabase Postgres. The model creates short teaching cards; the server owns authorization, progress, memory filtering, and persistence.

Implemented routes:

- `GET` and `DELETE /api/learning/profile`
- `GET` and `POST /api/learning/sessions`
- `GET /api/learning/sessions/:sessionId`
- `POST /api/learning/sessions/:sessionId/turns`
- `GET /api/cron/cleanup-learning`

Before local or deployed use, run `supabase/migrations/202609300001_faraday_learning.sql` and configure `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `CRON_SECRET` as server-only variables. See the API, data, and provider documents in this folder for the contract details.

Recommendations, broad analytics, advanced tests, and student-facing memory editing are not part of this vertical slice yet.
