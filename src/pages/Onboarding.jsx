import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, User, Minus, Plus, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { pushToCloud, upsertProfile } from '../services/syncService';
import AuroraBackground from '../components/AuroraBackground';
import { getPregnancyMonth } from '../utils/pregnancyUtils';
import { rgba } from '../utils/accent';

const DISPLAY_FONT = "'Space Grotesk', 'Heebo', sans-serif";
const MIN_WEEK = 3;
const MAX_WEEK = 40;
const SLIDE_MS = 5500;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ── Shared full-screen shell (background lights + centered column) ─────────────
const Shell = ({ children }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg-core)', overflow: 'hidden',
    }}>
        <AuroraBackground />
        <div style={{
            position: 'relative', zIndex: 1, height: '100%',
            maxWidth: '480px', margin: '0 auto',
            display: 'flex', flexDirection: 'column',
            padding: '20px 24px calc(24px + env(safe-area-inset-bottom))',
            boxSizing: 'border-box',
        }}>
            {children}
        </div>
    </div>
);

// Top bar for the name/week steps: back button + step indicator.
const StepHeader = ({ onBack, active }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px' }}>
        <button
            onClick={onBack}
            aria-label="חזרה"
            style={{
                position: 'absolute', right: 0, top: 0,
                width: '44px', height: '44px', padding: 0, borderRadius: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', cursor: 'pointer',
            }}
        >
            <ChevronRight size={22} />
        </button>
        <div className="abl-steps" aria-hidden="true">
            <span data-on={active >= 1} />
            <span data-on={active >= 2} />
        </div>
    </div>
);

const Onboarding = ({ onComplete }) => {
    // 0 = Benefits (Welcome), 1 = Name, 2 = Week
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [week, setWeek] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back (drives the slide-in)
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const goTo = (next) => {
        setDirection(next > step ? 1 : -1);
        setStep(next);
    };

    // Already signed in but no week yet (e.g. an account whose onboarding was
    // never finished): skip the welcome / sign-in screen and go straight to the
    // name step. Checked once, when the session is first known — so signing up
    // from the welcome screen still shows its "check your inbox" step.
    const autoSkipChecked = useRef(false);
    useEffect(() => {
        if (loading || autoSkipChecked.current) return;
        autoSkipChecked.current = true;
        if (user && step === 0) {
            if (user.name) setName((n) => n || user.name);
            goTo(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user]);

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            // Save to local storage
            localStorage.setItem('abale_user_week', week);
            localStorage.setItem('abale_user_name', name.trim());
            localStorage.setItem('abale_onboarding_done', 'true');
            localStorage.setItem('abale_registration_date', new Date().toISOString());
            localStorage.setItem('abale_initial_week', week);

            // Clean up old temp items if any
            localStorage.removeItem('abale_temp_name');
            localStorage.removeItem('abale_temp_week');
            localStorage.removeItem('abale_user');

            // Signed in → save the name to the profile and back up the new week
            // right away (don't wait for the app to be closed). Non-blocking.
            if (user) {
                upsertProfile(user.uid, { email: user.email, name: name.trim() })
                    .then(() => pushToCloud(user.uid))
                    .catch((e) => console.warn('Backup after onboarding failed', e));
            }
        } catch (error) {
            console.error("Error saving onboarding data:", error);
        } finally {
            // Notify App to update state immediately
            onComplete(week);
        }
    };

    const stepAnim = direction > 0 ? 'abl-step-next' : 'abl-step-prev';

    // Screen 0: Benefits Carousel (Why Register?)
    if (step === 0) {
        return (
            <Shell>
                <div key="s0" className={stepAnim} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <BenefitsCarousel
                        onStart={() => goTo(1)} // Go to Name screen
                    />
                </div>
            </Shell>
        );
    }

    // Screen 1: Name Selection
    if (step === 1) {
        const firstName = name.trim().split(' ')[0];
        return (
            <Shell>
                <StepHeader onBack={() => goTo(0)} active={1} />

                <form
                    key="s1"
                    className={stepAnim}
                    onSubmit={(e) => { e.preventDefault(); if (name.trim()) goTo(2); }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
                >
                    <div style={{ marginTop: '44px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em', fontFamily: 'inherit' }}>
                            איך קוראים לך?
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>שנדע איך לפנות אליך</p>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '22px' }}>
                        <div className="abl-input-wrap" style={{ width: '100%', maxWidth: '320px' }}>
                            <span style={{
                                position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)',
                                width: '38px', height: '38px', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#67e8f9', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)',
                            }}>
                                <User size={19} />
                            </span>
                            <input
                                type="text"
                                placeholder="שם ההורה"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ padding: '19px 60px 19px 18px', fontSize: '1.2rem', fontWeight: 600 }}
                                autoFocus
                            />
                        </div>

                        {/* Live greeting preview */}
                        <div style={{ height: '48px', display: 'flex', alignItems: 'center' }}>
                            {firstName && (
                                <div key={firstName.length > 0 ? 'hi' : 'none'} className="abl-pop" style={{
                                    padding: '10px 18px', borderRadius: '18px 18px 4px 18px',
                                    fontSize: '1.15rem', fontWeight: 800, color: 'white',
                                    background: 'linear-gradient(135deg, rgba(34,211,238,0.18), rgba(59,130,246,0.12))',
                                    border: '1px solid rgba(34,211,238,0.3)',
                                    boxShadow: '0 12px 30px -14px rgba(34,211,238,0.7)',
                                }}>
                                    היי, {firstName}! 👋
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="abl-cta" disabled={!name.trim()}>
                        המשך
                    </button>
                </form>
            </Shell>
        );
    }

    // Screen 2: Week Selection
    if (step === 2) {
        const pct = ((week - MIN_WEEK) / (MAX_WEEK - MIN_WEEK)) * 100;
        return (
            <Shell>
                <StepHeader onBack={() => goTo(1)} active={2} />

                <div key="s2" className={stepAnim} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ marginTop: '28px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em', fontFamily: 'inherit' }}>
                            באיזה שבוע אנחנו?
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>שאל אותה בעדינות... שלא תצא מנותק 😅</p>
                    </div>

                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Week readout */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(125,211,252,0.9)' }}>שבוע</div>
                            <div key={week} className="abl-pop" style={{
                                fontFamily: DISPLAY_FONT, fontSize: '104px', fontWeight: 700, lineHeight: 1,
                                fontVariantNumeric: 'tabular-nums',
                                background: 'linear-gradient(180deg, #ffffff 35%, #8be9ff 100%)',
                                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                                filter: 'drop-shadow(0 0 22px rgba(0,229,255,0.35))',
                            }}>{week}</div>
                            <div style={{
                                marginTop: '10px', padding: '4px 14px', borderRadius: '999px',
                                fontSize: '13px', fontWeight: 700, color: '#a5f3fc',
                                background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)',
                            }}>חודש {getPregnancyMonth(week)}</div>
                        </div>

                        {/* Slider with −/+ steppers */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '340px', marginTop: '18px', direction: 'ltr' }}>
                            <button className="abl-step-btn" onClick={() => setWeek(w => Math.max(MIN_WEEK, w - 1))} disabled={week <= MIN_WEEK} aria-label="שבוע קודם">
                                <Minus size={20} />
                            </button>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="range"
                                    className="abl-range"
                                    min={MIN_WEEK}
                                    max={MAX_WEEK}
                                    value={week}
                                    onChange={(e) => setWeek(parseInt(e.target.value))}
                                    style={{ '--p': `${pct}%` }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#64748b', fontSize: '0.8rem', fontFamily: DISPLAY_FONT }}>
                                    <span>{MIN_WEEK}</span>
                                    <span>{MAX_WEEK}</span>
                                </div>
                            </div>
                            <button className="abl-step-btn" onClick={() => setWeek(w => Math.min(MAX_WEEK, w + 1))} disabled={week >= MAX_WEEK} aria-label="שבוע הבא">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Action */}
                    <button className="abl-cta" disabled={isLoading} onClick={handleFinish} style={{ marginTop: '18px' }}>
                        {isLoading ? 'שומר...' : 'המשך'}
                    </button>
                </div>
            </Shell>
        );
    }

    return null;
};

// ── Illustration for a benefit slide: floating emoji in a glass medallion,
//    counter-rotating orbits, twinkling glints and a colored glow. ────────────
const SPARKLES = [
    { top: '8%', left: '22%', delay: '0s' },
    { top: '18%', left: '84%', delay: '0.8s' },
    { top: '72%', left: '8%', delay: '1.5s' },
    { top: '86%', left: '70%', delay: '0.4s' },
    { top: '46%', left: '96%', delay: '1.9s' },
];
const SlideArt = ({ icon, accent }) => (
    <div style={{ position: 'relative', width: '210px', height: '210px', margin: '0 auto 22px' }} aria-hidden="true">
        <span className="abl-breathe" style={{
            position: 'absolute', inset: '6%', borderRadius: '50%',
            background: `radial-gradient(circle, ${rgba(accent, 0.45)}, transparent 66%)`,
        }} />
        <span className="abl-orbit" style={{ inset: 0, color: accent, borderColor: rgba(accent, 0.3) }}>
            <span className="abl-orbit-dot" />
        </span>
        <span className="abl-orbit abl-orbit--rev" style={{ inset: '15%', color: '#ffffff', borderColor: 'rgba(255,255,255,0.14)' }}>
            <span className="abl-orbit-dot" style={{ width: '6px', height: '6px', marginLeft: '-3px', top: '-3px' }} />
        </span>
        <span style={{
            position: 'absolute', inset: '27%', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3.4rem',
            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22), ${rgba(accent, 0.12)} 55%, rgba(10,15,24,0.6))`,
            border: `1px solid ${rgba(accent, 0.45)}`,
            boxShadow: `0 0 40px -6px ${rgba(accent, 0.7)}, inset 0 2px 0 rgba(255,255,255,0.18)`,
        }}>
            <span className="abl-float" style={{ display: 'inline-block', filter: `drop-shadow(0 8px 14px ${rgba(accent, 0.45)})` }}>{icon}</span>
        </span>
        {SPARKLES.map((s, i) => (
            <span key={i} className="abl-sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
        ))}
    </div>
);

const BenefitsCarousel = ({ onStart }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isGuestConfirmOpen, setIsGuestConfirmOpen] = useState(false);
    const touchStartX = React.useRef(0);
    const touchEndX = React.useRef(0);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        // Swipe left (next slide) - threshold 50px
        if (diff > 50 && currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
        // Swipe right (prev slide)
        if (diff < -50 && currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const slides = [
        {
            title: "תהפוך לאבא מושלם",
            desc: "קבל משימות שבועיות מותאמות אישית שיעזרו לך לתמוך בה ולצאת גבר.",
            icon: "👑",
            accent: '#fbbf24',
        },
        {
            title: "תיק לידה מוכן",
            desc: "צ'ק ליסט חכם לחדר לידה שלא ייתן לך לשכוח כלום (גם לא את המטען).",
            icon: "🎒",
            accent: '#a78bfa',
        },
        {
            title: "אעזור לך להבין הכל אבאל'ה",
            desc: "בכל שבוע תקבל מידע רלוונטי ומקצועי, בגובה העיניים.",
            icon: "⏱️",
            accent: '#22d3ee',
        }
    ];

    // Gentle auto-advance (story style). Restarts whenever the slide changes,
    // stops on the last slide and while a dialog is open.
    const autoplay = !prefersReducedMotion() && !isAuthOpen && !isGuestConfirmOpen;
    useEffect(() => {
        if (!autoplay || currentSlide >= slides.length - 1) return;
        const t = setTimeout(() => setCurrentSlide(s => Math.min(s + 1, slides.length - 1)), SLIDE_MS);
        return () => clearTimeout(t);
    }, [currentSlide, autoplay, slides.length]);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Story progress */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {slides.map((_, i) => (
                    <div key={i} className="abl-story" onClick={() => setCurrentSlide(i)}>
                        <span
                            key={i === currentSlide ? `active-${currentSlide}` : 'static'}
                            style={i === currentSlide && autoplay && currentSlide < slides.length - 1
                                ? { animation: `abl-story-fill ${SLIDE_MS}ms linear both` }
                                : { transform: `scaleX(${i <= currentSlide ? 1 : 0})`, transition: 'transform 0.4s ease' }}
                        />
                    </div>
                ))}
            </div>

            {/* Brand */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '22px' }}>
                <img src="/images/logo.png" alt="Abale" style={{ height: '34px', width: 'auto', filter: 'drop-shadow(0 0 18px rgba(34,211,238,0.35))' }} />
            </div>

            {/* Carousel Area */}
            <div
                style={{ flex: 1, minHeight: '430px', position: 'relative', perspective: '1000px' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {slides.map((slide, index) => {
                    const offset = index - currentSlide;
                    const isActive = offset === 0;
                    return (
                        <div key={index} style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '100%',
                            maxWidth: '330px',
                            transform: `translate(-50%, -50%) translateX(${offset * 92}%) rotateY(${offset * -32}deg) scale(${isActive ? 1 : 0.82})`,
                            opacity: isActive ? 1 : 0.35,
                            transition: 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.7s ease',
                            padding: '30px 22px 28px',
                            borderRadius: '30px',
                            textAlign: 'center',
                            background: `radial-gradient(120% 70% at 50% 0%, ${rgba(slide.accent, 0.16)}, transparent 60%), linear-gradient(165deg, rgba(30,44,62,0.92), rgba(12,18,28,0.95))`,
                            border: `1px solid ${isActive ? rgba(slide.accent, 0.4) : 'rgba(255,255,255,0.08)'}`,
                            boxShadow: isActive
                                ? `0 30px 70px -24px rgba(0,0,0,0.9), 0 0 50px -18px ${rgba(slide.accent, 0.6)}, inset 0 1px 0 rgba(255,255,255,0.08)`
                                : 'none',
                            pointerEvents: isActive ? 'auto' : 'none',
                        }}>
                            <SlideArt icon={slide.icon} accent={slide.accent} />

                            <h2 style={{
                                fontSize: '1.85rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2,
                                fontFamily: 'inherit',
                                background: `linear-gradient(180deg, #ffffff 40%, ${slide.accent})`,
                                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                            }}>{slide.title}</h2>
                            <p style={{ fontSize: '1.02rem', color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>{slide.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="abl-rise" style={{ '--d': '250ms', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <button className="abl-cta" onClick={() => setIsAuthOpen(true)}>
                    צור משתמש / התחברות
                </button>
                <button className="abl-ghost-btn" onClick={() => setIsGuestConfirmOpen(true)}>
                    המשך כאורח
                </button>
            </div>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onSuccess={onStart}
                headline="הרשמה חינמית כדי לגבות ולסנכרן את ההתקדמות שלך"
            />

            {isGuestConfirmOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                }}>
                    <div className="abl-backdrop" onClick={() => setIsGuestConfirmOpen(false)} style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(3,7,14,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                    }} />
                    <div className="abl-modal" style={{
                        position: 'relative', width: '100%', maxWidth: '340px', textAlign: 'center',
                        padding: '28px 22px 20px', borderRadius: '28px',
                        background: 'radial-gradient(120% 70% at 50% 0%, rgba(251,191,36,0.12), transparent 60%), linear-gradient(165deg, rgba(30,44,62,0.97), rgba(13,20,30,0.98))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}>
                        <div className="abl-pop" style={{
                            width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fcd34d',
                            background: 'linear-gradient(160deg, rgba(251,191,36,0.22), rgba(251,191,36,0.05))',
                            border: '1px solid rgba(251,191,36,0.35)',
                            boxShadow: '0 0 30px -6px rgba(251,191,36,0.55)',
                        }}>
                            <Smartphone size={28} />
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: '0 0 10px', fontFamily: 'inherit' }}>
                            המשך כאורח
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65, margin: '0 0 22px' }}>
                            בלי הרשמה, ההתקדמות שלך נשמרת רק על המכשיר הזה - היא לא תסונכרן ולא תהיה גיבוי אם תעבור מכשיר או תמחק את האפליקציה. אפשר להירשם בכל שלב מאוחר יותר.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="abl-cta" onClick={onStart} style={{ padding: '15px', fontSize: '1rem' }}>
                                אני מבין, רוצה להמשיך כאורח
                            </button>
                            <button
                                onClick={() => setIsGuestConfirmOpen(false)}
                                style={{
                                    width: '100%', padding: '13px', borderRadius: '14px',
                                    background: 'transparent', border: 'none', color: '#64748b',
                                    fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
                                }}
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Onboarding;
