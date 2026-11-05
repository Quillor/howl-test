-- Adds photos to posts: columns on posts, a public post-photos bucket, and sample campus photos.

alter table public.posts
  add column image_url text,
  add column image_alt text check (char_length(btrim(image_alt)) between 1 and 300),
  add column image_width int check (image_width between 1 and 10000),
  add column image_height int check (image_height between 1 and 10000),
  add column image_credit text,
  add column image_credit_url text,
  add constraint photo_needs_description check ((image_url is null) = (image_alt is null));

-- People can only attach photos they uploaded to their own folder, and can't fake a photo credit.
drop policy "Signed-in people post as themselves" on public.posts;
create policy "Signed-in people post as themselves" on public.posts for insert to authenticated
  with check (
    author_id = auth.uid() and author_name is null and sample_howls = 0
    and image_credit is null and image_credit_url is null
    and (image_url is null or image_url like 'https://yfgiankuswodcnzirrcy.supabase.co/storage/v1/object/public/post-photos/' || auth.uid()::text || '/%')
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
  (select count(*) from public.comments c where c.post_id = p.id)::int as comments,
  p.image_url, p.image_alt, p.image_width, p.image_height, p.image_credit, p.image_credit_url
from public.posts p
left join public.profiles pr on pr.id = p.author_id
where (select count(*) from public.reports r where r.post_id = p.id) < 3;

-- Photo storage: anyone can view, people add and remove only in their own folder. Up to 5 MB, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-photos', 'post-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "People upload photos to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'post-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "People delete their own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'post-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Sample photos: real NC State places from Wikimedia Commons, served from the app's /photos folder.
update public.posts p set
  image_url = v.url, image_alt = v.alt, image_width = v.w, image_height = v.h, image_credit = v.credit, image_credit_url = v.credit_url
from (values
  ('maya_t', '/photos/brickyard.jpg', 'The Brickyard, a wide plaza of red and gray brick patterns with trees and students crossing', 1200, 799, 'Surrahwall, CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Brickyard.JPG'),
  ('jordan.k', '/photos/hunt-commons.jpg', 'Bright study area inside Hunt Library with tall windows, red couches and students at tables', 1200, 800, 'Seannator, CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Hunt_Library_Commons_Area.JPG'),
  ('priya_s', '/photos/talley.jpg', 'Talley Student Union with red umbrellas on the patio and a green lawn in front', 1200, 773, 'Abbylabar, CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Talley_Student_Union.JPG'),
  ('wolfpack_will', '/photos/carter-finley.jpg', 'Aerial view of a packed Carter-Finley Stadium in red, with tailgate lots full of cars', 1200, 803, 'SMaloney, CC BY 3.0', 'https://commons.wikimedia.org/wiki/File:Carter-Finley_Stadium_1.jpg'),
  ('aaliyah_m', '/photos/hunt-rooftop-sunset.jpg', 'Sunset over Lake Raleigh from the Hunt Library rooftop terrace, with empty café tables', 1200, 900, 'Rhododendrites, CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:NCSU_Hunt_Library_rooftop_study_area_2013-01.jpg')
) as v(author, url, alt, w, h, credit, credit_url)
where p.author_name = v.author and p.author_id is null;

insert into public.posts (author_id, author_name, text, sample_howls, created_at, image_url, image_alt, image_width, image_height, image_credit, image_credit_url) values
  (null, 'kai_n', 'Someone repainted the whole Free Expression Tunnel red and white overnight. It looks incredible right now, go see it before it changes again.', 19, now() - interval '6 hours', '/photos/free-expression-tunnel.jpg', 'Students walking through the Free Expression Tunnel, its walls covered in red and white paint', 1200, 900, 'Ducttapeavenger, Public domain', 'https://commons.wikimedia.org/wiki/File:Freeexpressiontunnel-ncsu.jpg'),
  (null, 'devon_b', 'Does anyone know if the Hill Library 24-hour floors are open during finals week? Asking for my sleep schedule.', 6, now() - interval '30 hours', '/photos/dh-hill.jpg', 'The red brick tower of D. H. Hill Jr. Library above the Brickyard on a sunny day', 1200, 799, 'Surrahwall, CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:D.H._Hill_Library.JPG'),
  (null, 'hannah_l', 'Tradition check: I finally walked under the Belltower and I am supposed to avoid graduating late now, right?', 11, now() - interval '72 hours', '/photos/belltower.jpg', 'The Memorial Belltower framed by pink and white blossoming trees under a blue sky', 1200, 798, 'Suzie Tremmel from Raleigh, USA, CC BY 2.0', 'https://commons.wikimedia.org/wiki/File:Belltower_ncsu.jpg');
