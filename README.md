# Vault — Face ID banking demo

An iPhone-first web demo: an iOS-style banking app with a Dynamic Island Face ID unlock. Hosted on GitHub Pages.

**Live:** https://izu83.github.io/Face-ID/

## Features

- **Accounts** — create an account or sign in. Accounts live only on the device (`localStorage`);
  passwords are never stored, only a salted PBKDF2 hash. Optional "Sign in with Face ID".
- **Face ID** — a Dynamic Island–style pill drops down, scans, and folds back up. Used to unlock,
  confirm payments and reveal card details. Always succeeds for now (`authenticate()` in `app.js`).
- **Balance** — calculated from your transactions; digits roll from the old to the new amount.
- **Send / Request / Top up** — contact picker and custom keypad. Requests get "paid" a few seconds later.
- **Card** — freeze/unfreeze, reveal details (hidden again after 30 s), four card colours, tap to flip.
- **Activity** — search, All / Income / Spending filter, grouped by day, transaction details.
- **Profile** — Face ID on/off, reset demo data, log out, delete account.
- **Notifications** — the island widens into a banner ("Sent €25.00 to Maria").
- Locks automatically after a minute in the background.

All animation uses spring curves baked into GPU keyframe animations (transform/opacity only),
so it runs at full frame rate on iPhone.

On iPhone, use Safari → Share → **Add to Home Screen** to run it fullscreen.

## Files

- `index.html` — markup
- `style.css` — styles
- `app.js` — motion, storage, Face ID island, sheets, auth and bank logic

When changing `style.css` or `app.js`, bump the `?v=` number in `index.html` so phones load the new files.

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080.
