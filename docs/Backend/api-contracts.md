# Planned API contracts

These contracts describe the first adaptive-learning vertical slice. Exact URLs may change, but request and response responsibilities should remain stable.

## Conventions

- All endpoints require a Clerk-authenticated user.
- Requests and responses are JSON unless streaming is explicitly used.
- The server derives `userId`; clients never send an authoritative user identifier.
- Every mutation accepts an idempotency key before production rollout.
- Validation errors use stable machine-readable codes.

## Start a learning session

`POST /api/learning/sessions`

```json
{
  "topic": "Gravity",
  "goal": "understand",
  "preferredStyle": "sports",
  "declaredLevel": "some_knowledge"
}
```

```json
{
  "sessionId": "lsn_123",
  "topic": { "id": "gravity", "name": "Gravity" },
  "subtopics": [
    { "id": "falling-objects", "label": "Why objects fall" },
    { "id": "mass-weight", "label": "Mass vs weight" },
    { "id": "orbits", "label": "Orbits and satellites" }
  ],
  "nextAction": "choose_subtopic"
}
```

## Submit a lesson turn

`POST /api/learning/sessions/:sessionId/turns`

```json
{
  "action": "answer_check",
  "blockId": "block_456",
  "answer": { "choiceId": "a", "freeText": null }
}
```

```json
{
  "turnId": "turn_789",
  "blocks": [
    {
      "type": "feedback",
      "tone": "hint",
      "text": "You found the inward pull. Now let's add sideways motion."
    },
    {
      "type": "choice_question",
      "prompt": "What happens when gravity pulls while the Moon moves sideways?",
      "choices": [
        { "id": "a", "label": "Its path curves" },
        { "id": "b", "label": "It stops immediately" },
        { "id": "unsure", "label": "I'm not sure yet" }
      ]
    }
  ],
  "nextAction": "check_understanding",
  "progress": { "conceptId": "orbital-motion", "status": "learning" }
}
```

## Resume learning

`GET /api/learning/sessions?status=active`

Returns compact session cards for My Learning. It must not return full conversation histories.

## Read and edit memory

- `GET /api/memories`
- `PATCH /api/memories/:memoryId`
- `DELETE /api/memories/:memoryId`

Edits create an audit event. Deletion should be recoverable during an agreed grace period if policy permits.

## Error shape

```json
{
  "error": {
    "code": "MODEL_UNAVAILABLE",
    "message": "Faraday could not prepare the next step. Please try again.",
    "retryable": true,
    "requestId": "req_abc"
  }
}
```

Never send provider errors, stack traces, prompts, or secrets to the browser.
