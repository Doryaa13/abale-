import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, User, Bookmark, BookmarkCheck } from 'lucide-react';
import { fetchGuidesData } from '../services/sheetsService';
import localGuidesData from '../data/guides_db.json';

const getReadingTime = (content) => {
    if (!content || typeof content !== 'string') return '3 דק\'';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} דק'`;
};

const ArticlePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const findArticle = (data) => {
            const decodedId = decodeURIComponent(id);

            for (const month of data) {
                const art = month.articles?.find(a =>
                    (a.id && a.id === decodedId) ||
                    (a.title && a.title === decodedId)
                );

                if (art) return art;
            }
            return null;
        };

        // First: try local data (instant)
        let found = findArticle(localGuidesData);

        if (found) {
            setArticle(found);
            const savedArts = JSON.parse(localStorage.getItem('abale_saved_articles') || '{}');
            setIsSaved(!!savedArts[found.title]);
        } else {
            // Second: try fetched Google Sheets data (async)
            fetchGuidesData().then(fetchedData => {
                if (fetchedData) {
                    const fetchedFound = findArticle(fetchedData);
                    if (fetchedFound) {
                        setArticle(fetchedFound);
                        const savedArts = JSON.parse(localStorage.getItem('abale_saved_articles') || '{}');
                        setIsSaved(!!savedArts[fetchedFound.title]);
                    } else {
                        setNotFound(true);
                    }
                } else {
                    setNotFound(true);
                }
            });
        }
    }, [id]);

    const toggleSave = () => {
        if (!article) return;
        const savedArts = JSON.parse(localStorage.getItem('abale_saved_articles') || '{}');
        const articleId = article.title; // ALWAYS use title to sync with Tests.jsx & SavedArticles.jsx
        const newState = !isSaved;

        if (newState) savedArts[articleId] = true;
        else delete savedArts[articleId];

        localStorage.setItem('abale_saved_articles', JSON.stringify(savedArts));
        setIsSaved(newState);
    };

    if (notFound) return (
        <div className="min-h-screen bg-bg-core flex flex-col items-center justify-center text-gray-400 gap-4 px-6">
            <span className="material-symbols-outlined text-5xl opacity-30">article</span>
            <p className="text-lg">המאמר לא נמצא</p>
            <button
                // We want to force going to the tests/articles tab on back, to avoid returning to Home accidentally (since article is a full screen overlay)
                onClick={() => navigate('/', { state: { targetTab: 'tests' } })}
                className="px-6 py-2 rounded-lg bg-neon-purple/20 text-neon-purple border border-neon-purple/30 text-sm hover:bg-neon-purple/30 transition-colors"
            >
                חזרה למאמרים
            </button>
        </div>
    );

    if (!article) return (
        <div className="min-h-screen bg-bg-core flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 text-sm">טוען מאמר...</span>
            </div>
        </div>
    );

    const defaultGradient = article.gradient || 'linear-gradient(135deg, #11151c 0%, #161e29 100%)';

    return (
        <div className="min-h-screen bg-bg-core flex flex-col">

            {/* Navbar Overlay */}
            <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
                <button
                    onClick={() => navigate(-1)} // Assuming user came from /tests or /saved
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors pointer-events-auto shadow-lg"
                >
                    <ArrowRight size={24} />
                </button>

                <div className="flex gap-3 pointer-events-auto">
                    <button
                        onClick={toggleSave}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg"
                    >
                        {isSaved ? <BookmarkCheck size={20} className="text-neon-purple fill-neon-purple" /> : <Bookmark size={20} />}
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div
                className="relative h-[350px] w-full bg-cover bg-center shrink-0"
                style={{
                    backgroundImage: article.image ? `url(${article.image})` : undefined,
                    background: !article.image ? defaultGradient : undefined
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-bg-core"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-bg-core via-bg-core/60 to-transparent"></div>

                {/* Title & Meta */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <span className="inline-block px-3 py-1 rounded bg-neon-purple/20 text-neon-purple text-xs font-bold tracking-wider mb-3 backdrop-blur-sm border border-neon-purple/20 shadow-[0_0_15px_rgba(188,19,254,0.3)]">
                        מאמר
                    </span>
                    <h1 className="text-2xl font-bold text-white leading-tight mb-4 drop-shadow-xl">
                        {article.title}
                    </h1>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-dark border border-gray-700 flex items-center justify-center overflow-hidden">
                            <User size={20} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{article.author || 'צוות אבאלה'}</p>
                            <p className="text-xs text-gray-400">{getReadingTime(article.content)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-w-2xl mx-auto w-full pb-20">
                {typeof article.content === 'string' ? (
                    article.content.split('\n').map((paragraph, idx) => (
                        paragraph.trim() ? (
                            <p key={idx} className="text-gray-300 leading-relaxed mb-4 text-base">
                                {paragraph}
                            </p>
                        ) : null
                    ))
                ) : (
                    <p className="text-gray-300 leading-relaxed text-base">{article.content}</p>
                )}
            </div>
        </div>
    );
};

export default ArticlePage;
