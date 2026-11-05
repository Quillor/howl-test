-- Howl database. Paste into Supabase: SQL Editor > New query > Run.
-- Anyone can read posts, photos, comments and events. Signed-in people can post, howl, comment, report,
-- say they're going to events and delete their own posts.
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
  created_at timestamptz not null default now(),
  -- An optional photo. It always needs a description, for people who can't see it.
  image_url text,
  image_alt text check (char_length(btrim(image_alt)) between 1 and 300),
  image_width int check (image_width between 1 and 10000),
  image_height int check (image_height between 1 and 10000),
  image_credit text,
  image_credit_url text,
  constraint photo_needs_description check ((image_url is null) = (image_alt is null))
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

create table public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts on delete cascade,
  author_id uuid references public.profiles on delete cascade default auth.uid(),
  author_name text,
  text text not null check (char_length(btrim(text)) between 1 and 280),
  created_at timestamptz not null default now()
);

-- Campus events. Only the Howl team adds events (in Supabase), so the app can't insert them.
create table public.events (
  id bigint generated always as identity primary key,
  title text not null,
  place text not null,
  details text,
  starts_at timestamptz not null,
  sample_going int not null default 0
);

create table public.event_rsvps (
  event_id bigint references public.events on delete cascade,
  user_id uuid references auth.users on delete cascade default auth.uid(),
  primary key (event_id, user_id)
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
  exists (select 1 from public.reports r where r.post_id = p.id and r.user_id = auth.uid()) as reported,
  (select count(*) from public.comments c where c.post_id = p.id)::int as comments,
  p.image_url, p.image_alt, p.image_width, p.image_height, p.image_credit, p.image_credit_url
from public.posts p
left join public.profiles pr on pr.id = p.author_id
where (select count(*) from public.reports r where r.post_id = p.id) < 3;

-- Comments with the commenter's name.
create view public.comment_list with (security_invoker = true) as
select c.id, c.post_id, coalesce(pr.name, c.author_name) as author, c.author_id, c.text, c.created_at
from public.comments c
left join public.profiles pr on pr.id = c.author_id;

-- Events with how many people are going and whether you are. Runs as its owner to count everyone.
create view public.event_list as
select
  e.id, e.title, e.place, e.details, e.starts_at,
  e.sample_going + (select count(*) from public.event_rsvps r where r.event_id = e.id)::int as going_count,
  exists (select 1 from public.event_rsvps r where r.event_id = e.id and r.user_id = auth.uid()) as going
from public.events e;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.howls enable row level security;
alter table public.reports enable row level security;
alter table public.comments enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

create policy "Anyone can see names" on public.profiles for select using (true);
create policy "People rename themselves" on public.profiles for update using (id = auth.uid());

create policy "Anyone can read posts" on public.posts for select using (true);
-- People can only attach photos they uploaded to their own folder, and can't fake a photo credit.
create policy "Signed-in people post as themselves" on public.posts for insert to authenticated
  with check (
    author_id = auth.uid() and author_name is null and sample_howls = 0
    and image_credit is null and image_credit_url is null
    and (image_url is null or image_url like 'https://yfgiankuswodcnzirrcy.supabase.co/storage/v1/object/public/post-photos/' || auth.uid()::text || '/%')
  );
create policy "People delete their own posts" on public.posts for delete to authenticated
  using (author_id = auth.uid());

create policy "Anyone can see howls" on public.howls for select using (true);
create policy "Signed-in people howl" on public.howls for insert to authenticated with check (user_id = auth.uid());
create policy "People take back their howl" on public.howls for delete to authenticated using (user_id = auth.uid());

create policy "People see their own reports" on public.reports for select to authenticated using (user_id = auth.uid());
create policy "Signed-in people report" on public.reports for insert to authenticated with check (user_id = auth.uid());

create policy "Anyone can read comments" on public.comments for select using (true);
create policy "Signed-in people comment as themselves" on public.comments for insert to authenticated
  with check (author_id = auth.uid() and author_name is null);
create policy "People delete their own comments" on public.comments for delete to authenticated
  using (author_id = auth.uid());

create policy "Anyone can see events" on public.events for select using (true);

create policy "People see their own RSVPs" on public.event_rsvps for select to authenticated using (user_id = auth.uid());
create policy "Signed-in people say they're going" on public.event_rsvps for insert to authenticated with check (user_id = auth.uid());
create policy "People change their mind" on public.event_rsvps for delete to authenticated using (user_id = auth.uid());

-- Photo storage: anyone can view, people add and remove only in their own folder. Up to 5 MB, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-photos', 'post-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "People upload photos to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'post-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "People delete their own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'post-photos' and (storage.foldername(name))[1] = auth.uid()::text);

grant select on public.feed to anon, authenticated;
grant select on public.comment_list to anon, authenticated;
grant select on public.event_list to anon, authenticated;

-- Sample posts, so the live site isn't empty on day one.
insert into public.posts (author_id, author_name, location, text, sample_howls, created_at) values
  (null, 'maya_t', 'Brickyard', 'Free pizza outside the Brickyard for anyone who stops by the robotics club table. Go before it is gone!', 24, now() - interval '2 hours'),
  (null, 'jordan.k', 'Hunt Library', 'Floor 4 of Hunt is dead silent right now. Perfect for studying for the CSC 216 exam.', 9, now() - interval '3 hours'),
  (null, 'priya_s', 'Talley Student Union', 'The Talley line at Port City Java is out the door again. Worth it for the iced latte, honestly.', 31, now() - interval '5 hours'),
  (null, 'wolfpack_will', 'Carter-Finley Stadium', 'GAME DAY. Tailgate lot opens at 8am and I am already in a red jacket. Let''s go Pack!', 57, now() - interval '24 hours'),
  (null, 'emily.r', 'Centennial Campus', 'Took the Wolfline to Centennial for the first time and wow, it is a totally different vibe over here.', 14, now() - interval '25 hours'),
  (null, 'aaliyah_m', 'Lake Raleigh', 'Sunset at Lake Raleigh tonight was unreal. Highly recommend a walk after your last class.', 40, now() - interval '48 hours'),
  (null, 'lucia_v', null, 'Why is it always either 85 degrees or freezing in Raleigh in October? I am so confused about what to wear.', 7, now() - interval '120 hours');

-- Sample photos for the posts above: see add-photos.sql.
