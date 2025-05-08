create table public.payments (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  stripe_session_id text null,
  stripe_payment_intent_id text null,
  amount text not null,
  currency text not null default 'USD'::text,
  status text not null,
  description text not null,
  receipt_url text null,
  created_at timestamp with time zone null default now(),
  constraint payments_pkey primary key (id),
  constraint payments_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  email text null,
  full_name text null,
  avatar_url text null,
  auth_provider text null default 'email'::text,
  github_username text null,
  github_connected boolean null default false,
  github_connecting boolean null default false,
  subscription_tier text null default 'free'::text,
  subscription_status text null default 'inactive'::text,
  stripe_customer_id text null,
  stripe_subscription_id text null,
  readme_generations_count integer null default 0,
  password_reset_token text null,
  password_reset_token_expires_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.payments enable row level security;

-- Profile policies
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Service role can manage all profiles"
on public.profiles
using (auth.role() = 'service_role');

-- Payment policies
create policy "Users can view their own payments"
on public.payments for select
using (auth.uid() = user_id);

create policy "Service role can manage all payments"
on public.payments
using (auth.role() = 'service_role');