# Howl design direction

**Source:** round 02, version B "Quiet pill" (`02-late-shift-howl-pill/b-quiet-pill.html`).
No changes were made in Figma, so the built version is the final word.

**How we got here**
- Update: the accent changed from amber to NC State red (`#CC0000`), the school's own color.
- Round 01: three directions. A "Loud" (red, giant wordmark) gave us the Howl reaction. B "Late shift" (true black, amber) gave us the base. C "Howl bar" was too heavy and is not used.
- Round 02: B with A's reaction as a pill, post text raised to 18px, colors unchanged. Version B won: loud and fun, still easy to read.

## How it should feel

Loud, warm, quick. A late-night feed where the newest posts glow. Type does the work; there are no pictures of campus, no decoration. NC State shows up through the words and the energy of the posts.

## Colors

| Role | Value | Use |
|---|---|---|
| Black | `#000000` | Background |
| Text | `#F2F2F2` | Posts, names |
| Gray | `#8A8A8A` | Places, times, quiet actions |
| Line | `#2B2B2B` | Thin dividers |
| Chip | `#1C1C1C` | Hover, avatars, disabled |
| Wolfpack red | `#CC0000` | The only accent: NC State's own red. Fresh times, a Howled pill, the Post button. In dark mode, red text uses the lighter `#FF6B6B` so it stays readable. |

## Fonts

- Space Grotesk only.
- Weights: 400 and 700.
- Sizes: 24 wordmark, 18 post text, 16 body, 14 places and times.
- Line spacing 1.5.

## Shapes

- No cards. Posts are rows separated by 1px dividers.
- Round avatars (32px). Pill buttons (44px tall, fully rounded).
- The Howl reaction is a crescent moon plus the word "Howl". It becomes "Howled" and fills red when pressed.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64 only.

## Do

1. Spend red only on what is fresh or pressed.
2. Let type carry each screen, with one bold move.
3. Keep post text at 18px or larger, with 1.5 line spacing.
4. Use Howl, with its crescent, as the reaction everywhere.
5. Keep every tap target at 44px or more, with a clear white focus ring.

## Don't

1. Don't add a second accent color or any gradient.
2. Don't draw campus places: no bricks, buildings or sunsets.
3. Don't use a heart, emoji icons, or cards inside cards.
4. Don't use condensed all-caps poster type.
5. Don't use filler words or labels: "seamless", "Trending now", "Submit".

## Next

Build the design system from this page. The real app in `src/` is not changed yet.
