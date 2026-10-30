import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import PublicLayout from './PublicLayout';
import ArticleCard from './ArticleCard';
import { isOnboarded, usePageMeta, usePublicContent } from './publicHooks';
import { TRIMESTER_NAMES, WEEK_GATE, weekMeta } from '../../data/sitePages';

const WeekPage = () => {
    const { week: weekParam } = useParams();
    const { weeks, guides } = usePublicContent();
    const week = weeks.find((w) => w.week === Number(weekParam));

    usePageMeta(week
        ? { ...weekMeta(week), path: `/weeks/${week.week}` }
        : { path: '/weeks' });

    if (!week) {
        return (
            <PublicLayout>
                <section className="abl-pub-hero">
                    <h1>השבוע הזה לא נמצא</h1>
                    <p><Link to="/weeks">לכל השבועות</Link></p>
                </section>
            </PublicLayout>
        );
    }

    const prev = weeks.find((w) => w.week === week.week - 1);
    const next = weeks.find((w) => w.week === week.week + 1);
    const month = guides.find((m) => m.month === week.month);

    return (
        <PublicLayout>
            <section className="abl-pub-hero">
                <p className="abl-pub-kicker">{TRIMESTER_NAMES[week.trimester]}, חודש {week.month}</p>
                <h1>שבוע {week.week} להיריון</h1>
                <p>בגודל של {week.babySize.object}. משקל משוער: {week.babySize.weight}.</p>
            </section>

            <section className="abl-pub-section">
                <h2>מה קורה עם בת הזוג?</h2>
                <p className="abl-pub-text">{week.partnerStatus.text}</p>
                {week.partnerStatus.tags.length > 0 && (
                    <ul className="abl-pub-tags">
                        {week.partnerStatus.tags.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                )}
            </section>

            <section className="abl-pub-gate">
                <h2>{WEEK_GATE.title}</h2>
                <ul>
                    {WEEK_GATE.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                {isOnboarded()
                    ? <Link to="/" className="abl-pub-btn abl-pub-btn-big" data-primary>{WEEK_GATE.ctaOnboarded}</Link>
                    : <Link to="/start" className="abl-pub-btn abl-pub-btn-big" data-primary>{WEEK_GATE.cta}</Link>}
            </section>

            {month?.articles?.length > 0 && (
                <section className="abl-pub-section">
                    <h2>מאמרים לחודש {week.month}</h2>
                    <div className="abl-pub-articles">
                        {month.articles.map((a) => <ArticleCard key={a.id} article={a} />)}
                    </div>
                </section>
            )}

            <nav className="abl-pub-pager" aria-label="ניווט בין שבועות">
                {prev ? <Link to={`/weeks/${prev.week}`}><ChevronRight size={18} /> שבוע {prev.week}</Link> : <span />}
                {next ? <Link to={`/weeks/${next.week}`}>שבוע {next.week} <ChevronLeft size={18} /></Link> : <span />}
            </nav>
        </PublicLayout>
    );
};

export default WeekPage;
