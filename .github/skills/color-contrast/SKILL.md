---

name: color-contrast
description: Checks and fixes color contrast so every screen meets WCAG 2.2 AA in light and dark mode. Use when choosing or changing colors, themes or components, and before launching.

---

# Color contrast (WCAG AA)

## My settings

- Colors that must not change: none

## The bar

- Normal text: contrast of at least 4.5 to 1 against its background.
- Large text (about 24px, or 19px bold): at least 3 to 1.
- Things people need to see, like input borders, icons and focus outlines: at least 3 to 1.
- Placeholder text counts as text.
- Never use color alone to show meaning; add an icon or words.

## Steps

1. List every text and background pair in use, including text on the accent color, hover and selected states, in both light and dark mode.
2. Calculate each one and show me a simple table: where, the ratio, pass or fail.
3. Fix failures by adjusting the shared color tokens, not single components. Keep the same hue so it still feels like the brand.
4. If a color that must not change fails, keep it for big or decorative use and add a darker or lighter version for text.
5. Check again and show the new numbers.

## Rule

Measure, don't guess.
