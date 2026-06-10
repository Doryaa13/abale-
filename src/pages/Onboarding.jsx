import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Onboarding = ({ onComplete }) => {
    // 0 = Benefits (Welcome), 1 = Name, 2 = Week
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [week, setWeek] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
        } catch (error) {
            console.error("Error saving onboarding data:", error);
        } finally {
            // Notify App to update state immediately
            onComplete(week);
        }
    };

    // Screen 0: Benefits Carousel (Why Register?)
    if (step === 0) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'var(--bg-core)',
                display: 'flex', flexDirection: 'column', padding: '30px',
                overflow: 'hidden', zIndex: 9999
            }}>
                <BenefitsCarousel
                    onStart={() => setStep(1)} // Go to Name screen
                />
            </div>
        );
    }

    // Screen 1: Name Selection
    if (step === 1) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'var(--bg-core)',
                display: 'flex', flexDirection: 'column', padding: '30px',
                overflow: 'hidden', zIndex: 9999
            }}>
                <button
                    onClick={() => setStep(0)}
                    style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', width: '44px', height: '44px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'white', zIndex: 10
                    }}
                >
                    <ChevronRight size={24} />
                </button>

                <div style={{ marginTop: '60px', marginBottom: '40px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>איך קוראים לך?</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>שנדע איך לפנות אליך</p>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="input-group" style={{ width: '100%', maxWidth: '300px', position: 'relative' }}>
                        <User size={20} color="#64748b" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '16px' }} />
                        <input
                            type="text"
                            placeholder="שם ההורה"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%', padding: '16px 50px 16px 16px', borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                                color: 'white', outline: 'none', fontSize: '1.1rem'
                            }}
                            autoFocus
                        />
                    </div>
                </div>

                <button
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    style={{
                        width: '100%', padding: '18px', borderRadius: '20px',
                        background: 'var(--primary)', border: 'none', color: 'white',
                        fontSize: '1.1rem', fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                        cursor: name.trim() ? 'pointer' : 'not-allowed',
                        marginTop: 'auto', opacity: name.trim() ? 1 : 0.5
                    }}
                >
                    המשך
                </button>
            </div>
        );
    }

    // Screen 2: Week Selection
    if (step === 2) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'var(--bg-core)',
                display: 'flex', flexDirection: 'column', padding: '30px',
                overflow: 'hidden', zIndex: 9999
            }}>
                {/* Back Button */}
                <button
                    onClick={() => setStep(1)}
                    style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%', width: '44px', height: '44px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'white', zIndex: 10
                    }}
                >
                    <ChevronRight size={24} />
                </button>

                <div style={{ marginTop: '40px', marginBottom: '60px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>באיזה שבוע אנחנו?</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>שאל אותה בעדינות... שלא תצא מנותק 😅</p>
                </div>

                {/* Scale / Slider */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                    {/* Visual Circle */}
                    <div style={{
                        width: '240px',
                        height: '240px',
                        borderRadius: '50%',
                        border: '4px solid rgba(59,130,246,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '40px',
                        position: 'relative',
                        boxShadow: '0 0 50px rgba(59,130,246,0.1)'
                    }}>
                        <div style={{ fontSize: '1rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '2px' }}>WEEK</div>
                        <div style={{ fontSize: '6rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{week}</div>

                        {/* Progress Ring Simulation */}
                        <svg style={{ position: 'absolute', top: -4, left: -4, width: 240, height: 240, transform: 'rotate(-90deg)' }}>
                            <circle cx="120" cy="120" r="118" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="741" strokeDashoffset={741 - (741 * (week / 40))} strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Slider Input */}
                    <input
                        type="range"
                        min="1"
                        max="40"
                        value={week}
                        onChange={(e) => setWeek(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            accentColor: '#3b82f6',
                            height: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            direction: 'ltr' // Force LTR so 1 is on the left
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', marginTop: '10px', color: '#64748b', fontSize: '0.8rem', direction: 'ltr' }}>
                        <span>1</span>
                        <span>40</span>
                    </div>
                </div>

                {/* Action */}
                <button
                    disabled={isLoading}
                    onClick={handleFinish}
                    style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: '20px',
                        background: 'var(--primary)',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                        cursor: isLoading ? 'wait' : 'pointer',
                        marginTop: 'auto',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? 'שומר...' : 'המשך'}
                </button>
            </div>
        );
    }
    
    return null;
};

const BenefitsCarousel = ({ onStart }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
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
            icon: "👑"
        },
        {
            title: "תיק לידה מוכן",
            desc: "צ'ק ליסט חכם לחדר לידה שלא ייתן לך לשכוח כלום (גם לא את המטען).",
            icon: "🎒"
        },
        {
            title: "אעזור לך להבין הכל אבאל'ה",
            desc: "בכל שבוע תקבל מידע רלוונטי ומקצועי, בגובה העיניים.",
            icon: "⏱️"
        }
    ];

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '40px' }}>

            {/* Carousel Area */}
            <div
                style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {slides.map((slide, index) => (
                    <div key={index} style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translateX(${(index - currentSlide) * 110}%) scale(${currentSlide === index ? 1 : 0.8})`,
                        width: '100%',
                        maxWidth: '320px',
                        // Card Style
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                        padding: '30px 20px',
                        borderRadius: '24px',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        boxShadow: currentSlide === index
                            ? '0 0 30px rgba(59, 130, 246, 0.25), inset 0 0 20px rgba(59, 130, 246, 0.05)'
                            : 'none',
                        opacity: currentSlide === index ? 1 : 0.4,
                        transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}>
                        {/* Icon / Image Placeholder */}
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '20px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
                        }}>
                            {slide.icon}
                        </div>

                        <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', fontWeight: 800, color: 'white' }}>{slide.title}</h2>
                        <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6 }}>{slide.desc}</p>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
                {slides.map((_, i) => (
                    <div
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        style={{
                            width: currentSlide === i ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: currentSlide === i ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                            transition: 'all 0.3s',
                            cursor: 'pointer'
                        }}
                    />
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                <button
                    onClick={onStart}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'var(--primary)',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
                    }}
                >
                    בוא נתחיל
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
