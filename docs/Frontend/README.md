# Frontend

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Clerk React/Next.js components

## Route map

| Route | Purpose | Current status |
|---|---|---|
| `/` | Marketing site | Implemented |
| `/about`, `/privacy`, `/terms` | Information pages | Implemented |
| `/sign-in`, `/sign-up` | Clerk authentication | Implemented |
| `/dashboard` | Learning home and continuation cards | Prototype |
| `/dashboard/learn` | Topic setup and adaptive lesson demo | Prototype |
| `/dashboard/lessons` | Learning paths | Prototype |
| `/dashboard/suggested` | Personalized recommendations | Prototype |
| `/dashboard/progress` | Mastery and gaps | Prototype |
| `/dashboard/tests` | Test modes and feedback dialog | Prototype |
| `/dashboard/memory` | Inspect and edit learner memories | Prototype |
| `/dashboard/settings` | Learner preferences | Prototype |

Dashboard routes are protected by Clerk through `components/student-page.tsx`.

## Component responsibilities

| Component | Responsibility |
|---|---|
| `site-nav.tsx` | Public navigation, authentication actions, theme control |
| `site-footer.tsx` | Shared public footer |
| `info-page.tsx` | Layout for About, Privacy, and Terms |
| `student-page.tsx` | Authenticated dashboard entry and learner name loading |
| `learning-experience.tsx` | Dashboard shell, sidebar, shared cards, and route composition |
| `prototype-pages.tsx` | Interactive browser-only topic, test, memory, and settings demos |
| `theme-toggle.tsx` | Persistent and synchronized light/dark selection |

`home-dashboard.tsx` is a previous dashboard implementation and is not mounted by the current route. Do not add features to it without first deciding whether it should be removed or restored.

## State rules

### Current prototype

- React component state powers lesson choices, dialogs, answers, test feedback, memory edits, and settings.
- The theme preference is the only browser-persisted UI state.
- A refresh resets all lesson, test, memory, and progress demonstrations.

### Target behavior

- Server data is the source of truth for lessons, mastery, and memory.
- Local state is limited to drafts, selection state, optimistic feedback, open dialogs, and streamed text.
- Server responses use typed UI blocks rather than returning arbitrary HTML.

## Planned lesson rendering contract

The frontend should support a small, explicit set of blocks:

```ts
type LessonBlock =
  | { type: "teacher_message"; text: string }
  | { type: "choice_question"; prompt: string; choices: Choice[] }
  | { type: "free_response"; prompt: string; placeholder: string }
  | { type: "explanation"; title: string; body: string; analogy?: string }
  | { type: "feedback"; tone: "success" | "hint" | "retry"; text: string }
  | { type: "lesson_complete"; summary: string; nextTopic?: string };
```

Never render model-generated markup directly.

## Accessibility expectations

- Every input has a visible label or accessible name.
- Dialogs use `role="dialog"`, `aria-modal`, Escape handling, and focus management before production release.
- Choice cards are buttons and expose selected state.
- Light and dark themes must retain readable contrast.
- Keyboard flows must work without a pointer.
