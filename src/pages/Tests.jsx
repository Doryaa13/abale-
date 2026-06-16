import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Bookmark, BookmarkCheck, X, Info } from 'lucide-react';
import { fetchGuidesData, fetchWeeksData } from '../services/sheetsService';
import localGuidesData from '../data/guides_db.json';
import localWeeksData from '../data/weeks_db.json';
import { getPregnancyMonth } from '../utils/pregnancyUtils';
import DateModal from '../components/DateModal';

const getReadingTime = (content) => {
    if (!content || typeof content !== 'string') return '3 דק\'';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} דק'`;
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

    return (
        <div className="w-full max-w-md mx-auto relative flex flex-col">

            {/* Header */}
            <header className="pt-8 pb-6 px-6 relative z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="font-display text-4xl font-bold text-white tracking-tight">בדיקות החודש</h1>
                        <button 
                            onClick={() => setIsInfoModalOpen(true)}
                            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue hover:bg-white/10 transition-colors"
                        >
                            <Info size={18} />
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm font-body">מעקב רפואי ולוגיסטי - חודש {currentMonth}</p>
                </div>
            </header>

            <main className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">

                {/* Exams Section */}
                <section>


                    <div className="space-y-4">
                        {exams.map((exam, idx) => {
                            const isDone = examState[exam.id]?.done;
                            const date = examState[exam.id]?.date;
                            const isExpanded = expandedExamId === exam.id;

                            // Cycle colors: Blue, Orange
                            const isBlue = idx % 2 === 0;
                            const themeColor = isBlue ? 'text-neon-blue' : 'text-neon-orange';
                            const borderColor = isBlue ? 'border-r-neon-blue' : 'border-r-neon-orange';
                            const hoverDecoration = isBlue ? 'decoration-neon-blue/50' : 'decoration-neon-orange/50';

                            return (
                                <div key={exam.id || idx} className={`tactical-card rounded-2xl overflow-hidden relative group border-r-2 ${borderColor} hover:border-r-4 transition-all duration-300`}>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-base font-bold text-white">{exam.name}</h3>
                                            {/* Original Checkbox restored */}
                                            <button
                                                onClick={(e) => handleToggleDone(e, exam.id, isDone)}
                                                className={`flex items-center justify-center w-6 h-6 rounded-md border transition-colors ${isDone ? 'bg-green-500/20 border-green-500' : 'bg-black/40 border-gray-500 hover:border-gray-400 hover:bg-black/60'}`}
                                            >
                                                {isDone && (
                                                    <span className="material-symbols-outlined text-green-400 text-[18px] font-bold">check</span>
                                                )}
                                            </button>
                                        </div>

                                        <div
                                            className="relative overflow-hidden transition-all duration-500 ease-in-out"
                                            style={{ maxHeight: isExpanded ? '500px' : '3.5em' }}
                                        >
                                            <p className="text-sm text-gray-400 leading-relaxed mb-4">{exam.info}</p>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-800/50">

                                            {/* Read More Button */}
                                            <button
                                                onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                                                className={`text-sm ${themeColor} hover:text-white transition-colors flex items-center gap-1 font-medium group-hover:underline ${hoverDecoration} underline-offset-4 w-fit`}
                                            >
                                                {isExpanded ? 'סגור' : 'קרא עוד'}
                                                <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'group-hover:-translate-x-1'}`}>arrow_back</span>
                                            </button>

                                            {/* Date Picker - Moved Below */}
                                            <div
                                                onClick={() => { setActiveExamId(exam.id); setIsDateModalOpen(true); }}
                                                className={`flex items-center gap-3 bg-surface-dark border rounded-lg px-3 py-2 transition-colors cursor-pointer w-full hover:bg-white/5 ${date ? 'border-primary/50' : 'border-gray-700 hover:border-gray-500'}`}
                                            >
                                                <span className={`material-symbols-outlined text-lg ${date ? 'text-primary' : 'text-gray-400'}`}>
                                                    {date ? 'event_available' : 'calendar_month'}
                                                </span>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-[10px] text-gray-500 font-mono tracking-wider">תאריך הבדיקה</span>
                                                    <span className={`text-sm ${date ? 'text-white font-medium' : 'text-gray-500'}`}>
                                                        {date ? new Date(date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'לחץ לקביעת תאריך'}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Articles Section */}
                {articles.length > 0 && (
                    <section className="overflow-hidden">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-neon-purple">article</span>
                                מאמרים וכתבות
                            </h2>
                            <span className="text-xs text-gray-600">{articles.length} מאמרים</span>
                        </div>

                        <div className="flex overflow-x-auto gap-4 pb-4 px-1 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
                            <style>{`
                                .no-scrollbar::-webkit-scrollbar {
                                    display: none;
                                }
                                .no-scrollbar {
                                    -ms-overflow-style: none; /* IE and Edge */
                                    scrollbar-width: none;  /* Firefox */
                                }
                            `}</style>
                            {articles.map((article, idx) => {
                                const isSaved = savedArticles[article.title || article.id || idx];
                                const hasImage = !!article.image;
                                const defaultGradient = article.gradient || 'linear-gradient(135deg, #11151c 0%, #161e29 100%)';

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            // Always navigate by TITLE (consistent across local and Google Sheets data)
                                            if (article.title) {
                                                navigate(`/article/${encodeURIComponent(article.title)}`);
                                            }
                                        }}
                                        className="block snap-center shrink-0 w-[260px] h-[300px] tactical-card rounded-2xl overflow-hidden relative group transition-transform hover:scale-[1.02] cursor-pointer"
                                    >
                                        <div className="h-40 w-full overflow-hidden relative bg-gray-800" style={{ background: !hasImage ? defaultGradient : undefined }}>
                                            {hasImage && (
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent"></div>

                                            <div className="absolute top-3 right-3 bg-[#11151c]/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded border border-gray-700">
                                                {getReadingTime(article.content)}
                                            </div>

                                            {/* Save Button */}
                                            <button
                                                onClick={(e) => toggleSaveArticle(article.title || article.id || idx, e)}
                                                className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-20"
                                            >
                                                {isSaved ? <BookmarkCheck size={14} className="text-neon-purple fill-neon-purple" /> : <Bookmark size={14} />}
                                            </button>
                                        </div>

                                        <div className="p-4 flex flex-col justify-between h-[calc(100%-160px)]">
                                            <div>
                                                <span className="text-neon-purple text-[10px] font-mono tracking-widest uppercase mb-1 block">מאמר</span>
                                                <h3 className="text-base font-bold text-white leading-tight mb-2 group-hover:text-neon-purple transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-xs text-gray-400 line-clamp-2">
                                                    {typeof article.content === 'string' ? article.content.substring(0, 60) + '...' : 'לחץ לקריאה מלאה'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

            </main>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-green-500/50 text-white px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)] z-[100] flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400 text-lg">task_alt</span>
                    <span className="font-bold text-sm whitespace-nowrap">מעולה! סימנתי שהבדיקה בוצעה</span>
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
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div className="card" style={{
                        position: 'relative', width: '100%', maxWidth: '400px',
                        background: 'var(--bg-panel)', padding: '30px 24px',
                        borderRadius: '24px', border: '1px solid var(--border-subtle)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center'
                    }}>
                        <button
                            onClick={() => setIsInfoModalOpen(false)}
                            style={{
                                position: 'absolute', top: '15px', left: '15px', // Left for Hebrew RTL
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: 'var(--text-muted)', borderRadius: '50%',
                                width: '30px', height: '30px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>
                        
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(59, 130, 246, 0.1)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                            border: '2px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <Info size={30} className="text-neon-blue" />
                        </div>

                        <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '15px', fontWeight: 'bold' }}>
                            מילה על בדיקות
                        </h3>

                        <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p>
                                תשמע אחי, רוב הבדיקות שאתם הולכים לעשות (ויש הרבה) הן בגדר <strong>המלצה וסטטיסטיקה</strong>, שנועדו להוריד סיכויים למחלות ולהיות בצד הבטוח. 
                            </p>
                            <p>
                                העניין עם בדיקות הוא <strong>מאוד סובייקטיבי</strong>. הדבר הכי חשוב פה הוא שתשבו, תדברו עם בת הזוג ותחליטו <strong>ביחד</strong> מה מתאים לכם ולערכים שלכם.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>
                                בסוף, אין פה נכון או לא נכון מוחלט. תקשורת זה שם המשחק פה.
                            </p>
                        </div>
                        
                        <button
                            onClick={() => setIsInfoModalOpen(false)}
                            style={{
                                width: '100%', padding: '12px', marginTop: '25px',
                                borderRadius: '12px', background: 'var(--primary)',
                                color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
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
