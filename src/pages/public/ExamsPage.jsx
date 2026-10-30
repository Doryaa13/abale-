import React from 'react';
import PublicLayout from './PublicLayout';
import { usePageMeta, usePublicContent } from './publicHooks';
import { MEDICAL_NOTE, PAGE_META } from '../../data/sitePages';

const ExamsPage = () => {
    usePageMeta({ ...PAGE_META.exams, path: '/exams' });
    const { guides } = usePublicContent();

    return (
        <PublicLayout>
            <section className="abl-pub-hero">
                <h1>הבדיקות בהיריון, לפי חודשים</h1>
                <p>{MEDICAL_NOTE}</p>
                <p className="abl-pub-strong">הרשימה כאן להמלצה בלבד. מה שקובע זה המרפאה שלה.</p>
            </section>
            {guides.map((month) => (
                <section key={month.month} className="abl-pub-section">
                    <h2>חודש {month.month}</h2>
                    <div className="abl-pub-exams">
                        {month.exams.map((exam) => (
                            <article key={exam.id}>
                                <h3>{exam.name}</h3>
                                <p>{exam.info}</p>
                            </article>
                        ))}
                    </div>
                </section>
            ))}
        </PublicLayout>
    );
};

export default ExamsPage;
