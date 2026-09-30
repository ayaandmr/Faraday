# Groq teacher provider

Start a topic is now a real server-side learning flow. `GroqTeacherProvider` uses `openai/gpt-oss-20b` through Groq with strict JSON-schema output; the app converts that validated result into safe learning cards.

Required server-only variables:

```text
GROQ_API_KEY=
FARADAY_TEACHER_PROVIDER=groq
FARADAY_TEACHER_MODEL=openai/gpt-oss-20b
SUPABASE_URL=
SUPABASE_SECRET_KEY=
CRON_SECRET=
```

Never expose or commit these values. The adapter sends a compact student context: grade, style, active topic/subtopic, summary, relevant memories, recent turns, and the newest answer. It never sends all historical data. It uses non-streaming strict structured output, low reasoning effort, a 20-second timeout, and a 12-turn/10-minute per-student limit.

The teacher model writes language and recommends evidence or memory candidates. The server validates the schema, controls progress updates, filters memory candidates, and persists the result. The model cannot directly declare mastery or access the database.
