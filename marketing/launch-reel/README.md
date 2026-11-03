# Launch Reel for אבאל'ה (Instagram, 9:16)

- `abale-launch-reel.mp4`: the rendered video (1080x1920, 30fps, 28.4 seconds, no audio; add music inside Instagram).
- Source: a [HyperFrames](https://github.com/heygen-com/hyperframes) project. `index.html` mounts the scenes in `compositions/`:
  hook, reveal, features, promise and endcard.
- `assets/screens/`: real screenshots of the app (week 20, local build), `assets/logo.png` is the app logo.

Edit and re-render:

```bash
cd marketing/launch-reel
npx hyperframes@0.9.8 preview
npx hyperframes@0.9.8 render --quality delivery -o abale-launch-reel.mp4
```
