# Face ID

An iPhone-first web demo: an iOS-style Face ID unlock that opens into a banking app. Hosted on GitHub Pages.

**Live:** https://izu83.github.io/Face-ID/

## Face ID

- A Dynamic Island–style pill drops down from the top and grows into the Face ID square
- The glyph does a small head turn, then the brackets swirl into a spinning ring
- The ring closes and folds into a checkmark, then tucks back up into the island
- Authentication always succeeds for now (`authenticate()` in `index.html`)

## Bank app (demo data)

- Balance with rolling digits and a hide/show eye button
- Debit card with a shine sweep; tap it to flip
- Quick actions, weekly spending bars, recent activity list
- Tap a transaction for an iOS-style detail sheet (drag down or tap ✕ to close)
- Lock button returns to Face ID

All animation uses spring curves baked into GPU keyframe animations (transform/opacity only), so it runs at full frame rate on iPhone.

On iPhone, use Safari → Share → **Add to Home Screen** to run it fullscreen with its own icon.

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080.
