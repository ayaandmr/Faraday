# Getting started

## Requirements

- Node.js compatible with Next.js 16
- npm
- A Clerk application for authenticated dashboard routes

## Install and run

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`:

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

Do not commit `.env.local` or paste secret values into issues, logs, screenshots, documentation, or chat.

Planned backend variables such as `OPENAI_API_KEY` and `DATABASE_URL` should be added to `.env.example` only when their integrations are implemented.

## Validation

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

All three should pass before requesting review. The `baseline-browser-mapping` age message is currently a warning rather than a build failure.

## Useful locations

```text
app/                    Routes and global styling
components/             Shared and prototype UI
public/brand/            Brand assets
proxy.ts                 Clerk middleware
docs/                    Architecture and contributor documentation
.env.example             Public environment-variable template
```

## Current prototype behavior

- Sign in before visiting dashboard routes.
- Topic, test, memory, and preference changes are temporary React state.
- Reloading clears those prototype changes.
- Theme is persisted in the browser under `faraday-theme`.
- No OpenAI or database request is made.

## Common problems

### Vercel says Ready but the site returns 500

Check that both Clerk keys exist in the Vercel **Production** environment and redeploy. Build readiness does not guarantee middleware can process a request.

### PowerShell refuses to run npm

Use `npm.cmd` or the repository scripts through `node`, rather than changing the machine execution policy just for this project.

### A production build reports `.next/lock`

Confirm that no `next dev` or `next build` process is running before treating the lock as stale. Do not delete build output while another process is active.
