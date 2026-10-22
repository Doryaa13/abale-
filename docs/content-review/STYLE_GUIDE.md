# Abale (אבאל'ה) — content style guide for writers and fact-checkers

## The product
Abale is a free Hebrew mobile app (Israel) for **expecting dads**. Every pregnancy week (3–42) shows:
what's going on with her ("מה קורה עם בת הזוג"), what's going on with the baby, the baby's size
compared to a guy-ish object + weight, and a weekly task list for him. Every pregnancy month (1–9)
shows the month's exams (what it is / when / your role) and articles.

The reader: an Israeli man, probably first-time dad, slightly anxious, wants to be useful, likes
humor, gadgets, cars, sport, DIY. He is NOT a medical professional and the app is NOT a medical app.

## Voice
- Hebrew, addressing the dad in masculine singular ("אתה", "תביא", "קח", "ודא"). She is "היא" / "בת הזוג"
  / "השותפה". The baby is "הוא" / "התינוק" / "העובר" (keep "הוא" for the baby, like the existing content).
- Friendly buddy voice — a big brother who's been through it. Short sentences, plain words, warm humor.
- Light engineering/tech metaphors are part of the brand ("הפרויקט", "השקה", "שדרוג") — use them as
  spice, not in every sentence.
- **Humor is never at her expense.** No "her logic doesn't exist", no "hormonal = crazy" jokes, no
  eye-rolling at her feelings. The joke is on the situation or on him.
- Respectful and inclusive: don't assume religion, don't assume a car/house, don't assume she's
  "the emotional one". Keep it practical.
- Sentence case, no ALL CAPS, no middle-dot lists ("א · ב"), keep English to a minimum.

## Hard rules (non-negotiable)
1. **Nothing untrue.** Every factual claim (fetal development, body changes, Israeli procedures,
   rights) must be well established. If you're not sure — remove it or make it vaguer and hedged
   ("בדרך כלל", "אצל הרבה נשים", "בערך"). Never invent statistics, studies, quotes, experts or names.
2. **No medical content added, and as little medical advice as possible.** No doses, no test thresholds,
   no diagnoses, no "this symptom is normal / fine" reassurance, no treatment instructions, no
   supplements/medication recommendations, no diet rules beyond the very obvious. The dad's role is
   logistics, presence, support. Where a warning sign is genuinely relevant, the only allowed advice
   is the generic "מתקשרים לרופא / למיילדת" or "נוסעים למיון" — nothing more specific.
3. **No people, no brands as authorities.** Articles have no author name. Don't cite named experts.
4. Israeli context is welcome (קופת חולים, טיפת חלב, ביטוח לאומי, מלונית, ברית/מוהל "אם רלוונטי"),
   but don't state specific legal entitlements, amounts or durations unless you verified them on an
   official Israeli source — prefer "כדאי לבדוק באתר 'כל זכות' / בביטוח לאומי".
5. Spelling: "היריון" (not "הריון"), "ודא/ודאו" (not "וודא"), "שליה" (not "שיליה"). Correct Hebrew,
   no typos, punctuation inside the sentence, no space before a period.

## Data rules (the app breaks if you ignore these)
- Keep the JSON valid and keep every key. Don't change `week`, `trimester`, `month`, `id` values.
- **Tasks:** users' "done" checkmarks are stored by (week, category position, item position). So inside
  `tasks` do NOT delete, reorder or insert items, and do NOT reorder categories. You MAY rewrite any
  `text` / `description` / `category` name. Category names in use: "לוגיסטיקה", "תמיכה", "מוראל" —
  keep exactly these three.
- `babySize.weight`: weeks 14–40 follow the Hadlock 50th-percentile fetal weight table; leave the numbers
  unless one is clearly wrong. `babySize.object` should be an object of roughly that weight/size that a
  guy relates to (tools, gadgets, sport, car stuff, food). Change only if it's clearly off.
- `partnerStatus.tags`: 2–3 short tags (a few words each) — symptoms/feelings typical for that week.
- Exams `info`: exactly three lines: `מה זה: ...\nמתי: ...\nהתפקיד שלך: ...`. Exam names may be made
  simpler/friendlier (users' state is keyed by `id`, not name).
- Articles: `{ id, title, author, content, photo }`.
  - `author` must be `""` (no name).
  - `photo`: one of `trimesters`, `nutrition`, `medical`, `lifestyle`, `month2`, `she_month1`, or `null`.
  - `content`: paragraphs separated by a blank line (`\n\n`). 180–350 words.
  - New article ids: `article_<month>_<n>` with n not already used in that month.
  - Saved-article bookmarks are keyed by title — if you change an existing article's title, record the
    rename (old → new) in your changelog so we can migrate users' bookmarks.

## Articles: what we want
Every month must end up with **at least 4 articles**. They are opinion / recommendation pieces for dads —
masculine, fun, interesting, genuinely useful — not medical explainers. Good subjects: how to be a good
partner this month, practical prep (gear, money, home, car, work), mindset and fears, relationships with
family/friends, his own feelings, humor about the situation, dad-hacks, what nobody tells you.
Avoid: medical explainers, test details, nutrition rules, anything that reads like a doctor talking.
A strong article has a hook title, a clear point of view, concrete tips, and ends with one punchy line.
Titles: short, catchy, sentence case (e.g. "למה אסור לך לשאול 'בטוח?'"). No numbering like "01".
