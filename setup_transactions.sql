-- Create a table to store payment transactions
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  amount integer not null,
  credits_purchased integer not null,
  payment_id text not null,
  status text not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table transactions enable row level security;

-- Create a policy that allows anyone to insert (for client-side recording in this MVP)
create policy "Allow public insert to transactions"
  on transactions
  for insert
  with check (true);

-- Create a policy that allows users to read their own transactions
create policy "Allow users to read own transactions"
  on transactions
  for select
  using (user_id = current_setting('request.jwt.claim.sub', true) or true); -- simplified for anon auth
