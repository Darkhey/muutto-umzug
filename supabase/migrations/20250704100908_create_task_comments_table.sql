
create table task_comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  comment_text text not null,
  created_at timestamp with time zone default now()
);

alter table task_comments enable row level security;

create policy "Users can view their own task comments" on task_comments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own task comments" on task_comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own task comments" on task_comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own task comments" on task_comments
  for delete using (auth.uid() = user_id);
