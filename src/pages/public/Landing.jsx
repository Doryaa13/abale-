import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import ArticleCard from './ArticleCard';
import WeekCombLinks from '../../components/WeekCombLinks';
import { usePageMeta, usePublicContent } from './publicHooks';
import { ABOUT } from '../../data/sitePages';

const FEATURES = [
    { title: 'מה קורה איתה, בלי לנחש', text: 'בכל שבוע: מה היא עשויה להרגיש, ומה אתה יכול לעשות עם זה.' },
    { title: 'תשע משימות לשבוע', text: 'לוגיסטיקה, תמיכה ומוראל. דברים שאפשר באמת לעשות השבוע, בלי הרצאות.' },
    { title: 'הבדיקות, בשפה שלך', text: 'מה זו הבדיקה, מתי היא בערך, ומה התפקיד שלך ביום עצמו.' },
];

const Landing = () => {
    usePageMeta({ path: '/' });
    const { guides } = usePublicContent();
    const articles = guides.slice(0, 6).map((m) => m.articles[m.month % m.articles.length]).filter(Boolean);

    return (
        <PublicLayout>
            <section className="abl-pub-hero">
                <h1>המדריך לאבא שבדרך</h1>
                <p>מה קורה איתה, מה קורה איתו, ומה בדיוק אתה יכול לעשות השבוע. בעברית, בגובה העיניים, ובחינם.</p>
                <div className="abl-pub-actions">
                    <Link to="/start" className="abl-pub-btn" data-primary>מתחילים</Link>
                    <Link to="/weeks" className="abl-pub-btn">קוראים בלי הרשמה</Link>
                </div>
            </section>

            <section className="abl-pub-section">
                <h2>באיזה שבוע אתם?</h2>
                <WeekCombLinks />
            </section>

            <section className="abl-pub-section">
                <h2>מה יש כאן</h2>
                <div className="abl-pub-features">
                    {FEATURES.map((f) => (
                        <div key={f.title}>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="abl-pub-section">
                <div className="abl-pub-section-head">
                    <h2>מאמרים</h2>
                    <Link to="/articles">לכל המאמרים</Link>
                </div>
                <div className="abl-pub-articles">
                    {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
                </div>
            </section>

            <section className="abl-pub-section abl-pub-about">
                <h2>{ABOUT.title}</h2>
                <p>{ABOUT.paragraphs[1]}</p>
                <Link to="/about">הסיפור המלא</Link>
            </section>
        </PublicLayout>
    );
};

export default Landing;
