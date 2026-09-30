# Learning API

All endpoints require a Clerk session. User identity is always derived server-side.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/learning/profile` | Get first-use onboarding state. |
| `DELETE /api/learning/profile` | Delete a student's Faraday learning data, not their Clerk account. |
| `POST /api/learning/sessions` | Create a session and return AI-generated subtopic cards. First use requires `gradeLevel` and `pilotConsent: true`. |
| `GET /api/learning/sessions` | Return compact active-session cards for My Learning. |
| `GET /api/learning/sessions/:sessionId` | Restore the current card for an owned session. |
| `POST /api/learning/sessions/:sessionId/turns` | Submit `choose_subtopic`, `answer`, `ask_follow_up`, or `mark_confident`. |

All learning endpoints return JSON and use this safe error shape:

```json
{ "error": { "code": "RATE_LIMITED", "message": "Faraday needs a short breather.", "retryable": true } }
```

The temporary `/api/learning/respond` mock endpoint was removed. Clients must use the durable session routes.
