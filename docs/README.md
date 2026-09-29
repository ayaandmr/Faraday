# Faraday documentation

This folder is the source of truth for how Faraday is designed and how contributors should work on it.

Faraday is currently a **frontend prototype**. Authentication, routing, and theme switching are real. Lesson generation, student memory, mastery tracking, recommendations, and tests currently use browser-only mock state. Do not describe a planned backend feature as implemented.

## Recommended reading order

1. [`architecture.md`](architecture.md) — the complete system and request flow.
2. [`Frontend/README.md`](Frontend/README.md) — routes, components, state, and UI conventions.
3. [`Backend/README.md`](Backend/README.md) — the planned server boundaries and implementation order.
4. [`Backend/learning-engine.md`](Backend/learning-engine.md) — how the personal teacher will decide what happens next.
5. [`Dev/getting-started.md`](Dev/getting-started.md) — local setup and validation commands.
6. [`Dev/contributing.md`](Dev/contributing.md) — project rules and definition of done.

## Status language

Every document uses these terms consistently:

- **Implemented** — exists and can be exercised in the current application.
- **Prototype** — interactive UI backed by hardcoded or in-memory browser data.
- **Planned** — architecture agreed in principle but not implemented.
- **Decision pending** — the team must choose a provider or approach before implementation.

## Documentation map

```text
docs/
├── README.md
├── architecture.md
├── Frontend/
│   ├── README.md
│   └── design-system.md
├── Backend/
│   ├── README.md
│   ├── api-contracts.md
│   ├── data-model.md
│   └── learning-engine.md
└── Dev/
    ├── getting-started.md
    └── contributing.md
```

When behavior changes, update the relevant document in the same change as the code.
