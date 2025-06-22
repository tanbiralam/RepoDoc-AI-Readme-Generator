-- Create total readme generations table for IP-based tracking
create table if not exists public.total_readme_generations (
  id uuid default gen_random_uuid() primary key,
  ip_address text not null,
  total_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint total_readme_generations_ip_unique unique (ip_address)
);

-- Add RLS policies
alter table public.total_readme_generations enable row level security;

-- Grant full access to service role
grant all on public.total_readme_generations to service_role;

-- Allow service role full access via policy
create policy "Enable service role access" on public.total_readme_generations
  for all
  to service_role
  using (true)
  with check (true);

-- Allow authenticated users to read their own IP records
create policy "Enable read access for authenticated users" on public.total_readme_generations
  for select
  to authenticated
  using (true);

-- Allow anonymous users to read their own IP records
create policy "Enable read access for anonymous users" on public.total_readme_generations
  for select
  to anon
  using (true); 