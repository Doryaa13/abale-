// App content — weekly status and tasks (per week), exams and articles (per
// month). It used to be fetched from a published Google Sheet on every launch;
// it now ships with the app (src/data/content/*.json), so it loads instantly and
// can't be broken by a sheet edit.
//
// fetchWeeksData / fetchGuidesData keep their async shape so an admin editor can
// later layer edits (e.g. from Firestore) on top without touching the pages.

import weeksContent from '../data/content/weeks.json';
import guidesContent from '../data/content/guides.json';

import imgTrimesters from '../assets/images/articles/trimesters.png';
import imgNutrition from '../assets/images/articles/nutrition.png';
import imgMedical from '../assets/images/articles/medical.png';
import imgLifestyle from '../assets/images/articles/lifestyle.png';
import month2Img from '../assets/images/articles/month2.png';
import sheMonth1Img from '../assets/images/articles/she_month1.png';

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

const resolveArticleImage = (photo, title) => {
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

/** Weeks 3–42: { week, trimester, month, babySize, partnerStatus, babyStatus, tasks } */
export const WEEKS_DATA = weeksContent;

/** Months 1–9: { month, title, exams: [{ id, name, info }], articles: [{ id, title, author, content, image, ... }] } */
export const GUIDES_DATA = withArticleImages(guidesContent);

// Shown under the exams and at the end of articles: the content is general
// guidance for the dad, not medical advice.
export const MEDICAL_NOTE = 'המידע כאן כללי, ונועד לעזור לך להיות שם בשבילה. הוא לא מחליף רופא, אחות או מיילדת. משהו מרגיש לא תקין? מתקשרים לרופא או נוסעים למיון, לא מחכים.';

export const fetchWeeksData = async () => WEEKS_DATA;
export const fetchGuidesData = async () => GUIDES_DATA;
