# Frontend design system

## Product character

Faraday should feel warm, playful, calm, and observant. It should not resemble a blank chatbot or a formal school administration tool.

## Interaction pattern

Lessons use one small decision at a time:

```text
Short prompt
Choice cards
Optional free-form input at the bottom
Immediate response
One clear next action
```

Always include a safe choice such as “I'm not sure yet.” Avoid large forms and long diagnostic interviews.

## Theme

Theme state is represented by the `dark` class on `<html>` and persisted under `faraday-theme` in `localStorage`. An inline script in `app/layout.tsx` applies the saved or operating-system preference before the page paints.

Theme rules live in `app/globals.css`. New components must be checked in both themes. Prefer existing semantic classes such as `learning-card` and shared theme variables over introducing isolated hardcoded dark overrides.

## Reusable visual vocabulary

- Green: primary action, progress, and positive guidance.
- Yellow: curiosity, next steps, and important invitations.
- Mint: understood or safe learning states.
- Lilac: stories, connections, and creative paths.
- Coral: gaps or concepts needing attention without implying failure.

Color must never be the only indicator of status; include text labels and icons where useful.

## Content style

- Use short, direct headings.
- Ask one question at a time.
- Prefer “Let's try another angle” over “Incorrect.”
- Explain why Faraday recommends a lesson.
- Avoid claiming that the system remembers or understands something unless the stored evidence supports it.
