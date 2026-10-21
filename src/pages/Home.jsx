import { Calendar, Hash, ChevronDown, X, Ruler, Weight, Heart, Baby } from 'lucide-react';
import AdSense from '../components/AdSense';
import LifeOrb from '../components/LifeOrb';
import AuroraBackground from '../components/AuroraBackground';
import { fetchWeeksData } from '../services/sheetsService';
import { getPregnancyMonth } from '../utils/pregnancyUtils';
import { useState, useEffect } from 'react';
import localWeeksData from '../data/weeks_db.json';

const DISPLAY_FONT = "'Space Grotesk', 'Heebo', sans-serif";

// ── Baby-size icon ─────────────────────────────────────────────────────────────
// Tries to show a real photo at /images/week{N}.png (drop files into public/images
// and commit them). If no image exists for that week, falls back to the emoji.
const BabySizeIcon = ({ week, emoji }) => {
    const [imgFailed, setImgFailed] = useState(false);
    useEffect(() => { setImgFailed(false); }, [week]);

    if (imgFailed) return <span>{emoji}</span>;
    return (
        <img
            src={`/images/week${week}.png`}
            alt=""
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '3px' }}
        />
    );
};

// ── Pregnancy calendar (weeks → months → trimesters) ───────────────────────────
// Mirrors getPregnancyMonth() in pregnancyUtils.js. If that mapping ever changes,
// update it here too so the table stays in sync with the rest of the app.
const PREGNANCY_CALENDAR = [
    {
        trimester: 1,
        accent: '#14b8a6',
        months: [
            { month: 1, from: 1, to: 6, label: '1–6' },
            { month: 2, from: 7, to: 10, label: '7–10' },
            { month: 3, from: 11, to: 15, label: '11–15' },
        ],
    },
    {
        trimester: 2,
        accent: '#f97316',
        months: [
            { month: 4, from: 16, to: 19, label: '16–19' },
            { month: 5, from: 20, to: 23, label: '20–23' },
            { month: 6, from: 24, to: 27, label: '24–27' },
        ],
    },
    {
        trimester: 3,
        accent: '#f43f5e',
        months: [
            { month: 7, from: 28, to: 32, label: '28–32' },
            { month: 8, from: 33, to: 36, label: '33–36' },
            { month: 9, from: 37, to: 99, label: '37–40+' },
        ],
    },
];

// ── Shared modal shell (backdrop + animated glass panel) ───────────────────────
const ModalShell = ({ onClose, maxWidth, children }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', boxSizing: 'border-box',
    }}>
        <div
            className="abl-backdrop"
            onClick={onClose}
            style={{
                position: 'absolute', inset: 0,
                background: 'rgba(3,7,14,0.78)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            }}
        />
        <div className="abl-modal" style={{
            position: 'relative', zIndex: 1,
            background: 'linear-gradient(165deg, rgba(30,44,62,0.97), rgba(13,20,30,0.98))',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '26px',
            padding: '22px 20px',
            width: '100%', maxWidth,
            maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
            {children}
        </div>
    </div>
);

// Clean popup: a colored trimester badge beside a simple חודש | שבוע table.
// The month containing the current week is highlighted.
const WeekCalendarModal = ({ currentWeek, onClose }) => (
    <ModalShell onClose={onClose} maxWidth="360px">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <p style={{
                fontSize: '18px', fontWeight: 800, margin: 0,
                background: 'linear-gradient(90deg, #ffffff, #8be9ff)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
                לוח ההיריון
            </p>
            <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', width: '34px', height: '34px', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
            }}>
                <X size={16} color="#cbd5e1" />
            </button>
        </div>

        {/* Trimesters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {PREGNANCY_CALENDAR.map((tri, triIdx) => (
                <div key={tri.trimester} className="abl-rise" style={{
                    '--d': `${120 + triIdx * 90}ms`,
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '4px 2px',
                }}>
                    {/* Trimester badge */}
                    <div style={{
                        flexShrink: 0,
                        width: '66px', height: '66px', borderRadius: '50%',
                        background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 46%), ${tri.accent}`,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 8px 24px ${tri.accent}66, inset 0 -6px 14px rgba(0,0,0,0.18)`,
                    }}>
                        <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>טרימסטר</span>
                        <span style={{ fontFamily: DISPLAY_FONT, fontSize: '30px', fontWeight: 700, color: 'white', lineHeight: 1 }}>{tri.trimester}</span>
                    </div>

                    {/* חודש | שבוע table */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
                            color: tri.accent, padding: '0 8px 6px',
                        }}>
                            <span>חודש</span>
                            <span>שבוע</span>
                        </div>
                        {tri.months.map((m, idx) => {
                            const isCurrent = currentWeek >= m.from && currentWeek <= m.to;
                            return (
                                <div key={m.month} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '6px 8px', borderRadius: '9px',
                                    borderTop: idx === 0 || isCurrent ? '1px solid transparent' : '1px dotted rgba(255,255,255,0.1)',
                                    background: isCurrent ? `${tri.accent}26` : 'transparent',
                                    boxShadow: isCurrent ? `inset 0 0 0 1px ${tri.accent}66, 0 0 16px ${tri.accent}33` : 'none',
                                }}>
                                    <span style={{
                                        fontSize: '14px', fontFamily: DISPLAY_FONT,
                                        fontWeight: isCurrent ? 700 : 500,
                                        color: isCurrent ? 'white' : '#cbd5e1',
                                    }}>{m.month}</span>
                                    <span style={{
                                        fontSize: '13px', fontFamily: DISPLAY_FONT,
                                        fontWeight: isCurrent ? 700 : 400,
                                        color: isCurrent ? 'white' : '#8896aa',
                                    }}>{m.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    </ModalShell>
);

// ── Flat progress ring — shown only if the device can't render the 3D orb ──────
const FlatRing = ({ progress }) => {
    // SVG ring: r=38, circumference = 2π×38 ≈ 238.76
    const CIRC = 238.76;
    const dashOffset = CIRC - (CIRC * progress / 100);
    return (
        <svg
            viewBox="0 0 88 88"
            style={{ position: 'absolute', top: '13%', left: '13%', width: '74%', height: '74%', transform: 'rotate(-90deg)' }}
        >
            <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle
                cx="44" cy="44" r="38"
                fill="none"
                stroke="url(#ablFallbackGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                style={{ filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.5))', transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <defs>
                <linearGradient id="ablFallbackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
            </defs>
        </svg>
    );
};

// ── One half of the month / trimester strip: label, big number, progress ticks ─
const StatSegment = ({ label, value, total, color, tickWidth }) => (
    <div className="abl-stat">
        <span className="abl-stat-label">{label}</span>
        <span className="abl-stat-value" style={{ textShadow: `0 0 18px ${color}55` }}>{value}</span>
        <span className="abl-stat-ticks" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
                <span
                    key={i}
                    className="abl-stat-tick"
                    style={{
                        width: tickWidth,
                        background: i < value ? color : undefined,
                        boxShadow: i < value ? `0 0 6px ${color}` : undefined,
                    }}
                />
            ))}
        </span>
    </div>
);

// ── Glass expandable card ──────────────────────────────────────────────────────
const GlassExpandableCard = ({
    title,
    icon: Icon,
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
    const collapsedMask = isExpanded ? 'none' : 'linear-gradient(180deg, #000 42%, transparent 100%)';

    return (
        <div className="abl-lift" style={{
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(160deg, ${containerBg}, rgba(255,255,255,0.012) 70%), rgba(16,24,34,0.6)`,
            border: `1px solid ${containerBorder}`,
            borderRadius: '22px',
            boxShadow: '0 14px 40px -16px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
            padding: '16px 18px 14px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
        }}>
            {/* Corner glow */}
            <span aria-hidden="true" className="abl-breathe" style={{
                position: 'absolute', top: '-70px', right: '-50px',
                width: '190px', height: '190px', borderRadius: '50%',
                background: `radial-gradient(circle, ${dotColor}30, transparent 68%)`,
                pointerEvents: 'none',
            }} />
            {/* Accent rail */}
            <span aria-hidden="true" style={{
                position: 'absolute', right: 0, top: '18px', bottom: '18px', width: '3px',
                borderRadius: '3px 0 0 3px',
                background: `linear-gradient(180deg, ${rightBorderColor}, transparent)`,
                boxShadow: `0 0 12px ${rightBorderColor}`,
            }} />

            {/* Header */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '11px' }}>
                <span style={{
                    width: '34px', height: '34px', borderRadius: '11px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(160deg, ${dotColor}33, ${dotColor}0d)`,
                    border: `1px solid ${dotColor}4d`,
                    boxShadow: `0 0 18px -6px ${dotColor}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                }}>
                    <Icon size={17} color={dotColor} strokeWidth={2.3} />
                </span>
                <span style={{ fontSize: '1.12rem', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>{title}</span>
            </div>

            {/* Text — collapses to ~3 lines (fading out), expands to full */}
            <div style={{
                position: 'relative',
                maxHeight: isExpanded ? '600px' : '3.9em',
                overflow: 'hidden',
                transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                WebkitMaskImage: collapsedMask,
                maskImage: collapsedMask,
            }}>
                <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>
                    {typeof text === 'string'
                        ? text.split('\n').map((line, i, arr) => (
                            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                        ))
                        : text}
                </p>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {tags.map((tag, idx) => (
                            <span key={idx} style={{
                                fontSize: '10.5px',
                                padding: '3px 9px',
                                borderRadius: '999px',
                                fontWeight: 600,
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

            {/* Read more */}
            <button
                onClick={() => setIsExpanded(prev => !prev)}
                style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${containerBorder}`,
                    color: tagColor,
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '6px 12px',
                    marginTop: '10px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'inherit',
                }}
            >
                {isExpanded ? 'פחות' : 'המשך קריאה'}
                <ChevronDown
                    size={12}
                    color={tagColor}
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.35s' }}
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
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [pendingDayIndex, setPendingDayIndex] = useState(null);
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    useEffect(() => {
        const regDateStr = localStorage.getItem('abale_registration_date');
        if (regDateStr) {
            const switchDayIndex = new Date(regDateStr).getDay();
            setSwitchDay(days[switchDayIndex]);

            // Days until the next occurrence of the switch weekday (0 = today).
            // Computed purely from weekdays so it's always in range 0-6.
            const todayIndex = new Date().getDay();
            setDaysUntilSwitch((switchDayIndex - todayIndex + 7) % 7);
        }
    }, []);

    // Changes only the switch DAY — the current week number must stay the same.
    // We shift the anchor registration date, then back-out the initial week so
    // that (initial_week + weeksPassed) still equals the week shown right now.
    const handleSwitchDayChange = (newDayIndex) => {
        const regDateStr = localStorage.getItem('abale_registration_date');
        if (!regDateStr) return;

        const weekToPreserve = currentWeek;

        const newRegDate = new Date(regDateStr);
        const diff = newDayIndex - newRegDate.getDay();
        newRegDate.setDate(newRegDate.getDate() + diff);
        localStorage.setItem('abale_registration_date', newRegDate.toISOString());

        // Recompute weeks passed against the new anchor and compensate initial_week.
        const diffDays = Math.floor(Math.max(0, new Date() - newRegDate) / (1000 * 60 * 60 * 24));
        const weeksPassed = Math.floor(diffDays / 7);
        const newInitialWeek = Math.max(1, weekToPreserve - weeksPassed);
        localStorage.setItem('abale_initial_week', newInitialWeek);

        setSwitchDay(days[newDayIndex]);

        const todayIndex = new Date().getDay();
        setDaysUntilSwitch((newDayIndex - todayIndex + 7) % 7);

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
    // Month is driven by the content table (Google Sheets). Fall back to the
    // formula only when the table has no month for this week (e.g. local JSON).
    const month = currentWeekData?.month ?? getPregnancyMonth(currentWeek);
    // Trimester is driven by the content table; formula is fallback only (e.g. local JSON).
    const trimester = currentWeekData?.trimester ?? Math.min(3, Math.ceil(currentWeek / 13));

    return (
        <div style={{ position: 'relative', padding: '20px', maxWidth: '100%', overflow: 'hidden' }}>
            <AuroraBackground />

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ── Greeting ─────────────────────────────────────────── */}
                <div className="abl-rise" style={{
                    '--d': '0ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                    margin: '2px 0 6px 0',
                }}>
                    <p style={{
                        margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white',
                        letterSpacing: '-0.01em', textShadow: '0 2px 24px rgba(0,229,255,0.18)',
                    }}>{getGreeting()}</p>
                </div>

                {/* ── Hero: 3D life orb with the week readout ──────────── */}
                <div className="abl-rise" style={{
                    '--d': '90ms',
                    position: 'relative',
                    width: '100%', maxWidth: '330px', aspectRatio: '1 / 1',
                    margin: '0 auto 10px',
                }}>
                    <LifeOrb week={currentWeek} fallback={<FlatRing progress={progress} />} />

                    {/* Center readout */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none', textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                            color: 'rgba(125,211,252,0.9)', marginBottom: '2px',
                            textShadow: '0 0 12px rgba(0,229,255,0.5)',
                        }}>שבוע</div>
                        <div key={currentWeek} className="abl-pop" style={{
                            fontFamily: DISPLAY_FONT,
                            fontSize: '78px', fontWeight: 700, lineHeight: 1,
                            fontVariantNumeric: 'tabular-nums',
                            background: 'linear-gradient(180deg, #ffffff 35%, #8be9ff 100%)',
                            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                            filter: 'drop-shadow(0 0 16px rgba(0,229,255,0.35))',
                        }}>{currentWeek}</div>
                        <div style={{
                            fontFamily: DISPLAY_FONT,
                            fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.2em',
                            color: '#7dd3fc', marginTop: '8px',
                            padding: '3px 10px', borderRadius: '999px',
                            background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)',
                        }}>{progress}% DONE</div>
                    </div>

                    {/* Month / trimester strip — tap to open the pregnancy calendar */}
                    <div style={{
                        position: 'absolute', left: 0, right: 0, bottom: '2px', zIndex: 3,
                        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
                    }}>
                        <button
                            className="abl-statbar"
                            onClick={() => setIsCalendarOpen(true)}
                            title="לוח שבועות וחודשים"
                            aria-label="לוח שבועות וחודשים"
                            style={{ background: 'linear-gradient(160deg, rgba(30,44,62,0.72), rgba(12,18,28,0.72))' }}
                        >
                            <StatSegment label="חודש" value={month} total={9} color="#00e5ff" tickWidth="6px" />
                            <span className="abl-statbar-divider" aria-hidden="true" />
                            <StatSegment
                                label="טרימסטר"
                                value={trimester}
                                total={3}
                                color={PREGNANCY_CALENDAR.find(t => t.trimester === trimester)?.accent || '#ccff00'}
                                tickWidth="18px"
                            />
                        </button>
                    </div>
                </div>

                {/* ── Baby size card ───────────────────────────────────── */}
                <div className="abl-rise" style={{ '--d': '200ms', marginBottom: '14px' }}>
                    <section className="abl-size-card">
                        {/* Image — floats gently in 3D above a glowing "floor" */}
                        <div className="abl-size-media">
                            <div key={currentWeek} className="abl-pop">
                                <div className="abl-size-tile">
                                    <BabySizeIcon week={currentWeek} emoji={getBabySizeEmoji(currentWeek)} />
                                </div>
                            </div>
                            <span className="abl-size-shadow" aria-hidden="true" />
                        </div>

                        <div style={{ position: 'relative', zIndex: 1, minWidth: 0, flex: 1, paddingBottom: '6px' }}>
                            <div className="abl-size-kicker">
                                <Ruler size={13} strokeWidth={2.4} />
                                גודל משוער
                            </div>
                            <div key={currentWeek} className="abl-size-name abl-rise">{babySize.object}</div>
                            {babySize.weight && babySize.weight !== 'לא ידוע' && (
                                <div className="abl-size-weight">
                                    <Weight size={14} color="#67e8f9" strokeWidth={2.2} />
                                    {/* "כ-" קבוע; שאר הערך (כולל היחידה) נמשך מהטבלה — עמודה weight.
                                        מסירים "כ-" מוביל אם הוקלד בטבלה, כדי שלא ייווצר כפול. */}
                                    <span>כ-{babySize.weight.trim().replace(/^כ[-\s]*/, '')}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* ── Cards ────────────────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Partner status */}
                    <div className="abl-rise" style={{ '--d': '290ms' }}>
                        <GlassExpandableCard
                            title="מה קורה עם בת הזוג?"
                            icon={Heart}
                            dotColor="#f472b6"
                            rightBorderColor="rgba(244,114,182,0.65)"
                            containerBg="rgba(244,114,182,0.07)"
                            containerBorder="rgba(244,114,182,0.16)"
                            text={partnerStatus.text}
                            tags={partnerStatus.tags || []}
                            tagColor="#f9a8d4"
                            tagBg="rgba(244,114,182,0.1)"
                            tagBorderColor="rgba(244,114,182,0.2)"
                        />
                    </div>

                    <div className="abl-rise" style={{ '--d': '350ms' }}>
                        <AdSense style={{ margin: '4px 0' }} />
                    </div>

                    {/* Baby status */}
                    <div className="abl-rise" style={{ '--d': '410ms' }}>
                        <GlassExpandableCard
                            title="מה קורה עם התינוק?"
                            icon={Baby}
                            dotColor="#818cf8"
                            rightBorderColor="rgba(129,140,248,0.6)"
                            containerBg="rgba(129,140,248,0.07)"
                            containerBorder="rgba(129,140,248,0.16)"
                            text={babyStatus.text}
                            tags={babyStatus.tags || []}
                            tagColor="#a5b4fc"
                            tagBg="rgba(129,140,248,0.1)"
                            tagBorderColor="rgba(129,140,248,0.2)"
                        />
                    </div>

                    {/* ── Switch day row — clickable ────────────────────── */}
                    <div className="abl-rise" style={{ '--d': '470ms' }}>
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
                            <div className="abl-glass abl-lift" style={{
                                borderRadius: '18px',
                                padding: '10px 12px 10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        width: '30px', height: '30px', borderRadius: '10px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)',
                                    }}>
                                        <Calendar size={15} color="#00e5ff" />
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>
                                        {switchDay ? `מחליפים ביום ${switchDay}` : '...'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {daysUntilSwitch !== null && (
                                        <span style={{
                                            fontSize: '11px',
                                            color: daysUntilSwitch === 0 ? '#34d399' : '#fbbf24',
                                            background: daysUntilSwitch === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                            border: `1px solid ${daysUntilSwitch === 0 ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.24)'}`,
                                            boxShadow: daysUntilSwitch === 0 ? '0 0 14px rgba(16,185,129,0.3)' : 'none',
                                            borderRadius: '999px',
                                            padding: '3px 10px',
                                            fontWeight: 700,
                                        }}>
                                            {daysUntilSwitch === 0 ? 'היום! 🎉' : `עוד ${daysUntilSwitch}י׳ ⚡`}
                                        </span>
                                    )}
                                    <ChevronDown size={13} color="#64748b" />
                                </div>
                            </div>
                        </button>
                    </div>

                </div>

                {/* ── DEV Controls ─────────────────────────────────────── */}
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
            </div>

            {/* ── Week/month calendar modal ────────────────────────────── */}
            {isCalendarOpen && (
                <WeekCalendarModal currentWeek={currentWeek} onClose={() => setIsCalendarOpen(false)} />
            )}

            {/* ── Day picker modal ─────────────────────────────────────── */}
            {isEditModalOpen && (
                <ModalShell onClose={() => setIsEditModalOpen(false)} maxWidth="320px">
                    <p style={{ color: 'white', fontSize: '16px', fontWeight: 800, margin: '0 0 4px', textAlign: 'right' }}>
                        באיזה יום משתנה השבוע?
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 14px', textAlign: 'right' }}>
                        בחר יום ולחץ אישור
                    </p>

                    {/* Day list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        {days.map((day, idx) => (
                            <button
                                key={day}
                                onClick={() => setPendingDayIndex(idx)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '11px 14px',
                                    borderRadius: '13px',
                                    border: pendingDayIndex === idx
                                        ? '1px solid rgba(0,229,255,0.4)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                    background: pendingDayIndex === idx
                                        ? 'linear-gradient(90deg, rgba(0,229,255,0.16), rgba(59,130,246,0.06))'
                                        : 'rgba(255,255,255,0.04)',
                                    boxShadow: pendingDayIndex === idx ? '0 0 18px -4px rgba(0,229,255,0.4)' : 'none',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: pendingDayIndex === idx ? 700 : 400,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    textAlign: 'right',
                                    width: '100%',
                                    transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
                                }}
                            >
                                <span>{day}</span>
                                {pendingDayIndex === idx && (
                                    <svg className="abl-pop" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round">
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
                                borderRadius: '13px',
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
                                borderRadius: '13px',
                                background: 'linear-gradient(90deg, #0ea5e9, #3b82f6)',
                                border: 'none',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                boxShadow: '0 10px 24px -8px rgba(59,130,246,0.7)',
                            }}
                        >
                            אישור ✓
                        </button>
                    </div>
                </ModalShell>
            )}

        </div>
    );
};

export default Home;
