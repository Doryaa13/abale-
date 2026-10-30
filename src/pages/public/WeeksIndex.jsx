import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import WeekCombLinks from '../../components/WeekCombLinks';
import { usePageMeta, usePublicContent } from './publicHooks';
import { PAGE_META, TRIMESTER_NAMES } from '../../data/sitePages';

const WeeksIndex = () => {
    usePageMeta({ ...PAGE_META.weeks, path: '/weeks' });
    const { weeks } = usePublicContent();

    return (
        <PublicLayout>
            <section className="abl-pub-hero">
                <h1>כל שבועות ההיריון</h1>
                <p>בוחרים שבוע, ורואים מה קורה איתה, מה קורה עם התינוק, ומה המשימות שלך.</p>
            </section>

            <WeekCombLinks />

            {[1, 2, 3].map((trimester) => (
                <section key={trimester} className="abl-pub-section">
                    <h2>{TRIMESTER_NAMES[trimester]}</h2>
                    <ul className="abl-pub-weeklist">
                        {weeks.filter((w) => w.trimester === trimester).map((w) => (
                            <li key={w.week}>
                                <Link to={`/weeks/${w.week}`}>
                                    <strong>שבוע {w.week}</strong>
                                    <span>{w.babySize.object}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </PublicLayout>
    );
};

export default WeeksIndex;
