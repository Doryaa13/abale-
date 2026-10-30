import { useEffect, useState } from 'react';
import { WEEKS_DATA, GUIDES_DATA, fetchWeeksData, fetchGuidesData } from '../../services/contentService';
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from '../../data/sitePages';

/** The current content: starts with what's on the device, then the published copy. */
export const usePublicContent = () => {
    const [weeks, setWeeks] = useState(WEEKS_DATA);
    const [guides, setGuides] = useState(GUIDES_DATA);
    useEffect(() => {
        let cancelled = false;
        fetchWeeksData().then((w) => { if (!cancelled) setWeeks(w); });
        fetchGuidesData().then((g) => { if (!cancelled) setGuides(g); });
        return () => { cancelled = true; };
    }, []);
    return { weeks, guides };
};

const setMeta = (selector, attr, value) => {
    const el = document.head.querySelector(selector);
    if (el) el.setAttribute(attr, value);
};

/** Keeps the tab title, description and canonical URL in step with the page. */
export const usePageMeta = ({ title = SITE_TITLE, description = SITE_DESCRIPTION, path }) => {
    useEffect(() => {
        document.title = title;
        setMeta('meta[name="description"]', 'content', description);
        setMeta('meta[property="og:title"]', 'content', title);
        setMeta('meta[property="og:description"]', 'content', description);
        const url = `${SITE_URL}${path}`;
        setMeta('link[rel="canonical"]', 'href', url);
        setMeta('meta[property="og:url"]', 'content', url);
        window.scrollTo(0, 0);
        return () => { document.title = SITE_TITLE; };
    }, [title, description, path]);
};

export const isOnboarded = () => {
    try { return !!localStorage.getItem('abale_onboarding_done'); } catch { return false; }
};
