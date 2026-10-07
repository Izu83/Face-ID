# Face ID

An iPhone-first web demo of the iOS Face ID unlock animation, hosted on GitHub Pages.

**Live:** https://izu83.github.io/Face-ID/

## Demo 1

- iOS-style lock screen with a live clock
- Face ID popup: face glyph → scanning spinner → green checkmark
- Padlock opens, the lock screen slides away, and the page shows **Successful**
- Authentication always succeeds for now (`authenticate()` in `index.html`)

Tap the lock screen to run it again, or use **Lock again** on the success screen.
On iPhone, use Safari → Share → **Add to Home Screen** to run it fullscreen.

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080.
