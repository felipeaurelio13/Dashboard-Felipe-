create extension if not exists "pgcrypto";

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  cash_today numeric(14,2),
  cash_30d numeric(14,2),
  critical_ar text,
  blockers text[] default '{}',
  risks text[] default '{}',
  decisions text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

create table if not exists public.weekly_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  key text not null,
  actual numeric(14,2),
  plan numeric(14,2),
  note text,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, week_start, key)
);

create table if not exists public.close_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  task_key text not null,
  owner text,
  due_date date,
  status text not null default 'todo',
  evidence_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, month_key, task_key)
);

create table if not exists public.decision_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  decision text not null,
  context text,
  options text,
  owner text,
  due_date date,
  status text not null default 'open',
  link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.risk_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  risk text not null,
  category text,
  impact int not null check (impact between 1 and 3),
  probability int not null check (probability between 1 and 3),
  mitigation text,
  owner text,
  review_date date,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  variance_green_pct int not null default 5,
  variance_yellow_pct int not null default 10,
  cash_warning_threshold numeric(14,2) not null default 0,
  default_currency text not null default 'CLP',
  reminder_daily boolean not null default false,
  reminder_weekly boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cash_forecasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  beginning_cash numeric(14,2) not null default 0,
  inflow_sales numeric(14,2) not null default 0,
  inflow_other numeric(14,2) not null default 0,
  outflow_payroll numeric(14,2) not null default 0,
  outflow_vendors numeric(14,2) not null default 0,
  outflow_taxes numeric(14,2) not null default 0,
  outflow_other numeric(14,2) not null default 0,
  ending_cash numeric(14,2) generated always as (beginning_cash + inflow_sales + inflow_other - outflow_payroll - outflow_vendors - outflow_taxes - outflow_other) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, week_start)
);

create table if not exists public.opex_variances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  category text not null,
  actual numeric(14,2) not null default 0,
  plan numeric(14,2) not null default 0,
  driver text,
  owner text,
  action text,
  due_date date,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, week_start, category)
);

create table if not exists public.pipeline_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer text not null,
  type text,
  amount numeric(14,2) not null default 0,
  currency text not null default 'CLP',
  probability int not null default 10,
  stage text not null default 'Lead',
  next_step text,
  next_step_date date,
  close_date date,
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client text not null,
  revenue numeric(14,2) not null default 0,
  gm_pct numeric(5,2),
  status text not null default 'green',
  main_risk text,
  next_milestone text,
  needs_from_ceo text,
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_entries enable row level security;
alter table public.weekly_metrics enable row level security;
alter table public.close_tasks enable row level security;
alter table public.decision_logs enable row level security;
alter table public.risk_logs enable row level security;
alter table public.user_settings enable row level security;
alter table public.cash_forecasts enable row level security;
alter table public.opex_variances enable row level security;
alter table public.pipeline_deals enable row level security;
alter table public.projects enable row level security;

create policy "user_owns_row" on public.daily_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.weekly_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.close_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.decision_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.risk_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.cash_forecasts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.opex_variances for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.pipeline_deals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_owns_row" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
