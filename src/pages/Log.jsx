
import React, { useState, useEffect, useMemo } from 'react';
import localWeeksData from '../data/weeks_db.json';
import { fetchWeeksData } from '../services/sheetsService';
import AdSense from '../components/AdSense';
import AuroraBackground from '../components/AuroraBackground';
import { useAuth } from '../context/AuthContext';
import RegistrationGate from '../components/RegistrationGate';
import { hexToRgb, rgba, accentVars } from '../utils/accent';

const DISPLAY_FONT = "'Space Grotesk', 'Heebo', sans-serif";

// ── Visual helpers ─────────────────────────────────────────────────────────────
const mixHex = (a, b, t) => {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    const m = (x, y) => Math.round(x + (y - x) * t);
    return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
};
// Same cyan → blue → violet journey as the beads around the home-screen orb.
const segmentColor = (i, n) => {
    const t = n <= 1 ? 0 : i / (n - 1);
    return t < 0.5 ? mixHex('#00e5ff', '#3b82f6', t * 2) : mixHex('#3b82f6', '#a78bfa', (t - 0.5) * 2);
};

// Category accents, cycled by category index: cyan, orange, purple, lime.
const CATEGORY_THEMES = [
    { accent: '#22d3ee', icon: 'person' },
    { accent: '#fb923c', icon: 'home' },
    { accent: '#c084fc', icon: 'female' },
    { accent: '#a3e635', icon: 'monitor_heart' },
];

// ── Confetti burst for the "all done" moment ───────────────────────────────────
const CONFETTI_COLORS = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa'];
const Confetti = () => {
    const pieces = useMemo(() => Array.from({ length: 48 }, (_, i) => {
        const round = Math.random() < 0.3;
        const w = 6 + Math.random() * 6;
        return {
            left: Math.random() * 100,
            delay: Math.random() * 0.4,
            duration: 1.7 + Math.random() * 1.3,
            x: (Math.random() - 0.5) * 180,
            rot: Math.random() * 720 - 360,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            w,
            h: round ? w : 8 + Math.random() * 9,
            round,
        };
    }), []);

    return (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {pieces.map((p, i) => (
                <span key={i} className="abl-confetti" style={{
                    left: `${p.left}%`,
                    width: `${p.w}px`, height: `${p.h}px`,
                    borderRadius: p.round ? '50%' : '2px',
                    background: p.color,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                    '--x': `${p.x}px`,
                    '--r': `${p.rot}deg`,
                }} />
            ))}
        </div>
    );
};

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

    const doneCount = countChecked();
    const allDone = progress === 100;

    return (
        <div className="w-full max-w-md mx-auto relative flex flex-col font-body text-gray-100">
            <AuroraBackground blobs={['rgba(34,211,238,0.14)', 'rgba(251,146,60,0.10)', 'rgba(192,132,252,0.12)']} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header Section */}
                <header className="abl-rise" style={{ '--d': '0ms', padding: '28px 20px 12px' }}>
                    <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        משימות שבוע{' '}
                        <span style={{
                            fontFamily: DISPLAY_FONT,
                            background: 'linear-gradient(180deg, #ffffff 20%, #67e8f9)',
                            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                            filter: 'drop-shadow(0 0 14px rgba(0,229,255,0.35))',
                        }}>{currentWeek}</span>
                    </h1>
                </header>

                {/* Sticky live progress — one segment per task, pinned while scrolling */}
                {totalTasks > 0 && (
                    <div className="abl-rise" style={{ '--d': '70ms', position: 'sticky', top: 0, zIndex: 40, padding: '8px 16px 10px' }}>
                        <div className="abl-glass" style={{
                            position: 'relative', overflow: 'hidden',
                            borderRadius: '18px', padding: '11px 14px 12px',
                            background: 'linear-gradient(160deg, rgba(30,44,62,0.85), rgba(12,18,28,0.88))',
                            borderColor: allDone ? 'rgba(52,211,153,0.35)' : undefined,
                            boxShadow: allDone ? '0 0 24px -6px rgba(52,211,153,0.45)' : undefined,
                        }}>
                            {allDone && <span className="abl-sheen" aria-hidden="true" />}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '9px' }}>
                                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                                    <span style={{ fontFamily: DISPLAY_FONT, color: 'white', fontWeight: 700, fontSize: '15px' }}>
                                        {doneCount}/{totalTasks}
                                    </span>{' '}
                                    משימות
                                </span>
                                <span style={{
                                    fontFamily: DISPLAY_FONT, fontSize: '16px', fontWeight: 700,
                                    color: allDone ? '#34d399' : '#67e8f9',
                                    textShadow: allDone ? '0 0 12px rgba(52,211,153,0.6)' : '0 0 12px rgba(0,229,255,0.4)',
                                    transition: 'color 0.4s ease',
                                }}>
                                    {progress}%
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '3px' }}>
                                {Array.from({ length: totalTasks }, (_, i) => {
                                    const lit = i < doneCount;
                                    const color = allDone ? '#34d399' : segmentColor(i, totalTasks);
                                    return (
                                        <span key={i} className="abl-seg" style={{
                                            background: lit ? color : undefined,
                                            boxShadow: lit ? `0 0 8px ${color}` : undefined,
                                        }} />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <RegistrationGate
                    locked={tasksLocked}
                    title={`משימות שבוע ${currentWeek} — בהרשמה חינמית`}
                    subtitle="את משימות השבוע הראשון פתחת בחינם. הירשם (2 שניות) כדי להמשיך לקבל את כל המשימות השבועיות ולשמור את ההתקדמות."
                >
                <main style={{ padding: '6px 16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {currentWeekData.tasks ? currentWeekData.tasks.map((category, catIdx) => {
                        const theme = CATEGORY_THEMES[catIdx % CATEGORY_THEMES.length];

                        // Determine semantic icon if possible, else default from theme
                        let iconName = theme.icon;
                        const catName = category.category;
                        if (catName.includes('עבורה') || catName.includes('אמא')) {
                            iconName = 'female';
                        } else if (catName.includes('בית')) {
                            iconName = 'home';
                        } else if (catName.includes('רפואי') || catName.includes('בדיקות')) {
                            iconName = 'monitor_heart';
                        } else if (catName.includes('כסף') || catName.includes('קניות')) {
                            iconName = 'shopping_bag';
                        }

                        const catDone = category.items.filter((_, i) => checkedState[`${currentWeek}-${catIdx}-${i}`]).length;
                        const catComplete = category.items.length > 0 && catDone === category.items.length;

                        return (
                            <React.Fragment key={catIdx}>
                            <section
                                className="abl-task-card abl-rise"
                                style={{ ...accentVars(theme.accent), '--d': `${140 + catIdx * 90}ms` }}
                            >
                                {/* Corner glow */}
                                <span aria-hidden="true" className="abl-breathe" style={{
                                    position: 'absolute', top: '-80px', right: '-60px',
                                    width: '200px', height: '200px', borderRadius: '50%',
                                    background: `radial-gradient(circle, ${rgba(theme.accent, 0.16)}, transparent 68%)`,
                                    pointerEvents: 'none',
                                }} />

                                {/* Category header */}
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px', padding: '0 2px' }}>
                                    <span className="abl-task-icon">
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{iconName}</span>
                                    </span>
                                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'white', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
                                        {category.category}
                                    </h2>
                                    <span className="abl-task-count" data-done={catComplete}>
                                        {catDone}/{category.items.length}
                                    </span>
                                </div>

                                {/* Tasks */}
                                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {category.items.map((item, itemIdx) => {
                                        const isObj = typeof item === 'object';
                                        const text = isObj ? item.text : item;
                                        const description = isObj ? (item.description || item.info) : null;
                                        const isChecked = checkedState[`${currentWeek}-${catIdx}-${itemIdx}`];
                                        const infoKey = `${catIdx}-${itemIdx}`;
                                        const isInfoExpanded = !!expandedInfo[infoKey];

                                        return (
                                            <div key={itemIdx}>
                                                <div
                                                    className="abl-task-row"
                                                    role="checkbox"
                                                    aria-checked={!!isChecked}
                                                    onClick={() => toggleCheck(catIdx, itemIdx)}
                                                >
                                                    <span className="abl-check">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3.2">
                                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>

                                                    <span className="abl-task-text">{text}</span>

                                                    {description && (
                                                        <button
                                                            className="abl-info-btn"
                                                            aria-expanded={isInfoExpanded}
                                                            onClick={(e) => { e.stopPropagation(); toggleInfo(infoKey); }}
                                                            style={{ background: isInfoExpanded ? 'var(--accent-faint)' : 'rgba(255,255,255,0.04)' }}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>info</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Expanded Description */}
                                                <div
                                                    style={{
                                                        maxHeight: isInfoExpanded ? '500px' : '0',
                                                        opacity: isInfoExpanded ? 1 : 0,
                                                        overflow: 'hidden',
                                                        transition: 'max-height 0.4s ease, opacity 0.3s ease',
                                                    }}
                                                >
                                                    <div className="abl-task-desc">
                                                        <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '4px', fontSize: '12px' }}>משימה:</strong>
                                                        {description}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* In-content ad slot, right after the first category */}
                            {catIdx === 0 && (
                                <div className="abl-rise" style={{ '--d': '200ms' }}>
                                    <AdSense style={{ margin: '0' }} />
                                </div>
                            )}
                            </React.Fragment>
                        );
                    }) : (
                        <div className="abl-rise" style={{ '--d': '140ms', textAlign: 'center', padding: '48px 0' }}>
                            <div style={{
                                width: '72px', height: '72px', margin: '0 auto 16px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#a78bfa',
                                background: 'radial-gradient(circle at 35% 30%, rgba(167,139,250,0.3), rgba(167,139,250,0.06) 70%)',
                                border: '1px solid rgba(167,139,250,0.3)',
                                boxShadow: '0 0 30px -6px rgba(167,139,250,0.5)',
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '34px' }}>bedtime</span>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>אין משימות מיוחדות לשבוע זה. תנוח, אחי.</p>
                        </div>
                    )}
                </main>
                </RegistrationGate>
            </div>

            {/* Celebration Modal */}
            {showCeleb && (
                <div className="abl-backdrop" style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(3,7,14,0.82)',
                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                }}>
                    <Confetti />
                    <div className="abl-modal" style={{
                        position: 'relative',
                        width: '100%', maxWidth: '320px', margin: '0 16px',
                        padding: '30px 24px 24px', textAlign: 'center',
                        borderRadius: '28px',
                        background: 'radial-gradient(120% 80% at 50% 0%, rgba(52,211,153,0.16), transparent 60%), linear-gradient(165deg, rgba(30,44,62,0.97), rgba(13,20,30,0.98))',
                        border: '1px solid rgba(52,211,153,0.3)',
                        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.85), 0 0 60px -16px rgba(52,211,153,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}>
                        <div className="abl-pop" style={{
                            width: '88px', height: '88px', margin: '0 auto 16px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'radial-gradient(circle at 35% 30%, rgba(251,191,36,0.4), rgba(251,191,36,0.08) 70%)',
                            border: '1px solid rgba(251,191,36,0.45)',
                            boxShadow: '0 0 40px -6px rgba(251,191,36,0.6)',
                            animationDelay: '0.15s',
                        }}>
                            <span className="material-icons" style={{ fontSize: '48px', color: '#fbbf24', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.6))' }}>emoji_events</span>
                        </div>
                        <h2 style={{
                            margin: '0 0 8px', fontSize: '1.7rem', fontWeight: 800,
                            background: 'linear-gradient(90deg, #ffffff, #6ee7b7)',
                            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                        }}>סיימת הכל!</h2>
                        <p style={{ color: '#cbd5e1', margin: '0 0 22px', fontSize: '15px', lineHeight: 1.6 }}>{randomCompliment}</p>
                        <button
                            onClick={() => setShowCeleb(false)}
                            style={{
                                width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
                                background: 'linear-gradient(90deg, #10b981, #34d399)',
                                color: '#04281c', fontSize: '15px', fontWeight: 800, fontFamily: 'inherit',
                                cursor: 'pointer',
                                boxShadow: '0 12px 28px -10px rgba(16,185,129,0.8)',
                            }}
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
