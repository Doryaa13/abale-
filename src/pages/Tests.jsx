import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, X, Info, Check, ChevronDown, Clock, CalendarDays, CalendarPlus } from 'lucide-react';
import { fetchGuidesData, fetchWeeksData } from '../services/sheetsService';
import localGuidesData from '../data/guides_db.json';
import localWeeksData from '../data/weeks_db.json';
import { getPregnancyMonth } from '../utils/pregnancyUtils';
import DateModal from '../components/DateModal';
import AdSense from '../components/AdSense';
import AuroraBackground from '../components/AuroraBackground';
import { accentVars, rgba } from '../utils/accent';

const DISPLAY_FONT = "'Space Grotesk', 'Heebo', sans-serif";
const EXAM_ACCENTS = ['#22d3ee', '#a78bfa', '#fb923c', '#f472b6'];
const ARTICLE_ACCENT = '#a78bfa';

const getReadingTime = (content) => {
    if (!content || typeof content !== 'string') return '3 דק\'';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} דק'`;
};

// Stored exam dates are local "YYYY-MM-DD" strings — parse without a UTC shift.
const parseLocalDate = (value) => {
    if (!value) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
    return isNaN(d) ? null : d;
};

// Icon per exam, picked from words in its name (Material Symbols names).
// Order matters: "לחץ דם" must match before the generic "דם".
const getExamIcon = (name = '') => {
    if (name.includes('לחץ')) return 'monitor_heart';
    if (name.includes('אקו') || name.includes('לב')) return 'ecg_heart';
    if (name.includes('שתן')) return 'water_drop';
    if (name.includes('חיסון') || name.includes('חיסונים')) return 'vaccines';
    if (name.includes('דם') || name.includes('ספירת') || name.includes('סוכר') || name.includes('העמס')) return 'bloodtype';
    if (name.includes('גנטי') || name.includes('מי שפיר') || name.includes('סיסי') || name.includes('NIPT')) return 'biotech';
    if (name.includes('סקיר') || name.includes('אולטרסאונד') || name.includes('שקיפות') || name.includes('מערכות')) return 'pregnant_woman';
    return 'stethoscope';
};

// Small ring + "done/total" chip for the header.
const ProgressChip = ({ done, total }) => {
    const complete = total > 0 && done === total;
    const r = 8;
    const c = 2 * Math.PI * r;
    const color = complete ? '#34d399' : '#22d3ee';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px 3px 6px', borderRadius: '999px',
            background: complete ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${complete ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.09)'}`,
            transition: 'all 0.4s ease',
        }}>
            <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
                <circle cx="10" cy="10" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
                <circle
                    cx="10" cy="10" r={r} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * (1 - (total ? done / total : 0))}
                    style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
                />
            </svg>
            <span style={{ fontFamily: DISPLAY_FONT, fontSize: '12.5px', fontWeight: 700, color: complete ? '#6ee7b7' : '#e2e8f0' }}>
                {done}/{total}
            </span>
        </span>
    );
};

const Tests = ({ currentWeek }) => {
    const navigate = useNavigate();

    // --- State ---
    const [guidesData, setGuidesData] = useState(localGuidesData);
    const [weeksData, setWeeksData] = useState(localWeeksData);

    // Exam State: { [examId]: { done: boolean, date: string | null } }
    const [examState, setExamState] = useState({});

    // Articles State
    const [savedArticles, setSavedArticles] = useState({});
    const [selectedArticle, setSelectedArticle] = useState(null);

    // UI State
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [activeExamId, setActiveExamId] = useState(null);
    const [expandedExamId, setExpandedExamId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // --- Effects ---

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            const [guides, weeks] = await Promise.all([fetchGuidesData(), fetchWeeksData()]);
            if (guides && guides.length > 0) setGuidesData(guides);
            if (weeks && weeks.length > 0) setWeeksData(weeks);
        };
        loadData();
    }, []);

    // Load Persistence
    useEffect(() => {
        const savedExams = localStorage.getItem('abale_tests_data');
        if (savedExams) setExamState(JSON.parse(savedExams));

        const savedArts = localStorage.getItem('abale_saved_articles');
        if (savedArts) setSavedArticles(JSON.parse(savedArts));
    }, []);

    // Save Persistence
    const updateExamState = (id, updates) => {
        const newState = {
            ...examState,
            [id]: { ...examState[id], ...updates }
        };
        setExamState(newState);
        localStorage.setItem('abale_tests_data', JSON.stringify(newState));
    };

    const toggleSaveArticle = (id, e) => {
        e.stopPropagation();
        const newState = { ...savedArticles, [id]: !savedArticles[id] };
        setSavedArticles(newState);
        localStorage.setItem('abale_saved_articles', JSON.stringify(newState));
    };

    const handleToggleDone = (e, examId, currentDoneState) => {
        e.stopPropagation();
        const newDoneState = !currentDoneState;
        updateExamState(examId, { done: newDoneState });
        if (newDoneState) {
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        }
    };


    // --- Derived Data ---
    // Month is driven by the content table (week → month); formula is fallback only.
    const currentMonth = weeksData.find(w => w.week === currentWeek)?.month ?? getPregnancyMonth(currentWeek);
    const currentGuide = guidesData.find(g => g.month === currentMonth) || guidesData.find(g => g.month === 1) || guidesData[0]; // Fallback to month 1

    // Filter Exams (ensure distinct IDs)
    const exams = currentGuide?.exams || [];
    const articles = currentGuide?.articles || [];

    const doneExams = exams.filter(exam => examState[exam.id]?.done).length;
    const thisYear = new Date().getFullYear();

    return (
        <div className="w-full max-w-md mx-auto relative flex flex-col">
            <AuroraBackground blobs={['rgba(34,211,238,0.14)', 'rgba(167,139,250,0.15)', 'rgba(244,114,182,0.10)']} />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <header className="abl-rise" style={{ '--d': '0ms', padding: '28px 20px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            בדיקות החודש
                        </h1>
                        <button
                            onClick={() => setIsInfoModalOpen(true)}
                            aria-label="מילה על בדיקות"
                            style={{
                                width: '38px', height: '38px', padding: 0, flexShrink: 0,
                                borderRadius: '13px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#67e8f9', cursor: 'pointer',
                                background: 'linear-gradient(160deg, rgba(0,229,255,0.16), rgba(59,130,246,0.05))',
                                border: '1px solid rgba(0,229,255,0.25)',
                                boxShadow: '0 8px 22px -8px rgba(0,229,255,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
                            }}
                        >
                            <Info size={19} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', color: '#94a3b8' }}>מעקב רפואי ולוגיסטי - חודש {currentMonth}</span>
                        {exams.length > 0 && <ProgressChip done={doneExams} total={exams.length} />}
                    </div>
                </header>

                <main style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* ── Exams: a journey with one station per exam ──── */}
                    {exams.length > 0 && (
                        <div>
                            {exams.map((exam, idx) => {
                                const isDone = examState[exam.id]?.done;
                                const date = examState[exam.id]?.date;
                                const isExpanded = expandedExamId === exam.id;
                                const accent = EXAM_ACCENTS[idx % EXAM_ACCENTS.length];
                                const dateObj = parseLocalDate(date);
                                const dateLabel = dateObj
                                    ? dateObj.toLocaleDateString('he-IL', {
                                        weekday: 'short', day: 'numeric', month: 'long',
                                        ...(dateObj.getFullYear() !== thisYear ? { year: 'numeric' } : {}),
                                    })
                                    : null;
                                const isLast = idx === exams.length - 1;
                                // A completed exam folds to a compact card (its text opens on demand).
                                const showInfo = !isDone || isExpanded;
                                const collapsedMask = isExpanded ? 'none' : 'linear-gradient(180deg, #000 45%, transparent 100%)';

                                // Show an ad slot between exams (after the 2nd), only when
                                // there are enough exams for it to actually fall in the middle.
                                const showAdAfter = idx === 1 && exams.length > 2;

                                return (
                                    <React.Fragment key={exam.id || idx}>
                                        <div className="abl-tl-item abl-rise" style={{ ...accentVars(accent), '--d': `${90 + idx * 90}ms` }}>
                                            {/* Station on the rail */}
                                            <div className="abl-tl-rail">
                                                {isDone ? (
                                                    <div key="done" className="abl-tl-node abl-pop" data-state="done">
                                                        <Check size={22} strokeWidth={3.2} />
                                                    </div>
                                                ) : dateObj ? (
                                                    <span key="date" className="abl-cal-tile abl-pop" style={{ width: '46px', height: '50px' }}>
                                                        <span className="abl-cal-tile-top" style={{ height: '15px', fontSize: '8.5px' }}>
                                                            {dateObj.toLocaleDateString('he-IL', { month: 'short' })}
                                                        </span>
                                                        <span className="abl-cal-tile-day" style={{ fontSize: '19px' }}>{dateObj.getDate()}</span>
                                                    </span>
                                                ) : (
                                                    <div key="pending" className="abl-tl-node" data-state="pending">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </div>
                                                )}
                                                {(!isLast || showAdAfter) && <div className="abl-tl-line" data-done={!!isDone} />}
                                            </div>

                                            {/* Card */}
                                            <article className="abl-exam" data-done={!!isDone} style={{ flex: 1, minWidth: 0, padding: '16px' }}>
                                                {/* Corner glow */}
                                                <span aria-hidden="true" className="abl-breathe" style={{
                                                    position: 'absolute', top: '-80px', right: '-60px',
                                                    width: '210px', height: '210px', borderRadius: '50%',
                                                    background: `radial-gradient(circle, ${isDone ? 'rgba(52,211,153,0.16)' : rgba(accent, 0.15)}, transparent 68%)`,
                                                    pointerEvents: 'none', transition: 'background 0.5s ease',
                                                }} />

                                                {/* Header: type icon + name */}
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span className="abl-exam-icon">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '25px' }}>{getExamIcon(exam.name)}</span>
                                                    </span>
                                                    <h3 style={{
                                                        margin: 0, fontSize: '1.14rem', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.01em',
                                                        color: isDone ? '#d1fae5' : 'white', transition: 'color 0.4s ease',
                                                    }}>
                                                        {exam.name}
                                                    </h3>
                                                </div>

                                                {/* Info — ~3 lines with a fade; hidden on completed exams until opened */}
                                                {showInfo && (
                                                    <div style={{
                                                        position: 'relative',
                                                        marginTop: '12px',
                                                        maxHeight: isExpanded ? '600px' : '5em',
                                                        overflow: 'hidden',
                                                        transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        WebkitMaskImage: collapsedMask,
                                                        maskImage: collapsedMask,
                                                    }}>
                                                        <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.65, color: '#cbd5e1' }}>{exam.info}</p>
                                                    </div>
                                                )}

                                                <button
                                                    className="abl-pill-btn"
                                                    onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                                                    style={{ position: 'relative', marginTop: '10px', background: 'var(--accent-faint)' }}
                                                >
                                                    {isExpanded ? 'סגור' : 'קרא עוד'}
                                                    <ChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.35s' }} />
                                                </button>

                                                {/* Action bar: date + done */}
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: '10px', marginTop: '14px' }}>
                                                    <button
                                                        className="abl-date-btn"
                                                        data-set={!!dateObj}
                                                        onClick={() => { setActiveExamId(exam.id); setIsDateModalOpen(true); }}
                                                        style={{ background: dateObj ? 'var(--accent-faint)' : 'rgba(255,255,255,0.03)' }}
                                                    >
                                                        <span style={{
                                                            width: '34px', height: '34px', borderRadius: '11px', flexShrink: 0,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: 'var(--accent)', background: 'var(--accent-faint)', border: '1px solid var(--accent-line)',
                                                        }}>
                                                            {dateObj ? <CalendarDays size={17} /> : <CalendarPlus size={17} />}
                                                        </span>
                                                        <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>תאריך הבדיקה</span>
                                                            <span style={{
                                                                fontSize: '13.5px', fontWeight: 700, lineHeight: 1.3,
                                                                color: dateObj ? 'white' : 'var(--accent)',
                                                            }}>
                                                                {dateLabel || 'לחץ לקביעת תאריך'}
                                                            </span>
                                                        </span>
                                                    </button>
                                                    <button
                                                        className="abl-done-btn"
                                                        aria-pressed={!!isDone}
                                                        aria-label="סימון שהבדיקה בוצעה"
                                                        onClick={(e) => handleToggleDone(e, exam.id, isDone)}
                                                        style={{
                                                            width: '54px', height: 'auto', minHeight: '54px', borderRadius: '16px',
                                                            background: isDone ? 'linear-gradient(145deg, #6ee7b7, #10b981)' : 'rgba(0,0,0,0.25)',
                                                        }}
                                                    >
                                                        <Check size={24} strokeWidth={3.2} />
                                                    </button>
                                                </div>
                                            </article>
                                        </div>

                                        {showAdAfter && (
                                            <div className="abl-tl-item abl-rise" style={{ '--d': '300ms' }}>
                                                <div className="abl-tl-rail">
                                                    <div className="abl-tl-line" data-done={!!isDone} style={{ marginTop: 0 }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <AdSense style={{ margin: '0' }} />
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Articles ────────────────────────────────────── */}
                    {articles.length > 0 && (
                        <section className="abl-rise" style={{ '--d': `${120 + exams.length * 80}ms`, marginTop: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px', padding: '0 2px' }}>
                                <span style={{
                                    width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: ARTICLE_ACCENT,
                                    background: `linear-gradient(160deg, ${rgba(ARTICLE_ACCENT, 0.22)}, ${rgba(ARTICLE_ACCENT, 0.06)})`,
                                    border: `1px solid ${rgba(ARTICLE_ACCENT, 0.32)}`,
                                    boxShadow: `0 0 18px -6px ${rgba(ARTICLE_ACCENT, 0.6)}`,
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>article</span>
                                </span>
                                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'white', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
                                    מאמרים וכתבות
                                </h2>
                                <span style={{
                                    marginInlineStart: 'auto', fontSize: '12px', fontWeight: 600, color: '#94a3b8',
                                    padding: '3px 10px', borderRadius: '999px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                }}>{articles.length} מאמרים</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {articles.map((article, idx) => {
                                    const isSaved = savedArticles[article.title || article.id || idx];
                                    const hasImage = !!article.image;
                                    const defaultGradient = article.gradient || 'linear-gradient(135deg, #11151c 0%, #161e29 100%)';
                                    const featured = idx === 0;

                                    return (
                                        <article
                                            key={idx}
                                            className="abl-article"
                                            onClick={() => {
                                                // Always navigate by TITLE (consistent across local and Google Sheets data)
                                                if (article.title) {
                                                    navigate(`/article/${encodeURIComponent(article.title)}`);
                                                }
                                            }}
                                        >
                                            <div className="abl-article-media" style={{
                                                height: featured ? '210px' : '170px',
                                                background: hasImage ? '#1e293b' : defaultGradient,
                                            }}>
                                                {hasImage && <img src={article.image} alt={article.title} loading="lazy" />}
                                                <div aria-hidden="true" style={{
                                                    position: 'absolute', inset: 0,
                                                    background: 'linear-gradient(180deg, rgba(10,15,24,0.15) 0%, rgba(10,15,24,0) 35%, rgba(16,24,34,0.96) 100%)',
                                                }} />

                                                <span className="abl-chip-glass" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                                    <Clock size={12} strokeWidth={2.5} />
                                                    {getReadingTime(article.content)}
                                                </span>

                                                {/* Save Button */}
                                                <button
                                                    onClick={(e) => toggleSaveArticle(article.title || article.id || idx, e)}
                                                    aria-pressed={!!isSaved}
                                                    aria-label="שמירת מאמר"
                                                    style={{
                                                        position: 'absolute', top: '10px', left: '10px', zIndex: 2,
                                                        width: '40px', height: '40px', padding: 0, borderRadius: '14px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', color: 'white',
                                                        background: isSaved ? 'linear-gradient(145deg, #a78bfa, #7c3aed)' : 'rgba(10,15,24,0.55)',
                                                        border: `1px solid ${isSaved ? 'rgba(196,181,253,0.6)' : 'rgba(255,255,255,0.16)'}`,
                                                        boxShadow: isSaved ? '0 0 20px -4px rgba(167,139,250,0.8)' : 'none',
                                                        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                                                        transition: 'background 0.3s ease, box-shadow 0.3s ease',
                                                    }}
                                                >
                                                    {isSaved
                                                        ? <BookmarkCheck size={18} className="abl-pop" />
                                                        : <Bookmark size={18} />}
                                                </button>
                                            </div>

                                            <div style={{ position: 'relative', padding: '0 18px 18px', marginTop: featured ? '-26px' : '-20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 700, color: ARTICLE_ACCENT }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ARTICLE_ACCENT, boxShadow: `0 0 8px ${ARTICLE_ACCENT}` }} />
                                                        מאמר
                                                    </span>
                                                    <span aria-hidden="true" style={{
                                                        width: '34px', height: '34px', borderRadius: '12px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: ARTICLE_ACCENT,
                                                        background: rgba(ARTICLE_ACCENT, 0.1),
                                                        border: `1px solid ${rgba(ARTICLE_ACCENT, 0.28)}`,
                                                    }}>
                                                        <ArrowLeft size={17} />
                                                    </span>
                                                </div>
                                                <h3 className="abl-clamp-2" style={{
                                                    margin: '0 0 6px', fontSize: featured ? '1.32rem' : '1.12rem',
                                                    fontWeight: 800, color: 'white', lineHeight: 1.3, letterSpacing: '-0.01em',
                                                }}>
                                                    {article.title}
                                                </h3>
                                                <p className="abl-clamp-2" style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#94a3b8' }}>
                                                    {typeof article.content === 'string' ? article.content.substring(0, 140) + '...' : 'לחץ לקריאה מלאה'}
                                                </p>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                </main>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div style={{
                    position: 'fixed', left: 0, right: 0, bottom: '96px', zIndex: 100,
                    display: 'flex', justifyContent: 'center', pointerEvents: 'none',
                }}>
                    <div style={{
                        animation: 'abl-toast-in 0.45s cubic-bezier(0.2, 0.9, 0.25, 1.1) both',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 18px 9px 10px', borderRadius: '999px',
                        background: 'linear-gradient(160deg, rgba(20,44,36,0.96), rgba(10,22,19,0.96))',
                        border: '1px solid rgba(52,211,153,0.45)',
                        boxShadow: '0 14px 36px -10px rgba(0,0,0,0.85), 0 0 26px -8px rgba(52,211,153,0.6)',
                        color: 'white',
                    }}>
                        <span style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'linear-gradient(145deg, #6ee7b7, #10b981)', color: '#04281c',
                        }}>
                            <Check size={15} strokeWidth={3.2} />
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>מעולה! סימנתי שהבדיקה בוצעה</span>
                    </div>
                </div>
            )}

            {/* Date Modal */}
            <DateModal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onSelect={(date) => {
                    updateExamState(activeExamId, { date });
                    setIsDateModalOpen(false);
                }}
                initialDate={examState[activeExamId]?.date}
            />

            {/* Info Modal */}
            {isInfoModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px',
                }}>
                    <div
                        className="abl-backdrop"
                        onClick={() => setIsInfoModalOpen(false)}
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(3,7,14,0.78)',
                            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                        }}
                    />
                    <div className="abl-modal" style={{
                        position: 'relative', width: '100%', maxWidth: '380px',
                        padding: '28px 22px 22px', borderRadius: '28px', textAlign: 'center',
                        background: 'radial-gradient(120% 70% at 50% 0%, rgba(34,211,238,0.12), transparent 60%), linear-gradient(165deg, rgba(30,44,62,0.97), rgba(13,20,30,0.98))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}>
                        <button
                            onClick={() => setIsInfoModalOpen(false)}
                            aria-label="סגירה"
                            style={{
                                position: 'absolute', top: '16px', left: '16px', // Left for Hebrew RTL
                                width: '34px', height: '34px', padding: 0, borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#cbd5e1', cursor: 'pointer',
                            }}
                        >
                            <X size={17} />
                        </button>

                        <div style={{
                            width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#67e8f9',
                            background: 'linear-gradient(160deg, rgba(0,229,255,0.2), rgba(59,130,246,0.06))',
                            border: '1px solid rgba(0,229,255,0.3)',
                            boxShadow: '0 0 30px -6px rgba(0,229,255,0.55)',
                        }}>
                            <Info size={30} />
                        </div>

                        <h3 style={{ fontSize: '1.45rem', color: 'white', margin: '0 0 14px', fontWeight: 800, fontFamily: 'inherit' }}>
                            מילה על בדיקות
                        </h3>

                        <div style={{ color: '#cbd5e1', fontSize: '0.96rem', lineHeight: '1.7', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ margin: 0 }}>
                                תשמע אחי, רוב הבדיקות שאתם הולכים לעשות (ויש הרבה) הן בגדר <strong style={{ color: 'white' }}>המלצה וסטטיסטיקה</strong>, שנועדו להוריד סיכויים למחלות ולהיות בצד הבטוח.
                            </p>
                            <p style={{ margin: 0 }}>
                                העניין עם בדיקות הוא <strong style={{ color: 'white' }}>מאוד סובייקטיבי</strong>. הדבר הכי חשוב פה הוא שתשבו, תדברו עם בת הזוג ותחליטו <strong style={{ color: 'white' }}>ביחד</strong> מה מתאים לכם ולערכים שלכם.
                            </p>
                            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.88rem' }}>
                                בסוף, אין פה נכון או לא נכון מוחלט. תקשורת זה שם המשחק פה.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsInfoModalOpen(false)}
                            style={{
                                width: '100%', padding: '13px', marginTop: '24px',
                                borderRadius: '14px', border: 'none',
                                background: 'linear-gradient(90deg, #0ea5e9, #3b82f6)',
                                color: 'white', fontSize: '1rem', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer',
                                boxShadow: '0 12px 26px -10px rgba(59,130,246,0.8)',
                            }}
                        >
                            הבנתי אחי
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Tests;
