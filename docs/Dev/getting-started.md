# Getting started

Use Node.js compatible with Next.js 16, npm, a Clerk app, a Supabase project, and a Groq account.

```powershell
npm.cmd install
npm.cmd run dev
```

Copy `.env.example` to `.env.local`; set Clerk keys plus these server-only values:

```dotenv
GROQ_API_KEY=
FARADAY_TEACHER_PROVIDER=groq
FARADAY_TEACHER_MODEL=openai/gpt-oss-20b
SUPABASE_URL=
SUPABASE_SECRET_KEY=
CRON_SECRET=
```

Run every SQL file under `supabase/migrations/` in filename order in the Supabase SQL Editor before starting a real lesson. If the first migration was already applied, run only the newer migrations. Do not commit `.env.local` or any secret.

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

On PowerShell systems that block `npm.ps1`, use `npm.cmd` as above. A Vercel deployment must receive the same server-only variables and will run the daily cleanup cron from `vercel.json`.
