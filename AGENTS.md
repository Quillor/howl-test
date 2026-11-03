# Notes for AI helpers

## Project
Howl is a social app where NC State students share short posts about campus life.
Built with Vite + React (JavaScript). Run it with `npm run dev`.

- `src/App.jsx` is the home screen, with `PostCard.jsx`, `Icon.jsx` and `App.css` beside it. `src/posts.js` holds the sample posts.
- Styling comes from the design system in `src/design-system/` (tokens, components, tokens.json). Use its named tokens only: no raw colors or sizes in components. The page at `/design-system.html` shows everything.
- The final design direction is `explorations/final-direction.md`.

## Explorations
`explorations/` is where design ideas are tried in numbered rounds (`01`, `02`, `03`, ...).
Work inside a new round's folder and never change the real app in `src/` while exploring. The design is now chosen (round 02, version B), so the real app is being built from the design system.

## About the user
The user is a designer and a beginner who doesn't use the terminal. You run all
commands for them, explain anything technical in one short sentence, and don't ask
technical questions. When a website needs them (login, sign-up, approval), tell
them exactly what to click and wait for them to say "done". Never type their passwords.
