---

name: ship-check
description: Checks an app is ready to go live and fixes what isn't, including the build, settings and secret keys, first-visit and error states, link previews, phone layout and dark mode. Use before launching or when a launch fails.

---

# Ship check

## Also check

- The page looks good when shared in a group chat

## Checklist

1. The app builds for the live site with no errors.
2. Every setting and key the app needs is added on the hosting service, for both the live site and any preview links.
3. Secret keys never appear in code the browser can see. Only keys meant to be public may.
4. A first-time visitor sees a working app, even with no data and a slow connection.
5. If the database is down, people see a clear message, not a blank page.
6. The page has a title, a description, link preview text and a small icon for the browser tab.
7. Refreshing any page works.
8. It works on a phone and in dark mode, and the color-contrast skill passes if it's installed.
9. No errors in the browser's console.

## Then

Fix problems one at a time and tell me in plain words what each fix was. Then guide me through launching using button names, not terminal commands.
