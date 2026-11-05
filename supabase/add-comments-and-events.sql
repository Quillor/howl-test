-- Adds comments and campus events to an existing Howl database.

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


create or replace view public.feed as
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
  (select count(*) from public.comments c where c.post_id = p.id)::int as comments
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


alter table public.comments enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

create policy "Anyone can read comments" on public.comments for select using (true);
create policy "Signed-in people comment as themselves" on public.comments for insert to authenticated
  with check (author_id = auth.uid() and author_name is null);
create policy "People delete their own comments" on public.comments for delete to authenticated
  using (author_id = auth.uid());

create policy "Anyone can see events" on public.events for select using (true);

create policy "People see their own RSVPs" on public.event_rsvps for select to authenticated using (user_id = auth.uid());
create policy "Signed-in people say they're going" on public.event_rsvps for insert to authenticated with check (user_id = auth.uid());
create policy "People change their mind" on public.event_rsvps for delete to authenticated using (user_id = auth.uid());


grant select on public.comment_list to anon, authenticated;
grant select on public.event_list to anon, authenticated;

-- Sample comments and campus events, so the live site has conversations and things to go to on day one.
-- Event dates count from the day you run this.

insert into public.comments (post_id, author_id, author_name, text, created_at)
select p.id, null, c.author, c.text, p.created_at + c.after
from (values
  ('maya_t', 'jordan.k', 'Still pizza left at 1:15? Asking for my whole study group.', interval '6 minutes'),
  ('maya_t', 'maya_t', 'Two boxes of pepperoni left. Run.', interval '9 minutes'),
  ('maya_t', 'devon_b', 'Got the last slice. Thank you, robotics club.', interval '31 minutes'),
  ('jordan.k', 'omar_f', 'Floor 4 is the best kept secret on campus. Please stop telling people.', interval '12 minutes'),
  ('jordan.k', 'hannah_l', 'Good luck on 216! The practice exam is close to the real thing.', interval '40 minutes'),
  ('priya_s', 'emily.r', 'Pro tip: order ahead in the app and skip the whole line.', interval '15 minutes'),
  ('priya_s', 'priya_s', 'There is an app?? Life changing.', interval '18 minutes'),
  ('wolfpack_will', 'nate_g', 'See you in lot 4. We have a grill and too many burgers.', interval '20 minutes'),
  ('wolfpack_will', 'tori_w', 'Wear sunscreen, it is going to be 80 degrees by noon.', interval '55 minutes'),
  ('wolfpack_will', 'ben_o', 'Section 6 is going to be loud today. Go Pack!', interval '90 minutes'),
  ('aaliyah_m', 'lucia_v', 'The colors last night were unreal. Same time tomorrow?', interval '10 minutes'),
  ('aaliyah_m', 'aaliyah_m', 'Always. Bring a jacket though.', interval '22 minutes')
) as c(post_author, author, text, after)
join public.posts p on p.author_name = c.post_author and p.author_id is null;

insert into public.events (title, place, details, starts_at, sample_going) values
  ('Robotics club open lab', 'Engineering Building II', 'Drop in, drive a robot and meet the build team. No experience needed, snacks provided.', (current_date + 1 + time '18:00') at time zone 'America/New_York', 23),
  ('Basketball scrimmage, open to students', 'Reynolds Coliseum', 'Doors open 30 minutes early. Bring your student ID and your loudest voice.', (current_date + 2 + time '19:00') at time zone 'America/New_York', 141),
  ('Resume reviews before the career fair', 'Talley Student Union', 'Bring a printed resume and get notes from recruiters and career coaches in 10 minutes.', (current_date + 3 + time '13:00') at time zone 'America/New_York', 58),
  ('Sunset walk around the lake', 'Lake Raleigh', 'A slow loop around the lake. Meet at the boathouse, leave whenever you like.', (current_date + 4 + time '17:00') at time zone 'America/New_York', 36),
  ('Late-night study session with free coffee', 'Hunt Library', 'Quiet tables, free coffee until midnight and tutors for math and physics.', (current_date + 6 + time '21:00') at time zone 'America/New_York', 87),
  ('Game day tailgate', 'Carter-Finley Stadium', 'Student lot opens at 9. Wear red, bring water and a friend.', (current_date + 8 + time '09:00') at time zone 'America/New_York', 212);
