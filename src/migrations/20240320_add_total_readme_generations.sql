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

create policy "Enable read access for all users" on public.total_readme_generations
  for select using (true);

create policy "Enable insert for service role only" on public.total_readme_generations
  for insert with check (auth.role() = 'service_role');

create policy "Enable update for service role only" on public.total_readme_generations
  for update using (auth.role() = 'service_role'); 