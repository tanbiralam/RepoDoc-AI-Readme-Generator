-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  auth_provider text default 'email'::text,
  github_connected boolean default false,
  subscription_tier text default 'free'::text,
  subscription_status text default 'inactive'::text,
  stripe_customer_id text,
  stripe_subscription_id text,
  readme_generations_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create payments table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount text not null,
  currency text not null default 'USD'::text,
  status text not null,
  description text not null,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create rate limits table
create table if not exists public.rate_limits (
  id uuid default gen_random_uuid() primary key,
  key text not null,
  count integer not null default 0,
  reset_time timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint rate_limits_key_unique unique (key)
);

-- Create GitHub identities table
create table if not exists public.github_identities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  github_id text not null,
  github_username text not null,
  github_email text,
  access_token text not null,
  token_expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint github_identities_github_id_key unique (github_id),
  constraint github_identities_user_id_key unique (user_id)
);

-- Create indexes
create index if not exists idx_profiles_email on public.profiles using btree (email);
create index if not exists idx_profiles_github_connected on public.profiles using btree (github_connected);
create index if not exists idx_github_identities_user_id on public.github_identities using btree (user_id);
create index if not exists idx_github_identities_github_id on public.github_identities using btree (github_id);
create index if not exists idx_github_identities_github_username on public.github_identities using btree (github_username);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.rate_limits enable row level security;
alter table public.github_identities enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

create policy "Users can view their own payments." on public.payments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own payments." on public.payments
  for insert with check (auth.uid() = user_id);

create policy "GitHub identities are viewable by the owner." on public.github_identities
  for select using (auth.uid() = user_id);

create policy "Users can insert their own GitHub identity." on public.github_identities
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own GitHub identity." on public.github_identities
  for update using (auth.uid() = user_id);

create policy "Users can delete their own GitHub identity." on public.github_identities
  for delete using (auth.uid() = user_id);