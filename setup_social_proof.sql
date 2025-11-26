-- Create a table to store social proof examples (Target + User = Result)
create table if not exists social_proof (
  id uuid default gen_random_uuid() primary key,
  target_image_url text not null,
  user_image_url text not null,
  result_image_url text not null,
  label text,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table social_proof enable row level security;

-- Create a policy that allows public read access
create policy "Allow public read access to social_proof"
  on social_proof
  for select
  using (true);

-- Insert some initial seed data
insert into social_proof (target_image_url, user_image_url, result_image_url, label, sort_order)
values
  ('https://picsum.photos/id/1025/400/600', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces', 'https://picsum.photos/id/1025/400/600', 'Neon Runner', 1),
  ('https://picsum.photos/id/1011/400/600', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces', 'https://picsum.photos/id/1011/400/600', 'Monsoon Love', 2),
  ('https://picsum.photos/id/1036/400/600', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces', 'https://picsum.photos/id/1036/400/600', 'Summit', 3);
