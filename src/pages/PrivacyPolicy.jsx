import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRIVACY, PAGE_META } from '../data/sitePages';
import { usePageMeta } from './public/publicHooks';

const Parts = ({ parts }) => (Array.isArray(parts) ? parts : [parts]).map((part, i) => (
    typeof part === 'string' ? <React.Fragment key={i}>{part}</React.Fragment> : (
        <a key={i} href={part.href} style={{ color: '#60a5fa' }}
            {...(part.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : { dir: 'ltr' })}>
            {part.text}
        </a>
    )
));

const Block = ({ block, first }) => (block.list ? (
    <ul style={{ margin: 0, paddingInlineStart: '20px' }}>
        {block.list.map((item) => <li key={item}>{item}</li>)}
    </ul>
) : (
    <p style={{ margin: first ? 0 : '10px 0 0' }}><Parts parts={block} /></p>
));

const PrivacyPolicy = () => {
    usePageMeta({ ...PAGE_META.privacy, path: '/privacy' });
    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff', minHeight: '100dvh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={24} />
                </Link>
                <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield color="var(--primary)" />
                    {PRIVACY.title}
                </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '28px' }}>{PRIVACY.updated}</p>

            {PRIVACY.sections.map((section) => (
                <section key={section.title} style={{ marginBottom: '26px' }}>
                    <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>{section.title}</h2>
                    <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7 }}>
                        {section.blocks.map((block, i) => <Block key={i} block={block} first={i === 0} />)}
                    </div>
                </section>
            ))}

            <div style={{ height: '40px' }} />
        </div>
    );
};

export default PrivacyPolicy;
