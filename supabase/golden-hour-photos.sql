-- Golden-hour versions of the sample photos: new sizes and descriptions. Same files, same posts.
update public.posts p set image_alt = v.alt, image_width = v.w, image_height = v.h
from (values
  ('/photos/belltower.jpg', 'The Memorial Belltower glowing in golden sunset light, framed by pink and white blossoming trees', 1200, 805),
  ('/photos/brickyard.jpg', 'The Brickyard at sunset, with long tree shadows stretching across its red and gray brick patterns', 1200, 805),
  ('/photos/carter-finley.jpg', 'Aerial view of a packed Carter-Finley Stadium in red at golden hour, with tailgate lots full of cars', 1200, 805),
  ('/photos/hunt-commons.jpg', 'Golden sunset light streaming through Hunt Library''s tall windows across the study area and red couches', 1200, 805),
  ('/photos/hunt-rooftop-sunset.jpg', 'An orange and rose sunset over Lake Raleigh from the Hunt Library rooftop terrace, with café tables', 1200, 896),
  ('/photos/talley.jpg', 'Talley Student Union at sunset, with red umbrellas on the patio and long shadows across the lawn', 1200, 805),
  ('/photos/dh-hill.jpg', 'The red brick tower of D. H. Hill Jr. Library glowing orange at sunset above the Brickyard', 1200, 805),
  ('/photos/free-expression-tunnel.jpg', 'Golden sunset light pouring into the Free Expression Tunnel past students and walls painted red', 1200, 896)
) as v(url, alt, w, h)
where p.image_url = v.url and p.author_id is null;
