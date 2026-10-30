// After `vite build`: writes a static HTML file for every public page, with its
// real text, title and description, plus sitemap.xml. Crawlers get the content
// without running JavaScript; in the browser React replaces it on load with the
// same content (and the latest published copy).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    ABOUT, CONTACT, CONTACT_EMAIL, MEDICAL_NOTE, PAGE_META, PRIVACY, SITE_DESCRIPTION, SITE_TITLE, SITE_URL,
    TRIMESTER_NAMES, articleMeta, snippet, weekMeta,
} from '../src/data/sitePages.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const readJson = (file) => JSON.parse(readFileSync(join(root, 'src/data/content', file), 'utf8'));

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const paragraphs = (text) => String(text).split(/\n+/).filter((p) => p.trim()).map((p) => `<p class="abl-pub-text">${esc(p)}</p>`).join('');

const layout = (body) => `
<div class="abl-pub" dir="rtl">
  <header class="abl-pub-top">
    <a href="/" class="abl-pub-logo"><img src="/images/logo.png" alt="אבאל'ה"></a>
    <nav>${link('/weeks', 'שבועות')}${link('/articles', 'מאמרים')}${link('/exams', 'בדיקות')}</nav>
    <a href="/start" class="abl-pub-top-cta">מתחילים</a>
  </header>
  <main class="abl-pub-main">${body}</main>
  <footer class="abl-pub-footer">
    <nav>${link('/weeks', 'שבועות')}${link('/articles', 'מאמרים')}${link('/exams', 'בדיקות')}${link('/about', 'אודות')}${link('/contact', 'יצירת קשר')}${link('/privacy', 'מדיניות פרטיות')}</nav>
    <p>${esc(MEDICAL_NOTE)}</p>
  </footer>
</div>`;

const hero = (title, text) => `<section class="abl-pub-hero"><h1>${esc(title)}</h1>${text ? `<p>${esc(text)}</p>` : ''}</section>`;
const section = (title, html) => `<section class="abl-pub-section"><h2>${esc(title)}</h2>${html}</section>`;
const articleCard = (a) => `<a href="/article/${esc(a.id)}" class="abl-pub-article"><div><h3>${esc(a.title)}</h3><p>${esc(snippet(a.content, 90))}</p></div></a>`;
const articlesGrid = (list) => `<div class="abl-pub-articles">${list.map(articleCard).join('')}</div>`;
const weekList = (weeks) => `<ul class="abl-pub-weeklist">${weeks.map((w) => `<li><a href="/weeks/${w.week}"><strong>שבוע ${w.week}</strong><span>${esc(w.babySize.object)}</span></a></li>`).join('')}</ul>`;

const buildPages = (weeks, guides) => {
    const pages = [];
    const add = (path, meta, body) => pages.push({ path, meta, html: layout(body) });

    add('/', { title: SITE_TITLE, description: SITE_DESCRIPTION }, [
        hero('המדריך לאבא שבדרך', 'מה קורה איתה, מה קורה איתו, ומה בדיוק אתה יכול לעשות השבוע. בעברית, בגובה העיניים, ובחינם.'),
        section('באיזה שבוע אתם?', weekList(weeks.filter((w) => w.week <= 40))),
        section('מאמרים', articlesGrid(guides.slice(0, 6).map((m) => m.articles[m.month % m.articles.length]))),
        section(ABOUT.title, `<p class="abl-pub-text">${esc(ABOUT.paragraphs[1])}</p>${link('/about', 'הסיפור המלא')}`),
    ].join(''));

    add('/weeks', PAGE_META.weeks, hero('כל שבועות ההיריון', 'בוחרים שבוע, ורואים מה קורה איתה, מה קורה עם התינוק, ומה המשימות שלך.')
        + [1, 2, 3].map((t) => section(TRIMESTER_NAMES[t], weekList(weeks.filter((w) => w.trimester === t)))).join(''));

    weeks.forEach((w) => {
        const month = guides.find((m) => m.month === w.month);
        const tasks = w.tasks.map((c) => `<div class="abl-pub-tasks"><h3>${esc(c.category)}</h3><ul>${c.items.map((i) => `<li><strong>${esc(i.text)}</strong><span>${esc(i.description)}</span></li>`).join('')}</ul></div>`).join('');
        add(`/weeks/${w.week}`, weekMeta(w), [
            `<section class="abl-pub-hero"><p class="abl-pub-kicker">${esc(TRIMESTER_NAMES[w.trimester])}, חודש ${w.month}</p><h1>שבוע ${w.week} להיריון</h1><p>בגודל של ${esc(w.babySize.object)}. משקל משוער: ${esc(w.babySize.weight)}.</p></section>`,
            section('מה קורה עם בת הזוג?', paragraphs(w.partnerStatus.text)),
            section('מה קורה עם התינוק?', paragraphs(w.babyStatus.text)),
            section('המשימות שלך השבוע', tasks),
            month?.articles?.length ? section(`מאמרים לחודש ${w.month}`, articlesGrid(month.articles)) : '',
        ].join(''));
    });

    add('/articles', PAGE_META.articles, hero('מאמרים לאבא שבדרך', 'דעות והמלצות לפי חודשי ההיריון: זוגיות, כסף, עבודה, פחדים, ציוד וחדר הלידה.')
        + guides.map((m) => section(`חודש ${m.month}`, articlesGrid(m.articles))).join(''));

    guides.forEach((m) => m.articles.forEach((a) => {
        add(`/article/${a.id}`, articleMeta(a), hero(a.title) + `<section class="abl-pub-section">${paragraphs(a.content)}<p class="abl-pub-text">${esc(MEDICAL_NOTE)}</p></section>`
            + section('עוד מאמרים לאותו חודש', articlesGrid(m.articles.filter((x) => x.id !== a.id))));
    }));

    add('/exams', PAGE_META.exams, hero('הבדיקות בהיריון, לפי חודשים', MEDICAL_NOTE)
        + `<p class="abl-pub-strong">הרשימה כאן להמלצה בלבד. מה שקובע זה המרפאה שלה.</p>`
        + guides.map((m) => section(`חודש ${m.month}`, `<div class="abl-pub-exams">${m.exams.map((e) => `<article><h3>${esc(e.name)}</h3><p>${esc(e.info)}</p></article>`).join('')}</div>`)).join(''));

    add('/about', PAGE_META.about, hero(ABOUT.title) + `<section class="abl-pub-section">${ABOUT.paragraphs.map((p) => `<p class="abl-pub-text">${esc(p)}</p>`).join('')}</section>`);
    add('/contact', PAGE_META.contact, hero(CONTACT.title, CONTACT.intro) + `<section class="abl-pub-section"><a class="abl-pub-btn" data-primary href="mailto:${esc(CONTACT_EMAIL)}" dir="ltr">${esc(CONTACT_EMAIL)}</a><p class="abl-pub-text">${esc(CONTACT.note)}</p></section>`);

    const privacyParts = (parts) => (Array.isArray(parts) ? parts : [parts])
        .map((part) => (typeof part === 'string' ? esc(part) : link(part.href, part.text))).join('');
    const privacyBlock = (block) => (block.list
        ? `<ul>${block.list.map((item) => `<li class="abl-pub-text">${esc(item)}</li>`).join('')}</ul>`
        : `<p class="abl-pub-text">${privacyParts(block)}</p>`);
    add('/privacy', PAGE_META.privacy, hero(PRIVACY.title, PRIVACY.updated)
        + PRIVACY.sections.map((s) => section(s.title, s.blocks.map(privacyBlock).join(''))).join(''));

    return pages;
};

const applyMeta = (template, { title, description }, url) => template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(url)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);

export const prerender = (distDir) => {
    const template = readFileSync(join(distDir, 'index.html'), 'utf8');
    const pages = buildPages(readJson('weeks.json'), readJson('guides.json'));

    pages.forEach(({ path, meta, html }) => {
        const url = `${SITE_URL}${path === '/' ? '' : path}`;
        const out = applyMeta(template, meta, url)
            .replace('<div id="root"></div>', `<div id="root"><div data-prerender>${html}</div></div>`);
        const dir = join(distDir, path);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), out);
    });

    const today = new Date().toISOString().slice(0, 10);
    const urls = pages.map((p) => p.path);
    writeFileSync(join(distDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '' : p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
    return pages.length;
};
