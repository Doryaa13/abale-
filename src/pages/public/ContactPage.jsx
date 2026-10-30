import React from 'react';
import PublicLayout from './PublicLayout';
import { usePageMeta } from './publicHooks';
import { CONTACT, CONTACT_EMAIL, PAGE_META } from '../../data/sitePages';

const ContactPage = () => {
    usePageMeta({ ...PAGE_META.contact, path: '/contact' });
    return (
        <PublicLayout>
            <section className="abl-pub-hero">
                <h1>{CONTACT.title}</h1>
                <p>{CONTACT.intro}</p>
            </section>
            <section className="abl-pub-section">
                <a className="abl-pub-btn" data-primary href={`mailto:${CONTACT_EMAIL}`} dir="ltr">{CONTACT_EMAIL}</a>
                <p className="abl-pub-text">{CONTACT.note}</p>
            </section>
        </PublicLayout>
    );
};

export default ContactPage;
