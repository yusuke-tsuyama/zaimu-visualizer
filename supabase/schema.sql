cat > supabase/schema.sql << 'EOF'
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create table if not exists analysis_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  company_name text not null,
  fiscal_year_start integer,
  fiscal_year_end integer,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists financial_statements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references analysis_projects(id) on delete cascade,
  fiscal_year integer not null,
  revenue bigint,
  operating_profit bigint,
  ordinary_profit bigint,
  net_income bigint,
  total_assets bigint,
  total_liabilities bigint,
  net_assets bigint,
  equity_ratio numeric(8,2),
  operating_cf bigint,
  investing_cf bigint,
  financing_cf bigint,
  free_cf bigint,
  roe numeric(8,2),
  roa numeric(8,2),
  operating_margin numeric(8,2),
  unit text default '百万円',
  statement_type text default '連結',
  source_file_name text,
  created_at timestamptz default now()
);

create table if not exists ai_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references analysis_projects(id) on delete cascade,
  summary text,
  growth_comment text,
  profitability_comment text,
  safety_comment text,
  cashflow_comment text,
  investment_comment text,
  risk_comment text,
  created_at timestamptz default now()
);

create table if not exists uploaded_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references analysis_projects(id) on delete cascade,
  file_name text not null,
  storage_path text,
  fiscal_year integer,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table analysis_projects enable row level security;
alter table financial_statements enable row level security;
alter table ai_comments enable row level security;
alter table uploaded_files enable row level security;

create policy "profiles: own row" on profiles for all using (auth.uid() = id);
create policy "projects: own rows" on analysis_projects for all using (auth.uid() = user_id);
create policy "statements: own project" on financial_statements for all
  using (project_id in (select id from analysis_projects where user_id = auth.uid()));
create policy "comments: own project" on ai_comments for all
  using (project_id in (select id from analysis_projects where user_id = auth.uid()));
create policy "files: own project" on uploaded_files for all
  using (project_id in (select id from analysis_projects where user_id = auth.uid()));

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated_at
  before update on analysis_projects
  for each row execute function update_updated_at();

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
EOF
