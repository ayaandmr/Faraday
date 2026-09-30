alter table public.student_profiles
  add column if not exists preferred_format text not null default 'real_examples';

alter table public.learning_sessions
  add column if not exists content_format text not null default 'real_examples';

alter table public.student_profiles drop constraint if exists student_profiles_preferred_format_check;
alter table public.student_profiles add constraint student_profiles_preferred_format_check
  check (preferred_format in ('visual_cards', 'real_examples', 'step_by_step', 'video_style'));

alter table public.learning_sessions drop constraint if exists learning_sessions_content_format_check;
alter table public.learning_sessions add constraint learning_sessions_content_format_check
  check (content_format in ('visual_cards', 'real_examples', 'step_by_step', 'video_style'));

alter table public.learning_sessions drop constraint if exists learning_sessions_declared_level_check;
alter table public.learning_sessions add constraint learning_sessions_declared_level_check
  check (declared_level in ('new', 'some_knowledge', 'test_me', 'revise'));

alter table public.learning_sessions drop constraint if exists learning_sessions_phase_check;
alter table public.learning_sessions add constraint learning_sessions_phase_check
  check (phase in ('choose_subtopic', 'diagnose', 'teach', 'check_understanding', 'choose_next', 'complete'));
