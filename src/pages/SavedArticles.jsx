import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bookmark, BookmarkX } from 'lucide-react';
import localGuidesData from '../data/guides_db.json';
import { fetchGuidesData } from '../services/sheetsService';

const SavedArticles = () => {
    const navigate = useNavigate();
    const [savedKeys, setSavedKeys] = useState({});
    const [savedArticles, setSavedArticles] = useState([]);

    const loadSaved = async () => {
        const saved = JSON.parse(localStorage.getItem('abale_saved_articles') || '{}');
        setSavedKeys(saved);

        if (Object.keys(saved).length === 0) {
            setSavedArticles([]);
            return;
        }

        try {
            // First try local
            let allData = localGuidesData;
            // Then try sheets (so we don't miss any dynamic ones)
            const fetched = await fetchGuidesData();
            if (fetched) allData = fetched;

            const results = [];
            const seenTitles = new Set();

            allData.forEach(guide => {
                (guide.articles || []).forEach((article, idx) => {
                    const title = article.title;
                    const isSaved = saved[title] || saved[article.id] || saved[idx];

                    if (isSaved && title && !seenTitles.has(title)) {
                        results.push({ ...article, month: guide.month, key: title });
                        seenTitles.add(title);
                    }
                });
            });
            setSavedArticles(results);
        } catch (err) {
            console.error('Failed to load saved articles', err);
        }
    };

    useEffect(() => {
        loadSaved();
    }, []);

    const unsave = (key, e) => {
        e.stopPropagation();
        const newSaved = { ...savedKeys };
        delete newSaved[key];
        setSavedKeys(newSaved);
        localStorage.setItem('abale_saved_articles', JSON.stringify(newSaved));
        setSavedArticles(prev => prev.filter(a => a.key !== key));
    };

    return (
        <div className="min-h-screen bg-bg-core" dir="rtl">
            {/* Header */}
            <header style={{
                padding: '20px',
                paddingTop: '70px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <ArrowRight size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: 0 }}>מאמרים שמורים</h1>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>המאמרים שסימנת לעצמך</p>
                </div>
            </header>

            <main style={{ padding: '0 20px 40px' }}>
                {savedArticles.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <Bookmark size={48} color="#334155" />
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>לא שמרת מאמרים עדיין</p>
                        <p style={{ color: '#475569', fontSize: '0.85rem' }}>תוכל לשמור מאמרים מלשונית הבדיקות</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {savedArticles.map((article, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(`/article/${encodeURIComponent(article.title)}`)}
                                style={{
                                    background: 'rgba(22, 30, 41, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {/* Color strip */}
                                <div style={{
                                    width: '4px',
                                    borderRadius: '4px',
                                    alignSelf: 'stretch',
                                    background: 'linear-gradient(to bottom, #8b5cf6, #3b82f6)',
                                    flexShrink: 0
                                }} />

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>
                                        {article.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#8b5cf6', fontFamily: 'monospace' }}>חודש {article.month}</span>
                                    </div>
                                </div>

                                {/* Unsave button */}
                                <button
                                    onClick={(e) => unsave(article.key, e)}
                                    title="הסר ממועדפים"
                                    style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', flexShrink: 0, padding: '4px' }}
                                >
                                    <BookmarkX size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SavedArticles;
