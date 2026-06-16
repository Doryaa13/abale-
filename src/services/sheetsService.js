import Papa from 'papaparse';

// The published URLs provided by the user
const STATUS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSjNol7uvheiWwJVbGc3y4n5-Nez22kgcOp2f_Px1ZhSkkXx8FbN644lhYDKIT12NRiXYF8mImUA1A4/pub?output=csv';
const TASKS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSjNol7uvheiWwJVbGc3y4n5-Nez22kgcOp2f_Px1ZhSkkXx8FbN644lhYDKIT12NRiXYF8mImUA1A4/pub?gid=1399407437&single=true&output=csv';
const EXAMS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSjNol7uvheiWwJVbGc3y4n5-Nez22kgcOp2f_Px1ZhSkkXx8FbN644lhYDKIT12NRiXYF8mImUA1A4/pub?gid=1105998827&single=true&output=csv';
const ARTICLES_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSjNol7uvheiWwJVbGc3y4n5-Nez22kgcOp2f_Px1ZhSkkXx8FbN644lhYDKIT12NRiXYF8mImUA1A4/pub?gid=1163102074&single=true&output=csv';

// Fallback to local data if fetch fails
import localWeeksData from '../data/weeks_db.json';
import localGuidesData from '../data/guides_db.json'; // Import local guides for fallback

export const fetchWeeksData = async () => {
    try {
        const [statusResponse, tasksResponse] = await Promise.all([
            fetch(STATUS_SHEET_URL),
            fetch(TASKS_SHEET_URL)
        ]);

        if (!statusResponse.ok || !tasksResponse.ok) throw new Error('Network response was not ok');

        const statusText = await statusResponse.text();
        const tasksText = await tasksResponse.text();

        const statusData = await parseCSV(statusText);
        const tasksData = await parseCSV(tasksText);

        const mergedData = mergeData(statusData, tasksData);
        console.log('Fetched & Merged Weeks Data:', mergedData);
        return mergedData;
    } catch (error) {
        console.warn('Failed to fetch sheets data (Weeks), using local fallback:', error);
        return localWeeksData;
    }
};

export const fetchGuidesData = async () => {
    try {
        const [examsResponse, articlesResponse] = await Promise.all([
            fetch(EXAMS_SHEET_URL),
            fetch(ARTICLES_SHEET_URL)
        ]);

        if (!examsResponse.ok || !articlesResponse.ok) throw new Error('Network response was not ok');

        const examsText = await examsResponse.text();
        const articlesText = await articlesResponse.text();

        const examsData = await parseCSV(examsText);
        const articlesData = await parseCSV(articlesText);

        const mergedGuides = mergeGuidesData(examsData, articlesData);
        console.log('Fetched & Merged Guides Data:', mergedGuides);
        return mergedGuides;
    } catch (error) {
        console.warn('Failed to fetch sheets data (Guides), using local fallback:', error);
        return localGuidesData;
    }
};

const parseCSV = (csvText) => {
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(error)
        });
    });
};

const mergeData = (statusRows, tasksRows) => {
    // 1. Map Status Rows (Base Structure)
    const weeksMap = new Map();

    statusRows.forEach(row => {
        const weekNum = parseInt(row.week) || 0;
        if (weekNum === 0) return;

        weeksMap.set(weekNum, {
            week: weekNum,
            trimester: parseInt(row.Trimester) || 1,
            month: parseInt(row.month) || 1,
            babySize: {
                object: row.size_text || 'לא ידוע',
                weight: row.weight || 'לא ידוע',
                image: row.size_photo || null
            },
            partnerStatus: {
                text: row.effect_woman || '',
                tags: row.Hashtags_effect ? row.Hashtags_effect.split('#').filter(t => t.trim()) : []
            },
            babyStatus: {
                text: row.effect_fetus || ''
            },
            tasks: [] // Will be filled below
        });
    });

    // 2. Map Tasks Rows & Merge
    tasksRows.forEach(row => {
        const weekNum = parseInt(row.week) || 0;
        if (!weeksMap.has(weekNum)) return; // Skip if week doesn't exist in status

        const weekObj = weeksMap.get(weekNum);
        const tasksList = [];
        const categoriesMap = new Map();

        // Iterate through valid columns 1-9
        for (let i = 1; i <= 9; i++) {
            const task = row[`task${i}`];
            const category = row[`category${i}`];
            const desc = row[`description${i}`];

            if (task && category) {
                if (!categoriesMap.has(category)) {
                    categoriesMap.set(category, {
                        category: category,
                        items: []
                    });
                    tasksList.push(categoriesMap.get(category));
                }

                // Add item to category
                categoriesMap.get(category).items.push({
                    text: task,
                    description: desc || '' // Add description support
                });
            }
        }
        weekObj.tasks = tasksList;
    });

    return Array.from(weeksMap.values()).sort((a, b) => a.week - b.week);
};

// Import Article Images
import imgTrimesters from '../assets/images/articles/trimesters.png';
import imgNutrition from '../assets/images/articles/nutrition.png';
import imgMedical from '../assets/images/articles/medical.png';
import imgLifestyle from '../assets/images/articles/lifestyle.png';
// New custom images
import month2Img from '../assets/images/articles/month2.png';
import sheMonth1Img from '../assets/images/articles/she_month1.png';

// Image library — the keys are exactly what content writers type in the sheet's
// Photo_Name column (case/spacing-insensitive).
const IMAGE_BY_NAME = {
    trimesters: imgTrimesters,
    nutrition: imgNutrition,
    medical: imgMedical,
    lifestyle: imgLifestyle,
    month2: month2Img,
    she_month1: sheMonth1Img,
};

// Helper to assign an image based on the title's keywords (the fallback used
// whenever Photo_Name is empty or unrecognized).
const getArticleImage = (title) => {
    if (!title) return imgLifestyle;
    const t = title.toLowerCase();

    // Specific mapping
    if (t.includes('חודש שני') || t.includes('month 2')) return month2Img;
    if (t.includes('מה עובר עליה') || t.includes('she is going')) return sheMonth1Img;

    if (t.includes('טרימסטר') || t.includes('שליש') || t.includes('trimester') || t.includes('התפתחות')) return imgTrimesters;
    if (t.includes('אוכל') || t.includes('תזונה') || t.includes('דיאטה') || t.includes('food')) return imgNutrition;
    if (t.includes('בדיקה') || t.includes('אולטרסאונד') || t.includes('רופא') || t.includes('סקירה')) return imgMedical;
    return imgLifestyle; // Default
};

// Resolve the article image: an explicit Photo_Name from the sheet wins;
// otherwise fall back to keyword detection on the title.
const resolveArticleImage = (photoName, title) => {
    if (photoName && typeof photoName === 'string') {
        // Normalize "Month2", " she month1 ", etc. to a library key.
        const key = photoName.trim().toLowerCase().replace(/[\s-]+/g, '_');
        if (IMAGE_BY_NAME[key]) return IMAGE_BY_NAME[key];
    }
    return getArticleImage(title);
};


const mergeGuidesData = (examsRows, articlesRows) => {
    const monthsMap = new Map();

    // 1. Process Exams (Base)
    examsRows.forEach(row => {
        const month = parseInt(row.month) || 1;

        if (!monthsMap.has(month)) {
            monthsMap.set(month, {
                month: month,
                title: `חודש ${month}`,
                exams: [],
                articles: []
            });
        }

        const monthObj = monthsMap.get(month);

        // 1. Parse Exams (1-5)
        for (let i = 1; i <= 5; i++) {
            const name = row[`test_name${i}`];
            const desc = row[`description_test${i}`];

            if (name && name.trim()) {
                const exists = monthObj.exams.some(e => e.name === name);
                if (!exists) {
                    monthObj.exams.push({
                        id: `test_${month}_${i}`,
                        name: name,
                        info: desc || ''
                    });
                }
            }
        }
    });

    // 2. Process Articles (Merge into existing months or create new)
    articlesRows.forEach(row => {
        const month = parseInt(row.month) || 1;

        if (!monthsMap.has(month)) {
            monthsMap.set(month, {
                month: month,
                title: `חודש ${month}`,
                exams: [],
                articles: []
            });
        }

        const monthObj = monthsMap.get(month);

        // 2. Parse Articles (1-4)
        for (let i = 1; i <= 4; i++) {
            const title = row[`article_title${i}`];
            const author = row[`Name_title_article${i}`];
            const content = row[`text_article${i}`];
            // Photo_Name${i} lets each article in the row pick its own image;
            // a single row-level Photo_Name applies to all articles in the row.
            const photoName = row[`Photo_Name${i}`] || row['Photo_Name'];

            if (title && title.trim()) {
                const exists = monthObj.articles.some(a => a.title === title);
                if (!exists) {
                    monthObj.articles.push({
                        id: `article_${month}_${i}`,
                        title: title,
                        author: author || 'מומחה אבאלה',
                        content: content || 'טוען תוכן...',
                        image: resolveArticleImage(photoName, title),
                        gradient: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)' // Dark overlay for image
                    });
                }
            }
        }
    });

    return Array.from(monthsMap.values()).sort((a, b) => a.month - b.month);
};
