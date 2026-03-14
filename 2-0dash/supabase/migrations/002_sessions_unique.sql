-- ============================================================
-- 002: Add UNIQUE(user_id, stage) to sessions
-- Required for upsert ON CONFLICT (user_id, stage) to work
-- ============================================================

alter table public.sessions
  add constraint sessions_user_id_stage_key unique (user_id, stage);
