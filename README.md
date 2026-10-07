# Face ID

An iPhone-first web demo of the iOS Face ID animation, hosted on GitHub Pages.

**Live:** https://izu83.github.io/Face-ID/

## Demo

- A Dynamic Island–style pill drops down from the top and grows into the Face ID square
- The Face ID glyph does a small head turn
- The corner brackets bend into a spinning ring while it "scans"
- The ring closes and collapses into a checkmark
- The Face ID box turns into the green badge and glides into the **Successful** screen
- All motion uses spring physics, like iOS
- Authentication always succeeds for now (`authenticate()` in `index.html`)

Use **Try again** to replay it.
On iPhone, use Safari → Share → **Add to Home Screen** to run it fullscreen with its own icon.

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080.
