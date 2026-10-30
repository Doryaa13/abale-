import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuroraBackground from '../../components/AuroraBackground';
import { APP_PROMO, MEDICAL_NOTE } from '../../data/sitePages';
import { isOnboarded } from './publicHooks';

const NAV = [
    { to: '/weeks', label: 'שבועות' },
    { to: '/articles', label: 'מאמרים' },
];

const FOOTER_LINKS = [
    ...NAV,
    { to: '/about', label: 'אודות' },
    { to: '/contact', label: 'יצירת קשר' },
    { to: '/privacy', label: 'מדיניות פרטיות' },
];

export const PublicFooter = () => (
    <footer className="abl-pub-footer">
        <nav aria-label="קישורים באתר">
            {FOOTER_LINKS.map(({ to, label }) => <Link key={to} to={to}>{label}</Link>)}
        </nav>
        <p>{MEDICAL_NOTE}</p>
    </footer>
);

export const AppPromoBar = () => (isOnboarded() ? null : (
    <aside className="abl-pub-promo" dir="rtl">
        <p><strong>{APP_PROMO.title}</strong><span>{APP_PROMO.text}</span></p>
        <Link to="/start">{APP_PROMO.cta}</Link>
    </aside>
));

const PublicLayout = ({ children }) => {
    const onboarded = isOnboarded();
    return (
        <div className="abl-pub" dir="rtl">
            <AuroraBackground />
            <header className="abl-pub-top">
                <Link to="/" className="abl-pub-logo" aria-label="אבאל'ה, לדף הבית">
                    <img src="/images/logo.png" alt="אבאל'ה" />
                </Link>
                <nav aria-label="ניווט ראשי">
                    {NAV.map(({ to, label }) => <NavLink key={to} to={to}>{label}</NavLink>)}
                </nav>
                <Link to={onboarded ? '/' : '/start'} className="abl-pub-top-cta">
                    {onboarded ? 'לאפליקציה' : 'מתחילים'}
                </Link>
            </header>
            <main className="abl-pub-main">{children}</main>
            <PublicFooter />
            <AppPromoBar />
        </div>
    );
};

export default PublicLayout;
