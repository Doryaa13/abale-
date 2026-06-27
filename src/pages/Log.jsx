
import React, { useState, useEffect } from 'react';
import localWeeksData from '../data/weeks_db.json';
import { fetchWeeksData } from '../services/sheetsService';
import AdSense from '../components/AdSense';
import { useAuth } from '../context/AuthContext';
import RegistrationGate from '../components/RegistrationGate';

const OpsLog = ({ currentWeek }) => {
    // Gate: the user's first week is free; from the next week on, require sign-in.
    const { isLoggedIn } = useAuth();
    const initialWeek = parseInt(localStorage.getItem('abale_initial_week'), 10);
    const firstWeekFree = !initialWeek || currentWeek <= initialWeek;
    const tasksLocked = !firstWeekFree && !isLoggedIn;
    // --- Logic Section (Unchanged) ---
    const compliments = [
        "אתה אגדה. האשה שלך זכתה בפיס.",
        "תכלס? שיחקת אותה. אבא של השנה.",
        "מלך העולם. יאללה, לך תנוח.",
        "סיימת הכל. רמת מוכנות: 100%.",
        "וואלה, הפתעת לטובה. תמשיך ככה.",
        "אלוף האלופים. העובר מוסר ד\"ש.",
        "גבר על חלל. עכשיו בירה?",
        "משימה הושלמה בהצלחה יתרה. רות סוף.",
        "אין עליך. באמת. כל הכבוד.",
        "שר האוצר והביטחון של הבית. הצדעה.",
        "אתה בדרך הנכונה להיות האבא הכי קול בגן."
    ];
    const [randomCompliment, setRandomCompliment] = useState(compliments[0]);

    const [checkedState, setCheckedState] = useState(() => {
        const saved = localStorage.getItem('abale_log_checks');
        return saved ? JSON.parse(saved) : {};
    });
    const [expandedInfo, setExpandedInfo] = useState({});
    const [showCeleb, setShowCeleb] = useState(false);
    const [weeksData, setWeeksData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchWeeksData();
            if (data && data.length > 0) {
                setWeeksData(data);
            }
        };
        loadData();
    }, []);

    const currentWeekData = weeksData.length > 0
        ? (weeksData.find(w => w.week === currentWeek) || weeksData[0])
        : (localWeeksData.find(w => w.week === currentWeek) || localWeeksData[0]);

    const weekTasks = currentWeekData?.tasks || [];

    const toggleInfo = (key) => {
        setExpandedInfo(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleCheck = (categoryIndex, itemIndex) => {
        const key = `${currentWeek}-${categoryIndex}-${itemIndex}`;
        const newState = { ...checkedState, [key]: !checkedState[key] };
        setCheckedState(newState);
        localStorage.setItem('abale_log_checks', JSON.stringify(newState));

        const totalTasks = currentWeekData.tasks?.reduce((acc, cat) => acc + cat.items.length, 0) || 0;
        const checkedCount = Object.entries(newState)
            .filter(([k, val]) => k.startsWith(`${currentWeek}-`) && val)
            .length;

        if (totalTasks > 0 && checkedCount === totalTasks && !checkedState[key]) {
            const rand = Math.floor(Math.random() * compliments.length);
            setRandomCompliment(compliments[rand]);
            setShowCeleb(true);
            setTimeout(() => setShowCeleb(false), 3000);
        }
    };

    const countChecked = () => Object.entries(checkedState)
        .filter(([key, val]) => key.startsWith(`${currentWeek}-`) && val)
        .length;
    const totalTasks = currentWeekData.tasks?.reduce((acc, cat) => acc + cat.items.length, 0) || 0;
    const progress = totalTasks === 0 ? 0 : Math.round((countChecked() / totalTasks) * 100);

    // --- Mapped Icons Helper ---
    const getCategoryIcon = (catName) => {
        if (catName.includes('עבורה') || catName.includes('אמא')) return 'favorite';
        if (catName.includes('בית')) return 'home_work';
        if (catName.includes('עבורי') || catName.includes('אבא')) return 'fitness_center';
        if (catName.includes('רפואי') || catName.includes('בדיקות')) return 'monitor_heart';
        if (catName.includes('ציוד') || catName.includes('קניות')) return 'shopping_bag';
        return 'assignment';
    };

    return (
        <div className="w-full max-w-md mx-auto relative flex flex-col font-body text-gray-100">
            {/* Header Section */}
            <header className="pt-8 pb-4 px-6 relative z-10">
                <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                        <h1 className="font-display text-4xl font-bold text-white tracking-tight">משימות שבוע {currentWeek}</h1>
                    </div>
                    <p className="text-gray-400 text-sm font-body">אזור פיקוד ובקרה</p>
                </div>
            </header>

            {/* Sticky live progress bar — stays pinned at the top while scrolling the
                task list, so checking off a task shows the fill update instantly. */}
            {totalTasks > 0 && (
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    background: 'rgba(17,25,33,0.88)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    padding: '10px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                            {countChecked()}/{totalTasks} משימות
                        </span>
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            color: progress === 100 ? '#10b981' : 'var(--primary)',
                            fontFamily: 'monospace'
                        }}>
                            {progress}%
                        </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: progress === 100
                                ? 'linear-gradient(90deg, #10b981, #34d399)'
                                : 'linear-gradient(90deg, var(--primary), #00f3ff)',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease',
                            boxShadow: progress === 100 ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(25,127,230,0.4)'
                        }} />
                    </div>
                </div>
            )}

            <RegistrationGate
                locked={tasksLocked}
                title={`משימות שבוע ${currentWeek} — בהרשמה חינמית`}
                subtitle="את משימות השבוע הראשון פתחת בחינם. הירשם (2 שניות) כדי להמשיך לקבל את כל המשימות השבועיות ולשמור את ההתקדמות."
            >
            <main className="flex-1 px-4 space-y-6">
                {currentWeekData.tasks ? currentWeekData.tasks.map((category, catIdx) => {
                    // Define Themes Array (Cyclic)
                    // Order: Blue, Orange, Purple (Neon), Green
                    const themes = [
                        {
                            color: 'text-neon-blue',
                            border: 'border-t-neon-blue',
                            shadow: 'shadow-[0_0_15px_rgba(0,243,255,0.15)]',
                            gradient: 'from-neon-blue',
                            bg: 'bg-neon-blue/10',
                            badgeBorder: 'border-neon-blue/30',
                            hover: 'hover:border-neon-blue/30',
                            checkbox: '#00f3ff',
                            icon: 'person'
                        },
                        {
                            color: 'text-neon-orange',
                            border: 'border-t-neon-orange',
                            shadow: 'shadow-[0_0_15px_rgba(255,153,0,0.15)]',
                            gradient: 'from-neon-orange',
                            bg: 'bg-neon-orange/10',
                            badgeBorder: 'border-neon-orange/30',
                            hover: 'hover:border-neon-orange/30',
                            checkbox: '#ff9900',
                            icon: 'home'
                        },
                        {
                            color: 'text-neon-purple',
                            border: 'border-t-neon-purple',
                            shadow: 'shadow-[0_0_15px_rgba(188,19,254,0.15)]', // Nice Purple
                            gradient: 'from-neon-purple',
                            bg: 'bg-neon-purple/10',
                            badgeBorder: 'border-neon-purple/30',
                            hover: 'hover:border-neon-purple/30',
                            checkbox: '#bc13fe',
                            icon: 'female' // Or whatever fits
                        },
                        {
                            color: 'text-neon-green',
                            border: 'border-t-neon-green',
                            shadow: 'shadow-[0_0_15px_rgba(204,255,0,0.15)]',
                            gradient: 'from-neon-green',
                            bg: 'bg-neon-green/10',
                            badgeBorder: 'border-neon-green/30',
                            hover: 'hover:border-neon-green/30',
                            checkbox: '#ccff00',
                            icon: 'monitor_heart'
                        }
                    ];

                    // Select theme by index relative to 3 since user asked for 3rd to be purple
                    // Design asked: 3rd category = Purple.
                    // My array: 0=Blue, 1=Orange, 2=Purple.
                    // So just catIdx % 4 works perfectly.

                    const theme = themes[catIdx % themes.length];

                    // Allow override by name if needed, but for now rely on index for the specific "3rd is purple" request
                    // Or prioritize index-based mapping to ensure visual diversity

                    const themeColor = theme.color;
                    const borderColor = theme.border;
                    const shadowColor = theme.shadow;
                    const gradientFrom = theme.gradient;
                    const badgeBg = theme.bg;
                    const badgeBorder = theme.badgeBorder;
                    const hoverBorder = theme.hover;
                    const checkboxColor = theme.checkbox;

                    // Determine semantic icon if possible, else default from theme
                    let iconName = theme.icon;
                    let badgeText = 'MISSION';

                    const catName = category.category;
                    if (catName.includes('עבורה') || catName.includes('אמא')) {
                        iconName = 'female'; badgeText = 'PRIORITY';
                    } else if (catName.includes('בית')) {
                        iconName = 'home'; badgeText = 'BASE';
                    } else if (catName.includes('רפואי') || catName.includes('בדיקות')) {
                        iconName = 'monitor_heart'; badgeText = 'MEDIC';
                    } else if (catName.includes('כסף') || catName.includes('קניות')) {
                        iconName = 'shopping_bag'; badgeText = 'LOGISTICS';
                    }

                    return (
                        <section key={catIdx} className={`tactical-card rounded-2xl overflow-hidden relative group border-t-2 ${borderColor} ${shadowColor}`}>
                            <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l ${gradientFrom} to-transparent opacity-70`}></div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className={`material-symbols-outlined ${themeColor}`}>{iconName}</span>
                                        {category.category}
                                    </h2>

                                </div>

                                <div className="space-y-3">
                                    {category.items.map((item, itemIdx) => {
                                        const isObj = typeof item === 'object';
                                        const text = isObj ? item.text : item;
                                        const description = isObj ? (item.description || item.info) : null;
                                        const isChecked = checkedState[`${currentWeek}-${catIdx}-${itemIdx}`];
                                        const infoKey = `${catIdx}-${itemIdx}`;
                                        const isInfoExpanded = !!expandedInfo[infoKey];

                                        return (
                                            <div key={itemIdx} className="space-y-2">
                                                <div
                                                    className={`flex items-center gap-3 p-3 bg-surface-dark/60 border border-white/5 rounded-lg ${hoverBorder} transition-colors cursor-pointer`}
                                                    onClick={() => toggleCheck(catIdx, itemIdx)}
                                                >
                                                    <div className="checkbox-wrapper relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!isChecked}
                                                            readOnly
                                                            className="peer absolute w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="w-5 h-5 border-2 border-gray-600 rounded flex items-center justify-center transition-all duration-200 bg-black/40"
                                                            style={isChecked ? { backgroundColor: `${checkboxColor}33`, borderColor: checkboxColor, boxShadow: `0 0 8px ${checkboxColor}80` } : {}}
                                                        >
                                                            <svg className={`w-3.5 h-3.5 opacity-0 transition-opacity duration-200 pointer-events-none ${isChecked ? 'opacity-100' : ''}`}
                                                                style={{ color: checkboxColor }}
                                                                fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    <span className={`flex-1 text-sm font-medium transition-colors ${isChecked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                        {text}
                                                    </span>

                                                    {description && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleInfo(infoKey); }}
                                                            className={`transition-colors ${isInfoExpanded ? themeColor : 'text-gray-500 hover:text-white'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-lg">info</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Expanded Description */}
                                                <div
                                                    style={{
                                                        maxHeight: isInfoExpanded ? '500px' : '0',
                                                        opacity: isInfoExpanded ? 1 : 0
                                                    }}
                                                    className="overflow-hidden transition-all duration-300 ease-in-out px-1"
                                                >
                                                    <div className={`p-3 text-sm text-gray-400 bg-white/5 rounded-lg border-r-2 ${borderColor.replace('border-t-', 'border-r-')}`}>
                                                        <strong className={`${themeColor} block mb-1 text-xs uppercase tracking-wider`}>משימה:</strong>
                                                        {description}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    );
                }) : (
                    <div className="text-center py-10">
                        <span className="material-symbols-outlined text-4xl text-gray-600 mb-4">bedtime</span>
                        <p className="text-gray-400">אין משימות מיוחדות לשבוע זה. תנוח, אחי.</p>
                    </div>
                )}
            </main>
            </RegistrationGate>

            {/* Sticky Ad Placeholder */}
            <div className="fixed bottom-[70px] left-0 right-0 z-[45] flex justify-center pointer-events-none h-[60px] overflow-hidden">
                <div className="w-full max-w-md pointer-events-auto">
                    <AdSense style={{ display: 'flex', justifyContent: 'center' }} />
                </div>
            </div>

            {/* Celebration Modal */}
            {showCeleb && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-[fadeIn_0.3s]">
                    <div className="glass-panel p-8 rounded-2xl text-center max-w-xs mx-4 border border-green-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <span className="material-icons text-6xl text-green-500 mb-4">emoji_events</span>
                        <h2 className="text-2xl font-bold text-white mb-2 font-display">סיימת הכל!</h2>
                        <p className="text-gray-300 mb-6 font-body leading-relaxed">{randomCompliment}</p>
                        <button
                            onClick={() => setShowCeleb(false)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-green-900/20"
                        >
                            סגור, אני יודע שאני תותח
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
};

export default OpsLog;
