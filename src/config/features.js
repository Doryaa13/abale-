// App-wide feature flags. Flip a value to toggle behavior everywhere at once.

// Content gating ("first one free" blur+lock on tasks/articles).
//
// Kept OFF during the Google AdSense review so Google's crawler and the human
// reviewer can see ALL content — gated content is a common cause of rejection
// ("insufficient content" / "under construction").
//
// To re-enable the gate after approval: set this to `true` and redeploy. All the
// "first one free" logic stays intact in Log.jsx / ArticlePage.jsx — this flag
// just makes RegistrationGate a pass-through while it's false.
export const GATE_REGISTRATION = false;

// Show a labeled "ad slot" placeholder where AdSense ads will render, so the ad
// locations are visible before approval. Set to false once real ads are serving.
export const SHOW_AD_PLACEHOLDERS = true;
