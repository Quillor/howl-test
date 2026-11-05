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
