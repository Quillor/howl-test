-- Howl database. Paste into Supabase: SQL Editor > New query > Run.
-- Anyone can read posts. Signed-in people can post, howl, report and delete their own posts.
-- Nobody can edit posts, and posts are 1 to 280 characters.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (char_length(name) between 2 and 30)
);

-- Sample posts have no account, so they keep their author's name and howl count on the post.
create table public.posts (
  id bigint generated always as identity primary key,
  author_id uuid references public.profiles on delete cascade default auth.uid(),
  author_name text,
  location text,
  text text not null check (char_length(btrim(text)) between 1 and 280),
  sample_howls int not null default 0,
  created_at timestamptz not null default now()
);

create table public.howls (
  post_id bigint references public.posts on delete cascade,
  user_id uuid references auth.users on delete cascade default auth.uid(),
  primary key (post_id, user_id)
);

create table public.reports (
  post_id bigint references public.posts on delete cascade,
  user_id uuid references auth.users on delete cascade default auth.uid(),
  primary key (post_id, user_id)
);

-- New account: save the name they typed when asking for the sign-in link.
create function public.make_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_signup after insert on auth.users
for each row execute function public.make_profile();

-- What the app reads: posts with names and counts, hiding anything with 3 or more reports.
-- The view runs as its owner so it can count reports without showing who reported.
create view public.feed as
select
  p.id,
  coalesce(pr.name, p.author_name) as author,
  p.author_id,
  p.location,
  p.text,
  p.created_at,
  p.sample_howls + (select count(*) from public.howls h where h.post_id = p.id)::int as howls,
  exists (select 1 from public.howls h where h.post_id = p.id and h.user_id = auth.uid()) as howled,
  exists (select 1 from public.reports r where r.post_id = p.id and r.user_id = auth.uid()) as reported
from public.posts p
left join public.profiles pr on pr.id = p.author_id
where (select count(*) from public.reports r where r.post_id = p.id) < 3;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.howls enable row level security;
alter table public.reports enable row level security;

create policy "Anyone can see names" on public.profiles for select using (true);
create policy "People rename themselves" on public.profiles for update using (id = auth.uid());

create policy "Anyone can read posts" on public.posts for select using (true);
create policy "Signed-in people post as themselves" on public.posts for insert to authenticated
  with check (author_id = auth.uid() and author_name is null and sample_howls = 0);
create policy "People delete their own posts" on public.posts for delete to authenticated
  using (author_id = auth.uid());

create policy "Anyone can see howls" on public.howls for select using (true);
create policy "Signed-in people howl" on public.howls for insert to authenticated with check (user_id = auth.uid());
create policy "People take back their howl" on public.howls for delete to authenticated using (user_id = auth.uid());

create policy "People see their own reports" on public.reports for select to authenticated using (user_id = auth.uid());
create policy "Signed-in people report" on public.reports for insert to authenticated with check (user_id = auth.uid());

grant select on public.feed to anon, authenticated;

-- Sample posts, so the live site isn't empty on day one.
insert into public.posts (author_id, author_name, location, text, sample_howls, created_at) values
  (null, 'maya_t', 'Brickyard', 'Free pizza outside the Brickyard for anyone who stops by the robotics club table. Go before it is gone!', 24, now() - interval '2 hours'),
  (null, 'jordan.k', 'Hunt Library', 'Floor 4 of Hunt is dead silent right now. Perfect for studying for the CSC 216 exam.', 9, now() - interval '3 hours'),
  (null, 'priya_s', 'Talley Student Union', 'The Talley line at Port City Java is out the door again. Worth it for the iced latte, honestly.', 31, now() - interval '5 hours'),
  (null, 'wolfpack_will', 'Carter-Finley Stadium', 'GAME DAY. Tailgate lot opens at 8am and I am already in a red jacket. Let''s go Pack!', 57, now() - interval '24 hours'),
  (null, 'emily.r', 'Centennial Campus', 'Took the Wolfline to Centennial for the first time and wow, it is a totally different vibe over here.', 14, now() - interval '25 hours'),
  (null, 'aaliyah_m', 'Lake Raleigh', 'Sunset at Lake Raleigh tonight was unreal. Highly recommend a walk after your last class.', 40, now() - interval '48 hours'),
  (null, 'lucia_v', null, 'Why is it always either 85 degrees or freezing in Raleigh in October? I am so confused about what to wear.', 7, now() - interval '120 hours');
