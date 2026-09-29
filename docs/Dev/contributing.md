# Contributing

## Before changing code

1. Read [`../architecture.md`](../architecture.md).
2. Identify whether the task is prototype UI or production behavior.
3. Check `git status` and preserve unrelated local work.
4. Keep the change inside the requested scope.

## Prototype-first rule

Faraday is currently optimized for a convincing, quickly shippable prototype. Unless the task explicitly starts backend implementation:

- Use mock data and local component state.
- Do not add a database, model SDK, storage service, or background worker.
- Keep interactions realistic enough to demonstrate the intended product.
- Label behavior accurately in documentation and handoff notes.

Once backend implementation is explicitly requested, replace one mock flow at a time with an end-to-end vertical slice. Avoid partially wiring every page simultaneously.

## Code conventions

- Keep route files small; move reusable behavior into components or server modules.
- Use TypeScript types at API and model boundaries.
- Prefer explicit UI block types over arbitrary model output.
- Keep secrets and privileged SDKs in server-only modules.
- Reuse theme-aware classes and verify both light and dark modes.
- Preserve accessibility names, labels, keyboard operation, and focus states.
- Update documentation when a planned feature becomes implemented.

## Required checks

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

For UI work, manually check:

- Public landing page in light and dark modes
- Mobile and desktop navigation
- Every affected dashboard route
- Empty, loading, success, and error states where applicable
- Keyboard access for dialogs and choices

## Git policy

- Keep changes local unless the user explicitly requests a specific commit or push.
- Do not stage unrelated files, generated logs, environment files, or accidental artifacts.
- Never discard another contributor's changes to clean the worktree.
- Use focused commit messages that describe the product change.

## Definition of done

A change is done when:

- The requested behavior works.
- Existing relevant behavior still works.
- Validation passes.
- Secrets and private student data are not exposed.
- Current versus planned behavior is documented accurately.
- Another developer can understand the decision without reconstructing it from chat history.
