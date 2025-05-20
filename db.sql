create table public.profiles (
  id uuid not null,
  email text null,
  full_name text null,
  avatar_url text null,
  auth_provider text null default 'email'::text,
  github_username text null,
  github_connected boolean null default false,
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

create table public.rate_limits (
  id uuid not null default gen_random_uuid (),
  key text not null,
  count integer not null default 0,
  reset_time timestamp with time zone not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint rate_limits_pkey primary key (id),
  constraint rate_limits_key_unique unique (key)
) TABLESPACE pg_default;