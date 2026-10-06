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
| `/dashboard` | Learning home and saved chapter-map continuation cards | Live data |
| `/dashboard/learn` | Context questions, editable chapter map, and adaptive lesson | Live data |
| `/dashboard/lessons` | Active, completed, and suggested lessons | Live data |
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
| `learning-experience.tsx` | Dashboard shell, shared cards, and route composition |
| `dashboard-sidebar.tsx` | Reusable navigation, account, and theme controls for dashboard routes |
| `chapter-map.tsx` | Simplified chapter and subtopic titles with visual progress |
| `core-learning-session.tsx` | Topic setup, plan approval, one-check-per-step teaching, and basic/advanced navigation |
| `prototype-pages.tsx` | Interactive browser-only topic, test, memory, and settings demos |
| `theme-toggle.tsx` | Persistent and synchronized light/dark selection |

`home-dashboard.tsx` is a previous dashboard implementation and is not mounted by the current route. Do not add features to it without first deciding whether it should be removed or restored.

## State rules

### Current behavior

- The chapter plan, lesson turns, and progress are saved server-side. A refresh restores the same plan or lesson from its session ID.
- React state holds unsent one-question-at-a-time intake answers, the temporary topic-specific question, follow-up drafts, busy states, and plan-change text. Saved style and format are not asked again for returning students.
- Tests and progress pages remain prototypes; lesson and memory pages have live data.

### Target behavior

- Server data is the source of truth for lessons, mastery, and memory.
- Local state is limited to drafts, selection state, optimistic feedback, open dialogs, and streamed text.
- Server responses use typed UI blocks rather than returning arbitrary HTML.

## Lesson rendering contract

The frontend should support a small, explicit set of blocks:

```ts
type LessonUi =
  | { type: "plan_preview"; plan: LearningPlan; context: LearningContext }
  | { type: "teaching_cards"; title: string; cards: TeachingCard[]; plan: LearningPlan; stepIndex: number; stage: "basic" | "advanced" }
  | { type: "step_check"; check: StepCheck; plan: LearningPlan; stepIndex: number; stage: "basic" | "advanced"; skippedSteps?: string[] }
  | { type: "lesson_complete"; summary: string; plan: LearningPlan; stage: "basic" | "advanced"; canAdvance?: boolean };
```

Never render model-generated markup directly.

## Accessibility expectations

- Every input has a visible label or accessible name.
- Dialogs use `role="dialog"`, `aria-modal`, Escape handling, and focus management before production release.
- Choice cards are buttons and expose selected state.
- Light and dark themes must retain readable contrast.
- Keyboard flows must work without a pointer.
