create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  grade_level smallint not null check (grade_level between 8 and 12),
  pilot_consent_at timestamptz not null,
  preferred_style text not null check (preferred_style in ('sports', 'practical', 'story', 'space', 'game-like', 'direct')),
  preferred_format text not null default 'real_examples' check (preferred_format in ('visual_cards', 'real_examples', 'step_by_step', 'video_style')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  topic text not null check (char_length(topic) between 1 and 160),
  selected_subtopic_id text,
  selected_subtopic_label text,
  style text not null check (style in ('sports', 'practical', 'story', 'space', 'game-like', 'direct')),
  declared_level text not null check (declared_level in ('new', 'some_knowledge', 'test_me', 'revise')),
  content_format text not null default 'real_examples' check (content_format in ('visual_cards', 'real_examples', 'step_by_step', 'video_style')),
  phase text not null check (phase in ('choose_subtopic', 'diagnose', 'teach', 'check_understanding', 'choose_next', 'complete')),
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  summary text not null default '',
  current_teacher_message text not null default '',
  current_ui jsonb not null default '{}'::jsonb,
  progress_status text not null default 'exploring' check (progress_status in ('exploring', 'learning', 'needs_review', 'confident')),
  progress_confidence smallint not null default 0 check (progress_confidence between 0 and 100),
  model_id text not null,
  prompt_version text not null default 'pilot-v1',
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists learning_sessions_user_active_idx on public.learning_sessions(user_id, status, last_active_at desc);

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

create table if not exists public.concept_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  session_id uuid not null references public.learning_sessions(id) on delete cascade,
  concept_key text not null,
  concept_label text not null,
  status text not null default 'exploring' check (status in ('exploring', 'learning', 'needs_review', 'confident')),
  confidence smallint not null default 0 check (confidence between 0 and 100),
  correct_checks smallint not null default 0,
  last_evidence text not null default 'none',
  updated_at timestamptz not null default now(),
  unique(session_id, concept_key)
);

create table if not exists public.student_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  type text not null check (type in ('preference', 'interest', 'goal', 'misconception', 'strategy_success')),
  content text not null check (char_length(content) between 1 and 220),
  normalized_content text not null,
  confidence numeric(3,2) not null check (confidence between 0 and 1),
  source_session_id uuid references public.learning_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  unique(user_id, type, normalized_content)
);

alter table public.app_users enable row level security;
alter table public.student_profiles enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.lesson_turns enable row level security;
alter table public.concept_progress enable row level security;
alter table public.student_memories enable row level security;

-- No browser policies are intentionally created. The server uses the secret key,
-- then scopes every query to the authenticated Clerk user.
