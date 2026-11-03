# Onboarding Reel for אבאל'ה (Instagram, 9:16)

- `abale-onboarding-reel.mp4`: the rendered video (1080x1920, 30fps, 29.5 seconds, no audio; add music inside Instagram).
- Shows how to get started: step 1, type your name; step 2, pick the week (and ask her, gently); then the
  week's info arrives in plain language and updates by itself every week.
- Source: a [HyperFrames](https://github.com/heygen-com/hyperframes) project. `index.html` mounts
  `compositions/hook.html`, `compositions/flow.html` and `compositions/endcard.html`.
- `assets/screens/`: real frames of the app's onboarding (name typed letter by letter, the week slider 3 to 20)
  and the home and week screens at week 20.

Edit and re-render:

```bash
cd marketing/onboarding-reel
npx hyperframes@0.9.8 preview
npx hyperframes@0.9.8 render --quality delivery -o abale-onboarding-reel.mp4
```
