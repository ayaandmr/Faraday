# Groq teacher provider

Start a topic is a real server-side teaching flow. `GroqTeacherProvider` uses `openai/gpt-oss-20b` through Groq with strict JSON-schema output. After the student shares what they know, it asks one short, topic-specific focus question. The student's answer and goal shape a personalized book-style index with 2–3 chapters and two small steps per chapter. The student can revise this plan before approving it. Only then does the provider create two concise teaching cards per planned step.

Required server-only variables:

```text
GROQ_API_KEY=
FARADAY_TEACHER_PROVIDER=groq
FARADAY_TEACHER_MODEL=openai/gpt-oss-20b
SUPABASE_URL=
SUPABASE_SECRET_KEY=
CRON_SECRET=
```

Never expose or commit these values. The adapter sends a compact student context: grade, style, active topic/subtopic, summary, relevant memories, recent turns, and the newest answer. It never sends all historical data. It uses non-streaming strict structured output, low reasoning effort, a 25-second timeout, a 1,800-token output bound, one generation retry, and a 30-turn/10-minute per-student limit.

The model matches teaching depth and vocabulary to the saved grade. `I understand` generates exactly one short check for the current step. The student advances only when `submit_check` demonstrates the central idea; unclear answers remain on the same check with brief feedback. The server explicitly names and locks the next planned step after a correct answer so the model cannot accidentally repeat the completed explanation. `I'm confused` re-teaches the same step, `skip_step` moves forward while recording review-needed evidence, and a follow-up never advances progress. After the basic path reaches 100%, `start_advanced` creates a non-repeating advanced extension inside the same session. The server validates every schema, controls progress, filters memory candidates, and persists the result. The model cannot directly declare mastery or access the database.
