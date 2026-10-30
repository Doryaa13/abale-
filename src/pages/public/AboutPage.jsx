import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import { usePageMeta } from './publicHooks';
import { ABOUT, PAGE_META } from '../../data/sitePages';

const AboutPage = () => {
    usePageMeta({ ...PAGE_META.about, path: '/about' });
    return (
        <PublicLayout>
            <section className="abl-pub-hero">
                <h1>{ABOUT.title}</h1>
            </section>
            <section className="abl-pub-section">
                {ABOUT.paragraphs.map((p) => <p key={p} className="abl-pub-text">{p}</p>)}
                <Link to="/start" className="abl-pub-btn" data-primary>מתחילים</Link>
            </section>
        </PublicLayout>
    );
};

export default AboutPage;
