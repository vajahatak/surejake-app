-- Applied to the surejake-app Supabase project on 13 Nov 2026.
create table profiles (
  id text primary key,
  kind text not null check (kind in ('creator','fan','brand')),
  handle text not null,
  name text not null,
  category text,
  tier text,
  bio text,
  avatar text,
  cover text,
  fans int not null default 0,
  posts_count int not null default 0,
  balance int not null default 0,
  sort int not null default 100
);
create table posts (
  id bigserial primary key,
  creator_id text not null references profiles(id) on delete cascade,
  kind text not null default 'photo',
  title text,
  caption text,
  media text,
  access text not null default 'everyone',
  price int not null default 0,
  views int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  boosted boolean not null default false,
  promoted boolean not null default false,
  created_at timestamptz not null default now()
);
create table follows (fan_id text references profiles(id) on delete cascade, creator_id text references profiles(id) on delete cascade, created_at timestamptz not null default now(), primary key (fan_id, creator_id));
create table subscriptions (fan_id text references profiles(id) on delete cascade, creator_id text references profiles(id) on delete cascade, plan text not null, price int not null, created_at timestamptz not null default now(), primary key (fan_id, creator_id));
create table unlocks (fan_id text references profiles(id) on delete cascade, post_id bigint references posts(id) on delete cascade, created_at timestamptz not null default now(), primary key (fan_id, post_id));
create table tips (id bigserial primary key, fan_id text references profiles(id) on delete cascade, creator_id text references profiles(id) on delete cascade, amount int not null, note text, created_at timestamptz not null default now());
create table transactions (id bigserial primary key, user_id text references profiles(id) on delete cascade, title text not null, subtitle text, amount int not null, usd numeric(10,2), created_at timestamptz not null default now());
create table tool_runs (id bigserial primary key, creator_id text references profiles(id) on delete cascade, post_id bigint references posts(id) on delete set null, tool text not null, hours int, price numeric(10,2) not null, created_at timestamptz not null default now());

alter table profiles enable row level security;
alter table posts enable row level security;
alter table follows enable row level security;
alter table subscriptions enable row level security;
alter table unlocks enable row level security;
alter table tips enable row level security;
alter table transactions enable row level security;
alter table tool_runs enable row level security;
-- Demo app: everything is readable, all writes go through the functions in 002.
create policy "read all" on profiles for select using (true);
create policy "read all" on posts for select using (true);
create policy "read all" on follows for select using (true);
create policy "read all" on subscriptions for select using (true);
create policy "read all" on unlocks for select using (true);
create policy "read all" on tips for select using (true);
create policy "read all" on transactions for select using (true);
create policy "read all" on tool_runs for select using (true);
