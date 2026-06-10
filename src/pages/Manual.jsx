
import React, { useState, useEffect } from 'react';
import { fetchGuidesData } from '../services/sheetsService'; // Import fetch function
import localGuidesData from '../data/guides_db.json'; // Keep local for initial state/fallback
import { Calendar, Info, ChevronDown, ChevronUp, User, Clock, ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react';
import DateModal from '../components/DateModal';
import { getPregnancyMonth } from '../utils/pregnancyUtils';
import AdSense from '../components/AdSense';

const Manual = ({ currentWeek }) => {
    const currentMonth = getPregnancyMonth(currentWeek);

    // State for Dynamic Data
    const [guidesData, setGuidesData] = useState(localGuidesData);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchGuidesData();
            if (data && data.length > 0) {
                setGuidesData(data);
            }
        };
        loadData();
    }, []);

    const guide = guidesData.find(g => g.month === currentMonth) ||
        guidesData.find(g => g.month === 5); // Fallback

    const [expandedInfo, setExpandedInfo] = useState({}); // { examId: true }
    const [selectedArticle, setSelectedArticle] = useState(null); // Article Object
    const [dates, setDates] = useState({}); // { examId: "2024-05-20" }
    const [savedArticles, setSavedArticles] = useState({}); // { articleId: true }

    // Modal State
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [activeExamId, setActiveExamId] = useState(null);

    // Load saved dates on mount
    useEffect(() => {
        const savedReminders = localStorage.getItem('abale_reminders');
        if (savedReminders) {
            setDates(JSON.parse(savedReminders));
        }
    }, []);

    const toggleInfo = (id) => {
        setExpandedInfo(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDateSelect = (dateString) => {
        const newDates = { ...dates, [activeExamId]: dateString };
        setDates(newDates);
        localStorage.setItem('abale_reminders', JSON.stringify(newDates));
    };

    const toggleSave = (id, e) => {
        e.stopPropagation();
        setSavedArticles(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '100px' }}>

            {/* Header - Sticky */}
            <div style={{
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                background: 'rgba(11, 17, 32, 0.95)', // var(--bg-core) with opacity
                backdropFilter: 'blur(8px)',
                paddingTop: '25px', // Same padding as Log.jsx
                paddingBottom: '20px',
                marginLeft: '-20px',
                marginRight: '-20px',
                paddingLeft: '20px',
                paddingRight: '20px',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'all 0.3s ease'
            }}>
                <div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>המדריך למשתמש</span>
                    <h1 style={{ fontSize: '2rem', lineHeight: 1 }}>מדריך לחודש {currentMonth}</h1>
                </div>
            </div>

            {guide ? (
                <>
                    {/* Section 1: Exams */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'white', letterSpacing: '0.5px' }}>בדיקות החודש</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {guide.exams?.map((exam) => {
                                const isExpanded = !!expandedInfo[exam.id];

                                return (
                                    <div key={exam.id} className="card-glass" style={{
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                        transition: 'transform 0.2s ease',
                                    }}>
                                        <div style={{ padding: '24px', position: 'relative' }}>

                                            {/* Title Row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                                                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600, color: 'white' }}>{exam.name}</h3>
                                                <button
                                                    onClick={() => toggleInfo(exam.id)}
                                                    style={{
                                                        background: isExpanded ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
                                                        border: '1px solid rgba(255,255,255,0.4)', // White border for contrast
                                                        borderRadius: '50%',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white', // Always white icon
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                                                        zIndex: 10,
                                                        position: 'relative' // Required for z-index to work
                                                    }}
                                                >
                                                    {isExpanded ? <ChevronUp size={20} /> : <Info size={20} />}
                                                </button>
                                            </div>

                                            {/* Date Picker Trigger (Custom) */}
                                            <div
                                                onClick={() => {
                                                    setActiveExamId(exam.id);
                                                    setIsDateModalOpen(true);
                                                }}
                                                style={{
                                                    background: dates[exam.id] ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.3)',
                                                    borderRadius: '12px',
                                                    padding: '0 16px',
                                                    height: '48px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    border: dates[exam.id] ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}>
                                                <Calendar size={18} color={dates[exam.id] ? 'var(--primary)' : '#94a3b8'} />
                                                <div style={{ flex: 1, color: dates[exam.id] ? 'white' : '#64748b', fontSize: '0.95rem' }}>
                                                    {dates[exam.id] ? new Date(dates[exam.id]).toLocaleDateString('he-IL') : 'מתי הבדיקה?'}
                                                </div>
                                            </div>

                                        </div>

                                        {/* Info Drawer - Smoother Animation */}
                                        <div style={{
                                            maxHeight: isExpanded ? '500px' : '0',
                                            opacity: isExpanded ? 1 : 0,
                                            padding: isExpanded ? '0 24px 24px 24px' : '0 24px 0 24px', // Animate padding to avoid jump
                                            overflow: 'hidden',
                                            transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                        }}>
                                            <div style={{
                                                paddingTop: '20px',
                                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                                color: '#cbd5e1',
                                                lineHeight: 1.6,
                                                fontSize: '0.95rem'
                                            }}>
                                                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>למה זה חשוב?</strong>
                                                {exam.info}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                    {/* --- Ad Placeholder (Between Data) --- */}
                    <div style={{ marginBottom: '40px' }}>
                        <AdSense style={{ marginTop: '20px' }} />
                    </div>

                    {/* Section 2: Professional Articles */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '4px', height: '24px', background: 'var(--accent)', borderRadius: '2px' }}></div>
                            <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'white', letterSpacing: '0.5px' }}>מאמרים של מקצוענים</h2>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            overflowX: 'auto',
                            paddingBottom: '20px',
                            scrollSnapType: 'x mandatory',
                            // Hide scrollbar but keep functionality
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }} className="hide-scrollbar">
                            <style>{`
                                .hide-scrollbar::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>

                            {guide.articles?.map((article, idx) => {
                                const isSaved = savedArticles[article.id || idx];
                                return (
                                    <div
                                        key={idx}
                                        className="card article-card"
                                        onClick={() => setSelectedArticle(article)}
                                        style={{
                                            padding: 0,
                                            height: '260px',
                                            minWidth: '280px', // Carousel fixed width
                                            maxWidth: '85vw',
                                            flexShrink: 0,
                                            scrollSnapAlign: 'start',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            background: article.gradient,
                                            position: 'relative',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            borderRadius: '20px',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        {/* Image Background */}
                                        {article.image && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                backgroundImage: `url(${article.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                zIndex: 0,
                                                transition: 'transform 0.5s ease',
                                            }}></div>
                                        )}

                                        {/* Gradient Overlay */}
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)', zIndex: 1 }} />

                                        {/* Save Button */}
                                        <button
                                            onClick={(e) => toggleSave(article.id || idx, e)}
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                zIndex: 10,
                                                background: 'rgba(255,255,255,0.2)',
                                                backdropFilter: 'blur(5px)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: isSaved ? '#fbbf24' : 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isSaved ? <BookmarkCheck size={16} fill="#fbbf24" /> : <Bookmark size={16} />}
                                        </button>

                                        {/* Content with Blur */}
                                        <div style={{
                                            position: 'relative',
                                            zIndex: 2,
                                            padding: '16px',
                                            background: 'rgba(20, 20, 30, 0.4)',
                                            backdropFilter: 'blur(12px)',
                                            borderTop: '1px solid rgba(255,255,255,0.1)',
                                        }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: '6px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{article.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={10} color="white" />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{article.author}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Article Full Screen Modal */}
                    {
                        selectedArticle && (
                            <div style={{
                                position: 'fixed', inset: 0, background: 'var(--bg-core)', zIndex: 100, overflowY: 'auto',
                                animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                            }}>
                                {/* Hero */}
                                <div style={{
                                    height: '300px',
                                    background: selectedArticle.image ? `url(${selectedArticle.image}) center / cover` : selectedArticle.gradient,
                                    position: 'relative'
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))' }}></div>

                                    <button
                                        onClick={() => setSelectedArticle(null)}
                                        style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.4)', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backdropFilter: 'blur(10px)', zIndex: 10, cursor: 'pointer' }}
                                    >
                                        <ArrowLeft size={24} />
                                    </button>

                                    <div style={{ position: 'absolute', bottom: '30px', right: '20px', left: '20px' }}>
                                        <h1 style={{ fontSize: '2rem', color: 'white', marginBottom: '8px', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{selectedArticle.title}</h1>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.95)' }}>
                                            <div style={{ background: 'white', padding: '2px', borderRadius: '50%' }}>
                                                <User size={20} color="black" />
                                            </div>
                                            <span style={{ fontSize: '1rem', fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{selectedArticle.author}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '25px', lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                    {selectedArticle.content}
                                </div>
                            </div>
                        )
                    }

                </>
            ) : (
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <p>אין נתונים בגרסת הדמו לחודש זה.</p>
                </div>
            )}

            <style>{`
@keyframes slideUp { from { transform: translateY(100 %); } to { transform: translateY(0); } }
`}</style>

            <DateModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onSelect={handleDateSelect}
                initialDate={dates[activeExamId]}
            />

        </div >
    );
};

export default Manual;
