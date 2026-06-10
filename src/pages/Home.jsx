import { Calendar, Hash, ChevronDown } from 'lucide-react';
import AdSense from '../components/AdSense';
import { fetchWeeksData } from '../services/sheetsService';
import { getPregnancyMonth } from '../utils/pregnancyUtils';
import { useState, useEffect } from 'react';
import localWeeksData from '../data/weeks_db.json';

// Calculate current week from stored registration data (same logic as App.jsx)
const calcWeekFromStorage = () => {
    const regDateStr = localStorage.getItem('abale_registration_date');
    const initialWeek = localStorage.getItem('abale_initial_week');
    if (!regDateStr || !initialWeek) return null;
    const regDate = new Date(regDateStr);
    const now = new Date();
    const diffDays = Math.floor(Math.max(0, now - regDate) / (1000 * 60 * 60 * 24));
    const weeksPassed = Math.floor(diffDays / 7);
    let validWeek = parseInt(initialWeek, 10) + weeksPassed;
    if (isNaN(validWeek)) return null;
    return Math.min(40, Math.max(1, validWeek));
};

// ── Glass expandable card ──────────────────────────────────────────────────────
const GlassExpandableCard = ({
    title,
    dotColor,
    rightBorderColor,
    containerBg,
    containerBorder,
    text,
    tags,
    tagColor,
    tagBg,
    tagBorderColor,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div style={{
            background: containerBg,
            border: `1px solid ${containerBorder}`,
            borderRight: `3px solid ${rightBorderColor}`,
            borderRadius: '18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            padding: '15px 16px',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                <div style={{
                    width: '6px', height: '6px',
                    background: dotColor,
                    borderRadius: '50%',
                    boxShadow: `0 0 6px ${dotColor}`,
                    flexShrink: 0,
                }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{title}</span>
            </div>

            {/* Text — collapses to ~3 lines, expands to full */}
            <div style={{
                maxHeight: isExpanded ? '600px' : '3.9em',
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                    {typeof text === 'string'
                        ? text.split('\n').map((line, i, arr) => (
                            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                        ))
                        : text}
                </p>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {tags.map((tag, idx) => (
                            <span key={idx} style={{
                                fontSize: '10px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: 500,
                                background: tagBg,
                                color: tagColor,
                                border: `1px solid ${tagBorderColor}`,
                            }}>
                                # {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Read more button — plain text, always visible */}
            <button
                onClick={() => setIsExpanded(prev => !prev)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#93c5fd',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '8px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontFamily: 'inherit',
                }}
            >
                {isExpanded ? 'פחות' : 'המשך קריאה'}
                <ChevronDown
                    size={11}
                    color="#93c5fd"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                />
            </button>
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
const Home = ({ currentWeek, setCurrentWeek }) => {
    const displayName = localStorage.getItem('abale_user_name');
    const firstName = displayName ? displayName.split(' ')[0] : null;

    // Rotating daily greeting
    const getGreeting = () => {
        const greetings = [
            (name) => name ? `מה העניינים, ${name}? 👋` : 'מה העניינים? 👋',
            (name) => name ? `שלום, ${name}! 👋` : 'שלום! 👋',
            (name) => name ? `מה קורה, ${name}? 👋` : 'מה קורה? 👋',
            (name) => name ? `היי, ${name}! 👋` : 'היי! 👋',
            (name) => name ? `נעים לראות אותך, ${name} 👋` : 'נעים לראות אותך 👋',
        ];
        const dayIndex = new Date().getDate() % greetings.length;
        return greetings[dayIndex](firstName);
    };

    // Data (local JSON first, then Google Sheets)
    const [weeksData, setWeeksData] = useState(localWeeksData);

    // Switch-day state
    const [switchDay, setSwitchDay] = useState('');
    const [daysUntilSwitch, setDaysUntilSwitch] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pendingDayIndex, setPendingDayIndex] = useState(null);
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    useEffect(() => {
        const regDateStr = localStorage.getItem('abale_registration_date');
        if (regDateStr) {
            const regDate = new Date(regDateStr);
            setSwitchDay(days[regDate.getDay()]);

            const now = new Date();
            const diffMs = now - regDate;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            const daysIntoCurrentWeek = diffDays % 7;
            const daysLeft = Math.ceil(7 - daysIntoCurrentWeek);
            setDaysUntilSwitch(daysLeft === 7 ? 0 : daysLeft);
        }
    }, []);

    // Adjusts the stored registration date to change the switch day
    const handleSwitchDayChange = (newDayIndex) => {
        const regDateStr = localStorage.getItem('abale_registration_date');
        if (!regDateStr) return;

        const currentRegDate = new Date(regDateStr);
        const currentDayIndex = currentRegDate.getDay();
        const diff = newDayIndex - currentDayIndex;
        currentRegDate.setDate(currentRegDate.getDate() + diff);

        const newDateStr = currentRegDate.toISOString();
        localStorage.setItem('abale_registration_date', newDateStr);

        const newWeek = calcWeekFromStorage();
        if (newWeek) setCurrentWeek(newWeek);

        setSwitchDay(days[newDayIndex]);

        const now = new Date();
        const diffMs = now - currentRegDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        const daysIntoCurrentWeek = diffDays % 7;
        const daysLeft = Math.ceil(7 - daysIntoCurrentWeek);
        setDaysUntilSwitch(daysLeft === 7 ? 0 : daysLeft);

        setIsEditModalOpen(false);
    };

    const handleOpenDayModal = () => {
        const idx = days.indexOf(switchDay);
        setPendingDayIndex(idx >= 0 ? idx : 0);
        setIsEditModalOpen(true);
    };

    const handleConfirmDay = () => {
        if (pendingDayIndex !== null) {
            handleSwitchDayChange(pendingDayIndex);
        }
    };

    // Load data from Google Sheets (falls back to local JSON on failure)
    useEffect(() => {
        const loadData = async () => {
            const data = await fetchWeeksData();
            if (data && data.length > 0) {
                setWeeksData(data);
            }
        };
        loadData();
    }, []);

    // Current week data (with local fallback)
    const currentWeekData = weeksData.find(w => w.week === currentWeek) || weeksData[0];

    // Baby size emoji by week
    const getBabySizeEmoji = (week) => {
        if (week <= 4) return '🫐';
        if (week <= 6) return '🍇';
        if (week <= 8) return '🫒';
        if (week <= 10) return '🍓';
        if (week <= 12) return '🍋';
        if (week <= 14) return '🥝';
        if (week <= 16) return '🍊';
        if (week <= 18) return '🥑';
        if (week <= 20) return '🍌';
        if (week <= 22) return '🥕';
        if (week <= 24) return '🌽';
        if (week <= 26) return '🥦';
        if (week <= 28) return '🍆';
        if (week <= 30) return '🥥';
        if (week <= 32) return '🎃';
        if (week <= 34) return '🍈';
        if (week <= 36) return '🍉';
        if (week <= 38) return '🎯';
        return '👶';
    };

    // Data fields (with fallbacks for missing Sheets data)
    const babySize = currentWeekData?.babySize || { object: 'לא ידוע', weight: '' };
    const partnerStatus = currentWeekData?.partnerStatus || { text: 'אין מידע', tags: [] };
    const babyStatus = currentWeekData?.babyStatus || { text: 'אין מידע', tags: [] };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentWeek]);

    // Derived calculations
    const progress = Math.min(100, Math.round((currentWeek / 40) * 100));
    const month = getPregnancyMonth(currentWeek);
    const trimester = Math.min(3, Math.ceil(currentWeek / 13));

    // SVG ring: r=38, circumference = 2π×38 ≈ 238.76
    const CIRC = 238.76;
    const dashOffset = CIRC - (CIRC * progress / 100);

    return (
        <div style={{ padding: '20px', maxWidth: '100%' }}>

            {/* ── Greeting ─────────────────────────────────────────────── */}
            <p style={{
                margin: '2px 0 20px 0',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'white',
            }}>{getGreeting()}</p>

            {/* ── Week ring ─────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 20px', position: 'relative' }}>
                {/* Ambient glow */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(0,229,255,0.07) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />

                <div style={{
                    position: 'relative',
                    width: '240px',
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {/* Rotating dashed outer ring */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '1px dashed rgba(255,255,255,0.05)',
                        animation: 'spin 60s linear infinite',
                    }} />

                    {/* SVG progress ring */}
                    <svg
                        style={{ position: 'absolute', width: '240px', height: '240px', transform: 'rotate(-90deg)' }}
                        viewBox="0 0 88 88"
                    >
                        <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                        <circle
                            cx="44" cy="44" r="38"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={CIRC}
                            strokeDashoffset={dashOffset}
                            style={{
                                filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.45))',
                                transition: 'stroke-dashoffset 0.5s ease',
                            }}
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#00e5ff" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Center text */}
                    <div style={{ textAlign: 'center', zIndex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#8896aa', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>שבוע</div>
                        <div style={{ fontSize: '62px', fontWeight: 900, color: 'white', lineHeight: 1, fontFamily: 'monospace' }}>{currentWeek}</div>
                        <div style={{ fontSize: '10px', color: '#8896aa', letterSpacing: '1px', marginTop: '4px' }}>{progress}% DONE</div>
                    </div>

                    {/* Month pill — right */}
                    <div style={{
                        position: 'absolute',
                        right: '-22px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        textAlign: 'center',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}>
                        <div style={{ fontSize: '9px', color: '#8896aa', letterSpacing: '1px' }}>חודש</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>{month}</div>
                    </div>

                    {/* Trimester pill — left */}
                    <div style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderRadius: '12px',
                        padding: '8px 10px',
                        textAlign: 'center',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}>
                        <div style={{ fontSize: '8px', color: '#8896aa', letterSpacing: '0.5px' }}>טרימסטר</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#ccff00' }}>{trimester}</div>
                    </div>
                </div>
            </div>

            {/* ── Baby size card ───────────────────────────────────────── */}
            <section style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '12px',
            }}>
                <div style={{
                    width: '50px', height: '50px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px',
                    flexShrink: 0,
                }}>
                    {getBabySizeEmoji(currentWeek)}
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: '#8896aa', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>גודל משוער</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>{babySize.object}</div>
                    {babySize.weight && (
                        <div style={{ fontSize: '12px', color: '#8896aa' }}>
                            כ-{babySize.weight.replace(/[^\d]/g, '')} גרם
                        </div>
                    )}
                </div>
            </section>

            {/* ── Cards ────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Partner status */}
                <GlassExpandableCard
                    title="מה קורה עם בת הזוג?"
                    dotColor="#f472b6"
                    rightBorderColor="rgba(244,114,182,0.65)"
                    containerBg="rgba(244,114,182,0.04)"
                    containerBorder="rgba(244,114,182,0.13)"
                    text={partnerStatus.text}
                    tags={partnerStatus.tags || []}
                    tagColor="#f9a8d4"
                    tagBg="rgba(244,114,182,0.1)"
                    tagBorderColor="rgba(244,114,182,0.2)"
                />

                <AdSense style={{ margin: '4px 0' }} />

                {/* Baby status */}
                <GlassExpandableCard
                    title="מה קורה עם התינוק?"
                    dotColor="#818cf8"
                    rightBorderColor="rgba(129,140,248,0.6)"
                    containerBg="rgba(129,140,248,0.04)"
                    containerBorder="rgba(129,140,248,0.13)"
                    text={babyStatus.text}
                    tags={babyStatus.tags || []}
                    tagColor="#a5b4fc"
                    tagBg="rgba(129,140,248,0.1)"
                    tagBorderColor="rgba(129,140,248,0.2)"
                />

                {/* ── Switch day row — clickable ────────────────────────── */}
                <button
                    onClick={handleOpenDayModal}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        width: '100%',
                        fontFamily: 'inherit',
                        textAlign: 'right',
                    }}
                >
                    <div style={{
                        background: 'rgba(255,255,255,0.035)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '18px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                        padding: '11px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} color="#00e5ff" style={{ opacity: 0.7 }} />
                            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                {switchDay ? `מחליפים ביום ${switchDay}` : '...'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {daysUntilSwitch !== null && (
                                <span style={{
                                    fontSize: '11px',
                                    color: daysUntilSwitch === 0 ? '#10b981' : '#f59e0b',
                                    background: daysUntilSwitch === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                                    border: `1px solid ${daysUntilSwitch === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.18)'}`,
                                    borderRadius: '7px',
                                    padding: '3px 9px',
                                    fontWeight: 600,
                                }}>
                                    {daysUntilSwitch === 0 ? 'היום! 🎉' : `עוד ${daysUntilSwitch}י׳ ⚡`}
                                </span>
                            )}
                            <ChevronDown size={11} color="#64748b" />
                        </div>
                    </div>
                </button>

            </div>

            {/* ── DEV Controls ─────────────────────────────────────────── */}
            <div style={{ marginTop: '40px', padding: '20px', border: '1px dashed #334155', borderRadius: '8px', opacity: 0.5 }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>DEV CONTROLS</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))} style={{ padding: '5px 10px', background: '#334155', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>- שבוע</button>
                    <button onClick={() => setCurrentWeek(Math.min(40, currentWeek + 1))} style={{ padding: '5px 10px', background: '#334155', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>+ שבוע</button>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />
                    <button onClick={() => setCurrentWeek(Math.max(1, currentWeek - 4))} style={{ padding: '5px 10px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '5px', cursor: 'pointer' }}>- חודש</button>
                    <button onClick={() => setCurrentWeek(Math.min(40, currentWeek + 4))} style={{ padding: '5px 10px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '5px', cursor: 'pointer' }}>+ חודש</button>
                </div>
            </div>

            {/* ── Day picker modal ─────────────────────────────────────── */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    boxSizing: 'border-box',
                }}>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsEditModalOpen(false)}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(6px)',
                        }}
                    />

                    {/* Modal box */}
                    <div style={{
                        position: 'relative',
                        background: '#1a2738',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '22px',
                        padding: '24px 20px',
                        width: '100%',
                        maxWidth: '320px',
                        zIndex: 1,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                    }}>
                        <p style={{ color: 'white', fontSize: '15px', fontWeight: 700, margin: '0 0 4px', textAlign: 'right' }}>
                            באיזה יום משתנה השבוע?
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 14px', textAlign: 'right' }}>
                            בחר יום ולחץ אישור
                        </p>

                        {/* Day list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
                            {days.map((day, idx) => (
                                <button
                                    key={day}
                                    onClick={() => setPendingDayIndex(idx)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '11px 14px',
                                        borderRadius: '11px',
                                        border: pendingDayIndex === idx
                                            ? '1px solid rgba(0,229,255,0.3)'
                                            : '1px solid rgba(255,255,255,0.06)',
                                        background: pendingDayIndex === idx
                                            ? 'rgba(0,229,255,0.1)'
                                            : 'rgba(255,255,255,0.04)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: pendingDayIndex === idx ? 700 : 400,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        textAlign: 'right',
                                        width: '100%',
                                    }}
                                >
                                    <span>{day}</span>
                                    {pendingDayIndex === idx && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontWeight: 600,
                                }}
                            >
                                ביטול
                            </button>
                            <button
                                onClick={handleConfirmDay}
                                style={{
                                    flex: 2,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: '#197fe6',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                אישור ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;
