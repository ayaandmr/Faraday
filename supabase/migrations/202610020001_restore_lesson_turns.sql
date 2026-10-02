-- Repairs projects where the base SQL was only partially executed.
create table if not exists public.lesson_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.learning_sessions(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  action text not null,
  student_message text,
  teacher_message text not null,
  ui jsonb not null,
  summary text not null,
  model_id text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

create index if not exists lesson_turns_session_created_idx on public.lesson_turns(session_id, created_at desc);
create index if not exists lesson_turns_expiry_idx on public.lesson_turns(expires_at);
alter table public.lesson_turns enable row level security;
