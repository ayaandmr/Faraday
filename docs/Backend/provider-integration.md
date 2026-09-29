# AI provider integration status

## Where the functionality appears

The prepared AI learning flow is the **Start a topic** sidebar option:

```text
/dashboard/learn
```

The student can enter a topic, choose a teaching style and starting level, build a lesson, select diagnostic answers, and ask follow-up questions.

## Current request path

```text
Start a topic UI
  components/core-learning-session.tsx
        ↓ POST
  /api/learning/respond
        ↓ validate and authenticate
  lib/server/learning/service.ts
        ↓ select provider
  lib/server/learning/providers/provider-factory.ts
        ↓
  MockTeacherProvider
```

## What is real today

- The frontend makes a real HTTP request to the Next.js backend.
- The backend requires a Clerk-authenticated user.
- Request values are bounded and validated.
- Responses follow shared TypeScript contracts.
- Provider errors return a safe browser response.
- The UI handles loading, success, and error states.

## What is mocked today

The response content comes from `MockTeacherProvider`. No external language model, API key, database, durable student memory, or mastery engine is connected yet.

This is intentional. It verifies the application boundary while the team decides between a free or paid model.

## Connecting the selected model

When the model is chosen:

1. Create a server-only provider implementing `TeacherProvider`.
2. Validate the provider's structured response against `LearningResponse`.
3. Add the provider-specific API key to local and deployment environment variables.
4. Add the provider to `provider-factory.ts`.
5. Set `FARADAY_TEACHER_PROVIDER` to the new provider identifier.
6. Run lesson-quality, safety, latency, and cost evaluations before making it the default.

The React component and API route should not need provider-specific logic.
