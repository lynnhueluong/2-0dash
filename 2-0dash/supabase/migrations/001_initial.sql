-- ============================================================
-- 2.0 Collective – Initial Schema Migration
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";


-- ============================================================
-- TABLE: users
-- ============================================================
create table public.users (
  id                  uuid        primary key references auth.users (id) on delete cascade,
  email               text        not null,
  name                text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  current_stage       text        not null default 'inventory',
  profile_completed   boolean     not null default false,
  referral_source     text
);

comment on table  public.users                is 'App-level user profile, mirroring auth.users.';
comment on column public.users.current_stage  is 'Workflow stage the user is currently in: inventory | roadmap | narrative | matches.';
comment on column public.users.profile_completed is 'True once the user has completed all onboarding stages.';


-- ============================================================
-- TABLE: ambition_profiles
-- ============================================================
create table public.ambition_profiles (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references public.users (id) on delete cascade,
  inventory_data       jsonb,
  roadmap_data         jsonb,
  narrative_data       jsonb,
  disambiguated_terms  jsonb,
  computed_tags        jsonb,
  version              int         not null default 1,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table  public.ambition_profiles               is 'Stores the structured output of each coaching stage for a user.';
comment on column public.ambition_profiles.version       is 'Incremented each time the profile is regenerated.';
comment on column public.ambition_profiles.computed_tags is 'Flattened tag set derived from all stage data, used for resource matching.';


-- ============================================================
-- TABLE: resources
-- ============================================================
create table public.resources (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  description      text,
  url              text,
  type             text,                          -- e.g. tool | book | course | community | template
  categories       text[]      not null default '{}',
  career_stages    text[]      not null default '{}',
  identity_tags    text[]      not null default '{}',
  skill_areas      text[]      not null default '{}',
  problem_tags     text[]      not null default '{}',
  pricing          text,                          -- free | freemium | paid | subscription
  submitted_by     uuid        references public.users (id) on delete set null,
  usage_count      int         not null default 0,
  relevance_score  float       not null default 0,
  created_at       timestamptz not null default now()
);

comment on table  public.resources                is 'Curated catalogue of tools, books, courses, and communities.';
comment on column public.resources.type           is 'High-level resource type: tool | book | course | community | template.';
comment on column public.resources.identity_tags  is 'Audience identity tags, e.g. women | BIPOC | first-gen.';
comment on column public.resources.problem_tags   is 'Problem spaces this resource addresses, e.g. impostor-syndrome | networking.';


-- ============================================================
-- TABLE: matches
-- ============================================================
create table public.matches (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.users (id) on delete cascade,
  resource_id   uuid        not null references public.resources (id) on delete cascade,
  matched_at    timestamptz not null default now(),
  match_reason  jsonb,
  match_score   float       not null default 0,
  user_action   text,       -- e.g. saved | dismissed | clicked
  feedback      text
);

comment on table  public.matches             is 'Records every resource surfaced to a user and their subsequent interaction.';
comment on column public.matches.user_action is 'What the user did: saved | dismissed | clicked | null (not yet acted on).';


-- ============================================================
-- TABLE: sessions
-- ============================================================
create table public.sessions (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references public.users (id) on delete cascade,
  stage                text        not null,
  conversation_history jsonb       not null default '[]',
  progress_pct         float       not null default 0,
  started_at           timestamptz not null default now(),
  last_active_at       timestamptz not null default now()
);

comment on table  public.sessions                      is 'Persists the full conversation history for each coaching-stage session.';
comment on column public.sessions.stage                is 'Which coaching stage this session belongs to.';
comment on column public.sessions.progress_pct         is 'Completion percentage 0–100.';
comment on column public.sessions.conversation_history is 'Ordered array of {role, content} message objects.';


-- ============================================================
-- INDEXES
-- ============================================================
create index idx_ambition_profiles_user_id on public.ambition_profiles (user_id);
create index idx_matches_user_id           on public.matches           (user_id);
create index idx_matches_resource_id       on public.matches           (resource_id);
create index idx_sessions_user_id          on public.sessions          (user_id);

-- Array-column GIN indexes for fast tag filtering on resources
create index idx_resources_categories    on public.resources using gin (categories);
create index idx_resources_career_stages on public.resources using gin (career_stages);
create index idx_resources_identity_tags on public.resources using gin (identity_tags);
create index idx_resources_skill_areas   on public.resources using gin (skill_areas);
create index idx_resources_problem_tags  on public.resources using gin (problem_tags);


-- ============================================================
-- UPDATED_AT TRIGGER HELPER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger trg_ambition_profiles_updated_at
  before update on public.ambition_profiles
  for each row execute function public.handle_updated_at();


-- ============================================================
-- AUTO-CREATE USER ON AUTH SIGNUP
-- ============================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ---- users ----
alter table public.users enable row level security;

create policy "users: select own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users: update own row"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent users from inserting/deleting their own auth row directly;
-- the trigger handles inserts and cascade handles deletes.


-- ---- ambition_profiles ----
alter table public.ambition_profiles enable row level security;

create policy "ambition_profiles: select own"
  on public.ambition_profiles for select
  using (auth.uid() = user_id);

create policy "ambition_profiles: insert own"
  on public.ambition_profiles for insert
  with check (auth.uid() = user_id);

create policy "ambition_profiles: update own"
  on public.ambition_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ambition_profiles: delete own"
  on public.ambition_profiles for delete
  using (auth.uid() = user_id);


-- ---- resources (public read, authenticated insert) ----
alter table public.resources enable row level security;

create policy "resources: anyone can read"
  on public.resources for select
  using (true);

create policy "resources: authenticated users can submit"
  on public.resources for insert
  with check (auth.uid() is not null and auth.uid() = submitted_by);

-- Only allow owners to update resources they submitted
create policy "resources: owner can update"
  on public.resources for update
  using (auth.uid() = submitted_by)
  with check (auth.uid() = submitted_by);


-- ---- matches ----
alter table public.matches enable row level security;

create policy "matches: select own"
  on public.matches for select
  using (auth.uid() = user_id);

create policy "matches: insert own"
  on public.matches for insert
  with check (auth.uid() = user_id);

create policy "matches: update own"
  on public.matches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "matches: delete own"
  on public.matches for delete
  using (auth.uid() = user_id);


-- ---- sessions ----
alter table public.sessions enable row level security;

create policy "sessions: select own"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "sessions: insert own"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions: update own"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions: delete own"
  on public.sessions for delete
  using (auth.uid() = user_id);
