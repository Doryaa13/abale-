// Renders the TikTok / Instagram ad creatives in marketing/ads from the app
// screenshots in marketing/screens.
//
//   node marketing/build-ads.cjs            (all ads)
//   node marketing/build-ads.cjs size tasks (only ads whose id contains one of the words)
//
// Needs Playwright with Chromium (`npm i --no-save playwright && npx playwright install chromium`).
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');

const ROOT = __dirname;
const SCREENS = path.join(ROOT, 'screens');
const OUT = path.join(ROOT, 'ads');
const src = (f) => 'file://' + path.join(SCREENS, f);

// Change this once there's a real link / store listing.
const CTA = 'חינם · הלינק בביו';

const SIZES = {
  story: { w: 1080, h: 1920 }, // TikTok, Reels, Stories
  feed: { w: 1080, h: 1350 },  // Instagram feed / carousel (4:5)
};

// ── Building blocks ────────────────────────────────────────────────────────────

const phone = (screen, { w = 640, cls = '', style = '' } = {}) => `
  <div class="phone ${cls}" style="--w:${w}px;${style}">
    <div class="screen">
      <div class="sb"><b>9:41</b><i class="island"></i><span class="sb-icons">
        <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <svg viewBox="0 0 16 12"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.3-1.3A10.3 10.3 0 0 0 8 .8 10.3 10.3 0 0 0 .7 3.7L2 5c1.6-1.5 3.7-2.4 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.3-1.3A6.7 6.7 0 0 0 8 4.4c-1.8 0-3.4.7-4.7 1.8l1.3 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6c-.6 0-1.1.2-1.5.6L8 12l1.5-1.6c-.4-.4-.9-.6-1.5-.6Z"/></svg>
        <svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="17" height="8" rx="2"/><rect x="24.5" y="4" width="1.8" height="4" rx=".9" opacity=".5"/></svg>
      </span></div>
      <img src="${src(screen)}">
    </div>
  </div>`;

const logo = (style = '') => `<img class="logo" src="${src('logo.png')}" style="${style}">`;
const cta = (text = CTA, style = '') => `<div class="cta" style="${style}">${text}</div>`;
const hl = (t) => `<span class="hl">${t}</span>`;

const frame = (format, body, { bg = '' } = {}) => {
  const { w, h } = SIZES[format];
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&family=Space+Grotesk:wght@500;600;700&display=block" rel="stylesheet">
<style>${CSS}</style></head>
<body><div class="ad ${format}" style="width:${w}px;height:${h}px;${bg}">
  <div class="aurora"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div>
  <div class="hexes"></div>
  ${body}
</div></body></html>`;
};

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #000; }
.ad { position: relative; overflow: hidden; background: #060b17; color: #fff;
  font-family: 'Heebo', sans-serif; direction: rtl; -webkit-font-smoothing: antialiased; }

/* Background: soft aurora lights + faint honeycomb (the app's home-screen motif) */
.aurora i { position: absolute; border-radius: 50%; filter: blur(140px); opacity: .55; }
.aurora .a1 { width: 900px; height: 900px; background: #0891b2; top: -380px; right: -320px; }
.aurora .a2 { width: 800px; height: 800px; background: #4f46e5; bottom: -260px; left: -360px; opacity: .45; }
.aurora .a3 { width: 520px; height: 520px; background: #22d3ee; top: 46%; right: -300px; opacity: .22; }
.hexes { position: absolute; inset: 0; opacity: .10;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='208' viewBox='0 0 120 208'%3E%3Cg fill='none' stroke='%2367e8f9' stroke-width='2'%3E%3Cpath d='M60 2 112 32v60L60 122 8 92V32z'/%3E%3Cpath d='M0 122l8-30M120 122l-8-30M60 122v84'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 120px 208px;
  -webkit-mask-image: radial-gradient(ellipse 80% 55% at 70% 20%, #000 0%, transparent 75%); }

.logo { position: absolute; left: 50%; transform: translateX(-50%); top: 92px; height: 116px; z-index: 5;
  filter: drop-shadow(0 4px 24px rgba(34, 211, 238, .35)); }
.feed .logo { top: 48px; height: 96px; }

.copy { position: absolute; top: 250px; left: 70px; right: 70px; text-align: center; z-index: 4; }
.feed .copy { top: 165px; }
.kicker { display: inline-flex; align-items: center; gap: 12px; padding: 12px 28px; border-radius: 999px;
  background: rgba(34, 211, 238, .12); border: 2px solid rgba(34, 211, 238, .45); color: #67e8f9;
  font-size: 34px; font-weight: 700; margin-bottom: 34px; }
h1 { font-size: 96px; line-height: 1.06; font-weight: 900; letter-spacing: -1.5px; text-wrap: balance; }
.feed h1 { font-size: 78px; }
h1.sm { font-size: 84px; }
.feed h1.sm { font-size: 68px; }
.hl { background: linear-gradient(100deg, #67e8f9 0%, #22d3ee 35%, #818cf8 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.sub { margin: 34px auto 0; max-width: 880px; font-size: 42px; line-height: 1.4; color: #b9c5dc; font-weight: 400; text-wrap: balance; }
.feed .sub { font-size: 36px; margin-top: 24px; }
.sub b { color: #fff; font-weight: 700; }

.cta { display: inline-block; margin-top: 40px; padding: 22px 54px; border-radius: 999px;
  background: linear-gradient(95deg, #22d3ee, #6366f1); color: #fff; font-size: 38px; font-weight: 800;
  box-shadow: 0 16px 50px rgba(34, 211, 238, .35); }
.feed .cta { font-size: 32px; padding: 18px 44px; margin-top: 28px; }

/* Phone mockup */
.phone { position: absolute; width: var(--w); padding: calc(var(--w) * .032);
  border-radius: calc(var(--w) * .165); z-index: 3;
  background: linear-gradient(150deg, #4a5262 0%, #161a22 22%, #0b0d12 60%, #343b49 100%);
  box-shadow: inset 0 0 0 3px #5b6576, inset 0 0 0 7px #0b0d12,
    0 70px 140px rgba(0, 0, 0, .65), 0 0 160px rgba(34, 211, 238, .22); }
.screen { position: relative; overflow: hidden; border-radius: calc(var(--w) * .135); background: #111921; }
.screen img { display: block; width: 100%; }
.sb { height: calc(var(--w) * .105); display: flex; align-items: center; justify-content: space-between;
  padding: calc(var(--w) * .012) calc(var(--w) * .085) 0; direction: ltr; background: #0f1823; color: #fff; position: relative; }
.sb b { font: 600 calc(var(--w) * .04) 'Space Grotesk', sans-serif; }
.sb-icons { display: flex; gap: calc(var(--w) * .014); align-items: center; }
.sb-icons svg { height: calc(var(--w) * .028); fill: currentColor; }
.island { position: absolute; left: 50%; top: calc(var(--w) * .022); transform: translateX(-50%);
  width: calc(var(--w) * .29); height: calc(var(--w) * .078); border-radius: 99px; background: #000; }

.pop { position: absolute; z-index: 6; border-radius: 44px; border: 3px solid rgba(103, 232, 249, .65);
  box-shadow: 0 40px 90px rgba(0, 0, 0, .6), 0 0 80px rgba(34, 211, 238, .45); }

.chip { position: absolute; z-index: 6; padding: 18px 30px; border-radius: 24px; font-size: 36px; font-weight: 700;
  background: rgba(15, 23, 42, .82); border: 2px solid rgba(148, 163, 184, .35); backdrop-filter: blur(10px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, .45); white-space: nowrap; }
.chip .ok { color: #4ade80; margin-left: 10px; }

.fade-bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 380px; z-index: 4;
  background: linear-gradient(transparent, rgba(6, 11, 23, .92)); }
`;

// ── Ads ────────────────────────────────────────────────────────────────────────

const storyPhone = (screen, extra = '') => phone(screen, { w: 660, style: `left:210px;top:930px;${extra}` });
const feedPhone = (screen, extra = '') => phone(screen, { w: 520, style: `left:280px;top:690px;${extra}` });

const ADS = [
  // 1 — the launch message
  ['01-launch-story', 'story', `
    ${logo()}
    <div class="copy">
      <div class="kicker">✨ אפליקציה חדשה</div>
      <h1 class="sm">יש אפליקציה שתלווה אותך ב${hl('הריון של בת הזוג שלך')}</h1>
      <p class="sub">שבוע אחרי שבוע: מה קורה איתה, מה קורה עם התינוק, ו<b>מה אתה צריך לעשות.</b></p>
    </div>
    ${storyPhone('home.png', 'transform:rotate(-4deg)')}
    ${phone('partner.png', { w: 470, style: 'left:-120px;top:1120px;transform:rotate(-12deg);opacity:.9;z-index:2' })}
  `],
  ['01-launch-feed', 'feed', `
    ${logo()}
    <div class="copy">
      <h1 class="sm">יש אפליקציה שתלווה אותך ב${hl('הריון של בת הזוג שלך')}</h1>
      <p class="sub">אבאל׳ה מדבר בשפה שלך. בלי חפירות, בלי פורומים.</p>
    </div>
    ${feedPhone('home.png', 'transform:rotate(-4deg)')}
  `],

  // 2 — the size comparison, in dad language
  ['02-size-week24-story', 'story', `
    ${logo()}
    <div class="copy">
      <div class="kicker">שבוע 24</div>
      <h1>התינוק שלך עכשיו בגודל של ${hl('נעל פקקים')}</h1>
      <p class="sub">לא אבוקדו. לא שזיף. <b>נעל פקקים.</b> ⚽<br>כל שבוע, בשפה שלך.</p>
    </div>
    ${storyPhone('home.png')}
    <img class="pop" src="${src('size-card.png')}" style="width:900px;left:90px;top:1420px;transform:rotate(-2deg)">
  `],
  ['02-size-week24-feed', 'feed', `
    ${logo()}
    <div class="copy">
      <div class="kicker">שבוע 24</div>
      <h1>התינוק שלך בגודל של ${hl('נעל פקקים')}</h1>
    </div>
    ${feedPhone('home.png', 'top:640px')}
    <img class="pop" src="${src('size-card.png')}" style="width:860px;left:110px;top:1000px;transform:rotate(-2deg)">
  `],
  ['02-size-week36-story', 'story', `
    ${logo()}
    <div class="copy">
      <div class="kicker">שבוע 36</div>
      <h1>התינוק שלך עכשיו בגודל של ${hl('גזיית קמפינג')}</h1>
      <p class="sub">כמעט 3 קילו. <b>זה הזמן לסגור את התיק לחדר לידה.</b> 🏕️</p>
    </div>
    ${storyPhone('home-w36.png')}
    <img class="pop" src="${src('size-card-w36.png')}" style="width:900px;left:90px;top:1420px;transform:rotate(-2deg)">
  `],

  // 3 — what she's going through
  ['03-partner-story', 'story', `
    ${logo()}
    <div class="copy">
      <h1>תדע מה היא עוברת. ${hl('עוד לפני שהיא אומרת.')}</h1>
      <p class="sub">מה קורה בגוף שלה השבוע, למה היא עייפה, ו<b>איך אתה יכול לעזור.</b></p>
    </div>
    ${storyPhone('partner.png')}
  `],
  ['03-partner-feed', 'feed', `
    ${logo()}
    <div class="copy">
      <h1>תדע מה היא עוברת. ${hl('עוד לפני שהיא אומרת.')}</h1>
    </div>
    ${feedPhone('partner.png', 'top:560px')}
  `],

  // 4 — weekly tasks
  ['04-tasks-story', 'story', `
    ${logo()}
    <div class="copy">
      <h1 class="sm"><span style="white-space:nowrap">״מה אני יכול לעשות?״</span><br>${hl('הנה רשימה.')}</h1>
      <p class="sub">משימות לאבא, מותאמות לשבוע שלכם: <b>לוגיסטיקה, תמיכה ומורל.</b> מסמנים וי וממשיכים.</p>
    </div>
    ${storyPhone('tasks.png')}
    <div class="chip" style="right:60px;top:1240px;transform:rotate(4deg)"><span class="ok">✓</span>ללוות אותה לבדיקה</div>
    <div class="chip" style="left:50px;top:1520px;transform:rotate(-5deg)"><span class="ok">✓</span>לבדוק את ביטוח הרכב</div>
  `],
  ['04-tasks-feed', 'feed', `
    ${logo()}
    <div class="copy">
      <h1 class="sm"><span style="white-space:nowrap">״מה אני יכול לעשות?״</span><br>${hl('הנה רשימה.')}</h1>
    </div>
    ${feedPhone('tasks.png', 'top:560px')}
  `],

  // 5 — the medical tests
  ['05-tests-story', 'story', `
    ${logo()}
    <div class="copy">
      <h1 class="sm">כל הבדיקות בהריון, ${hl('במסלול אחד ברור.')}</h1>
      <p class="sub">מה כל בדיקה בודקת, מתי עושים אותה, <b>ומה אתה צריך לדעת.</b></p>
    </div>
    ${storyPhone('tests.png')}
    <div class="chip" style="right:40px;top:1060px;transform:rotate(5deg)">🩺 שקיפות עורפית</div>
    <div class="chip" style="left:30px;top:1260px;transform:rotate(-6deg)">🍬 העמסת סוכר</div>
    <div class="chip" style="right:30px;top:1480px;transform:rotate(3deg)">🔍 סקירה מאוחרת</div>
  `],

  // 6 — POV, native TikTok style
  ['06-pov-story', 'story', `
    <div style="position:absolute;top:170px;left:70px;right:70px;text-align:center;z-index:5">
      <div class="pov">POV: היא אומרת ״אני בשבוע 24 היום״</div><br>
      <div class="pov">ואתה מהנהן כאילו אתה מבין</div><br>
      <div class="pov">מה זה אומר 😅</div>
    </div>
    <div class="chat">
      <div class="msg in">אני בשבוע 24 היום 🥹<small>21:14</small></div>
      <div class="msg out">וואו!! איזה כיף 😍<small>21:14 ✓✓</small></div>
      <div class="search"><span>🔍</span>מה זה אומר שבוע 24 בהריון<i></i></div>
    </div>
    <div style="position:absolute;top:1180px;left:60px;right:60px;text-align:center;z-index:5">
      <h1 class="sm">או ש${hl('אבאל׳ה כבר אמר לך.')}</h1>
    </div>
    ${phone('home.png', { w: 560, style: 'left:260px;top:1420px;transform:rotate(-4deg)' })}
    <style>
      .pov { display: inline; background: #fff; color: #111; font-weight: 800; font-size: 50px; line-height: 1.75;
        padding: 8px 22px; border-radius: 14px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
      .chat { position: absolute; top: 560px; left: 80px; right: 80px; z-index: 5; display: flex; flex-direction: column; gap: 26px; }
      .msg { max-width: 72%; padding: 24px 34px 40px; border-radius: 40px; font-size: 44px; position: relative; font-weight: 500; }
      .msg small { position: absolute; bottom: 10px; left: 26px; font-size: 24px; opacity: .6; direction: ltr; }
      .msg.in { align-self: flex-start; background: #1f2c34; border-top-right-radius: 10px; }
      .msg.out { align-self: flex-end; background: #005c4b; border-top-left-radius: 10px; }
      .search { align-self: center; margin-top: 30px; width: 100%; display: flex; align-items: center; gap: 22px;
        background: #fff; color: #202124; border-radius: 999px; padding: 26px 40px; font-size: 40px; font-weight: 500;
        box-shadow: 0 20px 60px rgba(0,0,0,.5); transform: rotate(-2deg); }
      .search i { width: 4px; height: 50px; background: #1a73e8; }
    </style>
  `],

  // 7 — founder
  ['07-founder-story', 'story', `
    ${logo()}
    <div class="copy" style="top:270px">
      <h1 class="sm">כל אפליקציות ההריון מדברות אליה.</h1>
      <h1 class="sm" style="margin-top:18px">${hl('אז בניתי אחת שמדברת אליך.')}</h1>
    </div>
    <div style="position:absolute;left:50%;top:1000px;width:900px;height:900px;transform:translateX(-50%);border-radius:50%;
      background:radial-gradient(circle, rgba(34,211,238,.55), rgba(79,70,229,.25) 45%, transparent 70%);filter:blur(30px);z-index:2"></div>
    <img src="${src('dor-cutout.png')}" style="position:absolute;left:50%;transform:translateX(-50%);bottom:0;width:1120px;z-index:3;
      filter:drop-shadow(0 0 2px rgba(103,232,249,.9)) drop-shadow(0 0 30px rgba(34,211,238,.35))">
    <div class="fade-bottom" style="height:300px"></div>
    <div style="position:absolute;top:1010px;right:80px;z-index:5;text-align:right">
      <div style="font-size:46px;font-weight:800">דור</div>
      <div style="font-size:32px;color:#9fb0cc">מייסד אבאל׳ה</div>
    </div>
  `],
  ['07-founder-feed', 'feed', `
    ${logo()}
    <div class="copy">
      <h1 class="sm">כל אפליקציות ההריון מדברות אליה.<br>${hl('אז בניתי אחת שמדברת אליך.')}</h1>
    </div>
    <div style="position:absolute;left:50%;top:620px;width:760px;height:760px;transform:translateX(-50%);border-radius:50%;
      background:radial-gradient(circle, rgba(34,211,238,.5), rgba(79,70,229,.22) 45%, transparent 70%);filter:blur(30px);z-index:2"></div>
    <img src="${src('dor-cutout.png')}" style="position:absolute;left:50%;transform:translateX(-50%);bottom:-40px;width:840px;z-index:3;
      filter:drop-shadow(0 0 2px rgba(103,232,249,.9)) drop-shadow(0 0 30px rgba(34,211,238,.35))">
    <div style="position:absolute;bottom:90px;right:70px;z-index:5;text-align:right">
      <div style="font-size:40px;font-weight:800">דור</div>
      <div style="font-size:28px;color:#9fb0cc">מייסד אבאל׳ה</div>
    </div>
  `],

  // 8 — hospital bag
  ['08-bag-story', 'story', `
    ${logo()}
    <div class="copy">
      <h1>תיק לחדר לידה? ${hl('מוכן מראש.')}</h1>
      <p class="sub">רשימה מסודרת: מסמכים, בשבילה, בשבילך ולמחלקה. <b>בלי לרוץ לחפש באמצע הלילה.</b></p>
    </div>
    ${storyPhone('bag.png')}
    <div class="chip" style="left:40px;top:1300px;transform:rotate(-5deg)">🔌 מטען עם כבל ארוך!</div>
  `],

  // 9 — contraction timer
  ['09-timer-story', 'story', `
    ${logo()}
    <div class="copy">
      <h1>צירים. שלוש בלילה. ${hl('יש לך טיימר.')}</h1>
      <p class="sub">מודדים כל ציר ואת ההפסקה ביניהם, <b>ויודעים מתי זה הזמן לצאת.</b></p>
    </div>
    ${storyPhone('timer.png')}
  `],

  // 10 — dad jokes
  ['10-jokes-story', 'story', `
    ${logo()}
    <div class="copy">
      <h1>וגם... ${hl('בדיחות אבא.')}</h1>
      <p class="sub">כי מישהו צריך לשמור על מצב הרוח בבית. 🙃</p>
    </div>
    ${storyPhone('jokes.png')}
  `],
];

// Carousel: "how big is the baby — the dad version". Sizes from weeks.json.
const CAROUSEL = [
  { week: 9, emoji: '🍺', object: 'פקק בירה', weight: '2 גרם' },
  { week: 14, emoji: '🖱️', object: 'עכבר מחשב', weight: '93 גרם' },
  { week: 24, emoji: '👟', object: 'נעל פקקים', weight: '670 גרם' },
  { week: 28, emoji: '🧯', object: 'מטף קטן', weight: '1.2 ק״ג' },
  { week: 35, emoji: '🍻', object: 'שישיית בירות', weight: '2.6 ק״ג' },
  { week: 40, emoji: '🎳', object: 'כדור באולינג', weight: '3.6 ק״ג' },
];
const total = CAROUSEL.length + 2;
const dots = (i) => `<div class="dots">${Array.from({ length: total }, (_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>`;
const CAROUSEL_CSS = `<style>
  .dots { position: absolute; bottom: 70px; left: 50%; transform: translateX(-50%); display: flex; gap: 14px; z-index: 5; }
  .dots i { width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,.25); }
  .dots i.on { background: #22d3ee; width: 44px; border-radius: 99px; }
  .swipe { position: absolute; bottom: 130px; left: 0; right: 0; text-align: center; font-size: 32px; color: #8ea0bd; z-index: 5; }
  .wk { font: 700 54px 'Space Grotesk', 'Heebo', sans-serif; color: #67e8f9; letter-spacing: 1px; }
  .hex { position: absolute; left: 50%; top: 300px; transform: translateX(-50%); width: 520px; height: 600px; z-index: 3;
    clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
    background: linear-gradient(160deg, rgba(34,211,238,.9), rgba(79,70,229,.9)); }
  .hex::after { content: ''; position: absolute; inset: 8px; clip-path: inherit; background: radial-gradient(circle at 50% 40%, #12304a, #0a1222 70%); }
  .hex span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 260px; z-index: 2; }
  .glow { position: absolute; left: 50%; top: 360px; width: 700px; height: 600px; transform: translateX(-50%);
    background: radial-gradient(circle, rgba(34,211,238,.45), transparent 65%); filter: blur(40px); z-index: 2; }
  .obj { position: absolute; top: 950px; left: 60px; right: 60px; text-align: center; z-index: 4; }
  .obj h2 { font-size: 100px; font-weight: 900; letter-spacing: -1px; }
  .obj .w { display: inline-block; margin-top: 16px; padding: 10px 30px; border-radius: 99px; font-size: 38px; font-weight: 700;
    background: rgba(34,211,238,.12); border: 2px solid rgba(34,211,238,.4); color: #a5f3fc; }
</style>`;
CAROUSEL.forEach((c, i) => {
  ADS.push([`11-carousel-${String(i + 2).padStart(2, '0')}-week${c.week}`, 'feed', `
    ${CAROUSEL_CSS}
    ${logo('top:60px;height:52px')}
    <div style="position:absolute;top:170px;left:0;right:0;text-align:center;z-index:4"><div class="wk">שבוע ${c.week}</div></div>
    <div class="glow"></div>
    <div class="hex"><span>${c.emoji}</span></div>
    <div class="obj"><h2>${c.object}</h2><div class="w">כ-${c.weight}</div></div>
    ${dots(i + 1)}
  `]);
});
ADS.push(['11-carousel-01-cover', 'feed', `
  ${CAROUSEL_CSS}
  ${logo('top:70px;height:62px')}
  <div class="copy" style="top:260px">
    <h1 style="font-size:104px">כמה גדול התינוק?</h1>
    <h1 style="font-size:104px;margin-top:10px">${hl('הגרסה של אבא.')}</h1>
    <p class="sub" style="font-size:42px;margin-top:40px">בלי פירות. בלי ירקות.<br>דברים שאתה באמת מכיר.</p>
  </div>
  <div style="position:absolute;top:900px;left:0;right:0;text-align:center;font-size:110px;letter-spacing:30px;z-index:4">🍺🖱️👟🧯🎳</div>
  <div class="swipe">החליקו ←</div>
  ${dots(0)}
`]);
ADS.push([`11-carousel-${String(total).padStart(2, '0')}-cta`, 'feed', `
  ${CAROUSEL_CSS}
  ${logo('top:70px;height:62px')}
  <div class="copy" style="top:200px">
    <h1 class="sm">כל 40 השבועות, ${hl('בשפה שלך.')}</h1>
    <p class="sub">גודל, מה קורה איתה, משימות ובדיקות. כל שבוע מחדש.</p>
    ${cta()}
  </div>
  ${phone('home.png', { w: 560, style: 'left:260px;top:600px;transform:rotate(-4deg)' })}
  ${dots(total - 1)}
`]);

// ── Render ─────────────────────────────────────────────────────────────────────

(async () => {
  const only = process.argv.slice(2);
  const list = only.length ? ADS.filter(([id]) => only.some((o) => id.includes(o))) : ADS;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [id, format, body] of list) {
    const { w, h } = SIZES[format];
    await page.setViewportSize({ width: w, height: h });
    // Rendered from a file (not setContent) so the page may load the local screenshots.
    const tmp = path.join(os.tmpdir(), `abale-ad-${id}.html`);
    fs.writeFileSync(tmp, frame(format, body));
    await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.ad').screenshot({ path: path.join(OUT, `${id}.png`) });
    console.log('✓', id);
  }
  await browser.close();
})();
