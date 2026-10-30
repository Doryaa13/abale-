import React from 'react';
import PublicLayout from './PublicLayout';
import ArticleCard from './ArticleCard';
import { usePageMeta, usePublicContent } from './publicHooks';
import { PAGE_META } from '../../data/sitePages';

const ArticlesIndex = () => {
    usePageMeta({ ...PAGE_META.articles, path: '/articles' });
    const { guides } = usePublicContent();

    return (
        <PublicLayout>
            <section className="abl-pub-hero">
                <h1>מאמרים לאבא שבדרך</h1>
                <p>דעות והמלצות לפי חודשי ההיריון: זוגיות, כסף, עבודה, פחדים, ציוד וחדר הלידה.</p>
            </section>
            {guides.map((month) => (
                <section key={month.month} className="abl-pub-section">
                    <h2>חודש {month.month}</h2>
                    <div className="abl-pub-articles">
                        {month.articles.map((a) => <ArticleCard key={a.id} article={a} />)}
                    </div>
                </section>
            ))}
        </PublicLayout>
    );
};

export default ArticlesIndex;
