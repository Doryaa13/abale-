// App content — weekly status and tasks (per week), exams and articles (per
// month).
//
// Where it comes from, in order:
//   1. Preview mode (`?preview=1`, used by the admin editor): the editor's draft.
//   2. The published content in Firestore (content/weeks, content/guides) —
//      edited from /admin. The last copy fetched is cached on the device, so the
//      next launch starts with it instantly.
//   3. The content bundled with the app (src/data/content/*.json) — used until
//      something is published, and whenever Firestore can't be reached.

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import weeksContent from '../data/content/weeks.json';
import guidesContent from '../data/content/guides.json';
import titleRenames from '../data/content/title-renames.json';

import imgTrimesters from '../assets/images/articles/trimesters.png';
import imgNutrition from '../assets/images/articles/nutrition.png';
import imgMedical from '../assets/images/articles/medical.png';
import imgLifestyle from '../assets/images/articles/lifestyle.png';
import month2Img from '../assets/images/articles/month2.png';
import sheMonth1Img from '../assets/images/articles/she_month1.png';

const CACHE_KEY = 'abale_content_cache';   // last published content seen on this device
const DRAFT_KEY = 'abale_admin_draft';     // the admin editor's unpublished draft

// Article image library — an article's `photo` picks one of these by name
// (case/spacing-insensitive).
export const ARTICLE_IMAGES = {
    trimesters: imgTrimesters,
    nutrition: imgNutrition,
    medical: imgMedical,
    lifestyle: imgLifestyle,
    month2: month2Img,
    she_month1: sheMonth1Img,
};

// Fallback when `photo` is empty or unknown: pick by keywords in the title.
const imageForTitle = (title) => {
    if (!title) return imgLifestyle;
    const t = title.toLowerCase();
    if (t.includes('חודש שני') || t.includes('month 2')) return month2Img;
    if (t.includes('מה עובר עליה') || t.includes('she is going')) return sheMonth1Img;
    if (t.includes('טרימסטר') || t.includes('שליש') || t.includes('trimester') || t.includes('התפתחות')) return imgTrimesters;
    if (t.includes('אוכל') || t.includes('תזונה') || t.includes('דיאטה') || t.includes('food')) return imgNutrition;
    if (t.includes('בדיקה') || t.includes('אולטרסאונד') || t.includes('רופא') || t.includes('סקירה')) return imgMedical;
    return imgLifestyle;
};

export const resolveArticleImage = (photo, title) => {
    if (photo && typeof photo === 'string') {
        const key = photo.trim().toLowerCase().replace(/[\s-]+/g, '_');
        if (ARTICLE_IMAGES[key]) return ARTICLE_IMAGES[key];
    }
    return imageForTitle(title);
};

const withArticleImages = (guides) => guides.map((month) => ({
    ...month,
    articles: month.articles.map((article) => ({
        ...article,
        image: resolveArticleImage(article.photo, article.title),
        gradient: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
    })),
}));

const readJSON = (key) => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const writeJSON = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full / blocked */ }
};
const isList = (x) => Array.isArray(x) && x.length > 0;

// ── Saved-article bookmarks follow renamed articles ──────────────────────────
// Bookmarks are keyed by article title. When an article is renamed in a content
// update, its old → new title goes into title-renames.json and users' saved
// bookmarks are moved over once, on launch.
const migrateSavedTitles = () => {
    const saved = readJSON('abale_saved_articles');
    if (!saved || typeof saved !== 'object') return;
    let changed = false;
    Object.entries(titleRenames).forEach(([oldTitle, newTitle]) => {
        if (saved[oldTitle] && !saved[newTitle]) {
            saved[newTitle] = saved[oldTitle];
            delete saved[oldTitle];
            changed = true;
        }
    });
    if (changed) writeJSON('abale_saved_articles', saved);
};
migrateSavedTitles();

// ── Preview mode (the admin editor shows the app with its draft) ─────────────
const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
export const PREVIEW = params?.has('preview')
    ? { week: parseInt(params.get('week'), 10) || null }
    : null;

/** The content bundled with this build (raw: articles carry `photo`, not `image`). */
export const BUNDLED_CONTENT = { weeks: weeksContent, guides: guidesContent };

const startContent = (() => {
    const draft = PREVIEW ? readJSON(DRAFT_KEY) : null;
    const cached = draft || readJSON(CACHE_KEY) || {};
    return {
        weeks: isList(cached.weeks) ? cached.weeks : weeksContent,
        guides: isList(cached.guides) ? cached.guides : guidesContent,
    };
})();

/** Weeks 3–42: { week, trimester, month, babySize, partnerStatus, babyStatus, tasks } */
export const WEEKS_DATA = startContent.weeks;

/** Months 1–9: { month, title, exams: [{ id, name, info }], articles: [{ id, title, author, content, image, ... }] } */
export const GUIDES_DATA = withArticleImages(startContent.guides);

// Shown under the exams and at the end of articles: the content is general
// guidance for the dad, not medical advice.
export const MEDICAL_NOTE = 'המידע כאן כללי, ונועד לעזור לך להיות שם בשבילה. הוא לא מחליף רופא, אחות או מיילדת. משהו מרגיש לא תקין? מתקשרים לרופא או נוסעים למיון, לא מחכים.';

// ── Published content (Firestore) ─────────────────────────────────────────────
const weeksDoc = () => doc(db, 'content', 'weeks');
const guidesDoc = () => doc(db, 'content', 'guides');

/** Fresh read of what's published. Missing documents come back as null. */
export const loadPublishedContent = async () => {
    const [w, g] = await Promise.all([getDoc(weeksDoc()), getDoc(guidesDoc())]);
    const pick = (snap) => (snap.exists() && isList(snap.data().items) ? snap.data() : null);
    const weeks = pick(w);
    const guides = pick(g);
    return {
        weeks: weeks?.items || null,
        guides: guides?.items || null,
        updatedAt: weeks?.updatedAt?.toDate?.() || guides?.updatedAt?.toDate?.() || null,
    };
};

// One Firestore read per launch; refreshes the on-device cache for next time.
let remote = null;
const loadRemote = () => {
    if (PREVIEW) return Promise.resolve(startContent);
    if (!remote) {
        remote = loadPublishedContent()
            .then((published) => {
                writeJSON(CACHE_KEY, { weeks: published.weeks, guides: published.guides });
                return published;
            })
            .catch((e) => {
                console.warn('Using bundled content (Firestore unavailable):', e?.code || e);
                return {};
            });
    }
    return remote;
};

export const fetchWeeksData = async () => {
    const r = await loadRemote();
    return isList(r.weeks) ? r.weeks : WEEKS_DATA;
};

export const fetchGuidesData = async () => {
    const r = await loadRemote();
    return isList(r.guides) ? withArticleImages(r.guides) : GUIDES_DATA;
};

// ── Admin editor helpers ──────────────────────────────────────────────────────
export const readDraft = () => readJSON(DRAFT_KEY);
export const saveDraft = (draft) => writeJSON(DRAFT_KEY, draft);
export const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } };

/** Publish to everyone. Firestore rules only let the admin account write here. */
export const publishContent = async ({ weeks, guides }, uid) => {
    const meta = { updatedAt: serverTimestamp(), updatedBy: uid || null };
    await Promise.all([
        setDoc(weeksDoc(), { items: weeks, ...meta }),
        setDoc(guidesDoc(), { items: guides, ...meta }),
    ]);
    writeJSON(CACHE_KEY, { weeks, guides });
};
