# Learning API

All endpoints require a Clerk session. User identity is always derived server-side.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/learning/profile` | Get first-use onboarding and saved teaching preferences. |
| `PATCH /api/learning/profile` | Change the saved teaching style and answer format. |
| `DELETE /api/learning/profile` | Delete a student's Faraday learning data, not their Clerk account. |
| `POST /api/learning/intake` | Generate one short, topic-specific context question with three choices. Requires `topic`, `level`, and `priorKnowledge`. First-time students must also confirm age/pilot consent and grade before this call. |
| `POST /api/learning/sessions` | Create a session and return a saved 2–3 chapter plan preview. Requires `topic`, `style`, `format`, `level`, `priorKnowledge`, `focusQuestion`, `goal`, and `stickingPoint`. First use also requires `gradeLevel` and `pilotConsent: true`. |
| `GET /api/learning/sessions` | Return compact active-session cards, including chapter maps when present. |
| `GET /api/learning/sessions/:sessionId` | Restore the saved plan preview or current lesson for its owner. |
| `POST /api/learning/sessions/:sessionId/turns` | `revise_plan` regenerates the preview and `accept_plan` starts step 1. `understand` creates one grade-aware check; `submit_check` advances only after the answer demonstrates the central idea. A wrong answer returns short feedback and keeps the same check open. `skip_step` advances without counting understanding and marks that concept for review. `confused` re-teaches the same step, `ask_follow_up` stays on it, and `start_advanced` extends a completed basic lesson inside the same session. |
| `GET /api/learning/memories` | Read real saved learning memories. |
| `DELETE /api/learning/memories/:memoryId` | Remove one saved memory. |

All learning endpoints return JSON and use this safe error shape:

```json
{ "error": { "code": "RATE_LIMITED", "message": "Faraday needs a short breather.", "retryable": true } }
```

The temporary `/api/learning/respond` mock endpoint was removed. Clients must use the durable session routes.

The plan is stored in `learning_sessions.current_ui` as `plan_preview`; after approval it travels with `teaching_cards`, `step_check`, and `lesson_complete`. Basic and advanced plans are stored in the same JSON session state. Skipped step IDs are also carried in this JSON state, so this progression requires no new database migration. A basic completion is a valid completed lesson; choosing advanced reopens the same session and preserves the completed basic plan.
The intake question is temporary until a session starts. At that point, its wording and the student's answers are saved as plan context. If question generation fails, the UI offers a generic topic question so the student can still continue.
