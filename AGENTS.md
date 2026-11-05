# Notes for AI helpers

## Project
Howl is a social app where NC State students share short posts about campus life.
Built with Vite + React (JavaScript). Run it with `npm run dev`.

- `src/App.jsx` holds the pages, with `PostCard.jsx`, `PostPage.jsx` (a post and its comments), `Events.jsx`, `Icon.jsx` and `App.css` beside it. `src/posts.js` holds the sample posts, comments and events, and `src/postStore.js` is the only place that loads or saves them.
- Pages have real addresses (`/`, `/events`, `/post/12`, `/alerts`, `/profile`) through `src/router.jsx`. New addresses also need a rewrite in `vercel.json`.
- The lesson is published at `/lesson` from `public/lesson/index.html`. Its source lives outside this repo; copy it in when it changes.
- Photos: posts can have one photo with a required description (`src/photo.js` shrinks it first). On the live site photos go to the Supabase `post-photos` bucket, in a folder per person; on previews they're saved in the browser. Sample photos are real NC State places from Wikimedia Commons in `public/photos/`, credited in `public/photos/CREDITS.md` and under each photo. Keep the credit whenever you use one.
- Motion: use the timing tokens and `howl-rise` (cascading fade-in, set `--i` on each item) from `components.css`. Everything stops for people who turn on Reduce Motion.
- `src/postStore.js` uses Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, and the sample posts otherwise. On Vercel, set those two only for Production, so preview links always show sample posts. The tables and rules are in `supabase/schema.sql`; `supabase/add-comments-and-events.sql` adds comments and events to an older database.
- Accounts: people sign in with an email link (`src/SignIn.jsx`). Anyone can read; posting, howling, commenting, reporting and saying you're going to an event need an account. People can delete their own posts from the "…" menu.
- Styling comes from the design system in `src/design-system/` (tokens, components, tokens.json). Use its named tokens only: no raw colors or sizes in components. The main color is NC State red, and every color pair must pass WCAG AA in light and dark mode. The page at `/design-system.html` shows everything.
- The final design direction is `explorations/final-direction.md`.

## Explorations
`explorations/` is where design ideas are tried in numbered rounds (`01`, `02`, `03`, ...).
Work inside a new round's folder and never change the real app in `src/` while exploring. The design is now chosen (round 02, version B), so the real app is being built from the design system.

## About the user
The user is a designer and a beginner who doesn't use the terminal. You run all
commands for them, explain anything technical in one short sentence, and don't ask
technical questions. When a website needs them (login, sign-up, approval), tell
them exactly what to click and wait for them to say "done". Never type their passwords.
