# Groq teacher provider

Start a topic is a real server-side teaching flow. `GroqTeacherProvider` uses `openai/gpt-oss-20b` through Groq with strict JSON-schema output; the app converts it into a clear introduction, 3–6 ordered teaching cards, concrete examples, and an easy-to-hard next-topic path.

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

The model teaches before asking anything. “I understand” opens the next-topic path, “I’m confused” re-teaches the same part with simpler language, and a follow-up produces another card lesson. The server validates the schema, controls progress updates, filters memory candidates, and persists the result. The model cannot directly declare mastery or access the database.
