create table if not exists calendar_connections (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  provider text not null default 'google',
  provider_account_email text,
  provider_calendar_id text not null default 'primary',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  sync_token text,
  watch_channel_id text,
  watch_resource_id text,
  watch_expiration timestamptz,
  is_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_calendar_connections_household
  on calendar_connections(household_id);

create table if not exists family_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  title text not null,
  description text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean default false,
  timezone text default 'America/Chicago',
  recurrence text,
  status text default 'confirmed',
  source text default 'familyhub',
  google_html_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_family_events_household
  on family_events(household_id);

create index if not exists idx_family_events_start_at
  on family_events(start_at);

create table if not exists family_event_sync (
  id uuid primary key default gen_random_uuid(),
  family_event_id uuid not null references family_events(id) on delete cascade,
  connection_id uuid not null references calendar_connections(id) on delete cascade,
  provider text not null default 'google',
  provider_calendar_id text not null,
  provider_event_id text not null,
  provider_etag text,
  provider_updated_at timestamptz,
  sync_state text default 'synced',
  last_synced_at timestamptz default now(),
  unique(connection_id, provider_calendar_id, provider_event_id),
  unique(family_event_id, connection_id)
);

create index if not exists idx_family_event_sync_family_event
  on family_event_sync(family_event_id);

create table if not exists calendar_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  connection_id uuid references calendar_connections(id) on delete cascade,
  direction text not null,
  status text not null default 'pending',
  message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_calendar_sync_jobs_household
  on calendar_sync_jobs(household_id);

create table if not exists calendar_webhook_events (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid references calendar_connections(id) on delete cascade,
  channel_id text,
  resource_id text,
  resource_state text,
  message_number text,
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_calendar_webhook_events_connection
  on calendar_webhook_events(connection_id);
