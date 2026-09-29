# Backend

The backend is **planned and not yet implemented**. This folder describes the intended boundaries so the first implementation does not become a collection of unrelated route handlers.

## Proposed modules

```text
server/
├── auth/                 Clerk user resolution and authorization
├── api/                  Request schemas and response mapping
├── learning/             Teaching Orchestrator and lesson state machine
├── models/               OpenAI adapter and structured-output schemas
├── memory/               Candidate extraction, approval and retrieval
├── mastery/              Evidence scoring and review scheduling
├── recommendations/      Next-topic ranking
├── curriculum/           Topic graph and trusted learning content
├── db/                   Database client, queries and transactions
└── observability/        Logs, metrics, traces and product events
```

The final location may use `lib/server/` or another project convention. The important rule is that business logic must not live directly inside API route files.

## Initial vertical slice

Implement only one end-to-end adaptive lesson before building every dashboard feature:

1. Create a topic session.
2. Generate subtopic options and one diagnostic question.
3. Accept an answer.
4. Generate a personalized explanation and check question.
5. Record learning evidence.
6. Save the session summary and next action.
7. Resume it from My Learning.

Recommendations, broad analytics, scheduled review, and advanced test generation can remain prototype data until this loop is reliable.

## Proposed infrastructure

| Concern | Proposed choice | Status |
|---|---|---|
| Authentication | Clerk | Implemented on frontend/server pages |
| Application API | Next.js Route Handlers | Planned |
| Primary teaching model | OpenAI `gpt-6-sol` via Responses API | Planned; verify account access |
| Background model | OpenAI `gpt-6-luna` | Optional/planned |
| Relational storage | PostgreSQL | Decision pending on provider |
| Semantic retrieval | `pgvector` in the same database initially | Planned |
| Schema validation | Zod or equivalent | Decision pending |
| Observability | Structured server logs plus provider/tooling | Decision pending |

## Non-negotiable backend rules

- Never expose API or database secrets to client components.
- Authenticate and authorize every student-specific request.
- Validate every request and every structured model response.
- Do not let the model issue arbitrary database commands.
- Store evidence separately from derived mastery scores.
- Make memory writes typed, inspectable, and reversible.
- Add rate limits and bounded output tokens before public testing.
- Log identifiers and timings, not sensitive prompt contents by default.

See [`api-contracts.md`](api-contracts.md), [`data-model.md`](data-model.md), and [`learning-engine.md`](learning-engine.md).
