---

name: design-system-builder
description: Builds or updates a design system of tokens (named colors, text styles, spacing, corners, shadows) with light and dark mode, base components and a tokens file Figma can import. Use when setting up how a project looks, adding dark mode, or when colors and sizes are scattered through the code.

---

# Design system builder

## My preferences

- Name colors: by what they are for, like "background" and "muted text"
- Usual corners: soft corners

## Steps

1. Read the project's design direction notes if there are any. If the project already has colors or styles, build on them.
2. Raw values first: a full range of shades for the main color and for the grays (grays slightly tinted toward the main color look more designed), a small set of text sizes, a spacing scale based on 4px, one corner style, and soft layered shadows.
3. Then name what each value is for: page background, card background, border, main text, muted text, text on the accent color, the accent itself, success, warning and error.
4. Light mode first. Dark mode swaps only the named values. Don't just invert: cards get slightly lighter than the background in dark mode, and the accent may shift to stay readable.
5. Save the tokens in one styles file that the whole app uses, plus a tokens file in the standard design tokens format with Light and Dark modes so it can be imported into Figma variables.
6. Components only use the named tokens. No colors or sizes typed directly into a component.
7. Make a design system page that shows every color, text style, spacing value and component state in both modes.

## Rules

- One accent color used sparingly beats many competing colors.
- Delete tokens nothing uses.
- To change how something looks, change the token, not the component.
- Ask before inventing a brand color or font.
