import React, { useState, useRef } from 'react';
import { Smile, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import jokesData from '../data/jokes_db.json';

const SWIPE_THRESHOLD = 90;

const DadJokes = () => {
    const [jokes] = useState(() => [...jokesData].sort(() => 0.5 - Math.random()));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isFlying, setIsFlying] = useState(false);

    const startXRef = useRef(null);

    const currentJoke = jokes[currentIndex];
    const rotation = dragX * 0.07;
    const likeOpacity = Math.min(1, Math.max(0, dragX / 70));
    const nopeOpacity = Math.min(1, Math.max(0, -dragX / 70));

    const flyOut = (dir) => {
        if (isFlying) return;
        setIsFlying(true);
        setDragX(dir === 'right' ? 600 : -600);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % jokes.length);
            setDragX(0);
            setIsFlying(false);
        }, 380);
    };

    const onDragStart = (clientX) => {
        if (isFlying) return;
        startXRef.current = clientX;
        setIsDragging(true);
    };

    const onDragMove = (clientX) => {
        if (!isDragging || startXRef.current === null) return;
        setDragX(clientX - startXRef.current);
    };

    const onDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (Math.abs(dragX) > SWIPE_THRESHOLD) {
            flyOut(dragX > 0 ? 'right' : 'left');
        } else {
            setDragX(0);
        }
        startXRef.current = null;
    };

    const cardBorderColor = dragX > 20
        ? 'rgba(74,222,128,0.6)'
        : dragX < -20
        ? 'rgba(248,113,133,0.5)'
        : 'rgba(255,255,255,0.1)';

    const cardGlow = dragX > 20
        ? '0 10px 40px rgba(74,222,128,0.2)'
        : dragX < -20
        ? '0 10px 40px rgba(248,113,133,0.2)'
        : '0 10px 30px rgba(0,0,0,0.5)';

    return (
        <div style={{
            padding: '20px 16px',
            maxWidth: '100%',
            margin: '0 auto',
            color: '#fff',
            textAlign: 'center',
            minHeight: '100dvh',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={24} />
                </Link>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'center' }}>
                    <Smile color="var(--primary)" size={28} />
                    בדיחות אבא
                </h2>
            </div>

            {/* Card stack */}
            <div style={{ position: 'relative', height: 'calc(100vw - 32px)', maxHeight: '420px' }}>
                {/* Background card (next joke peek) */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(20, 30, 48, 0.5)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transform: 'scale(0.94) translateY(8px)',
                }} />

                {/* Main swipeable card */}
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(18, 28, 45, 0.92)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '28px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${cardBorderColor}`,
                        boxShadow: cardGlow,
                        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
                        transition: isDragging || isFlying ? (isFlying ? 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.38s' : 'none') : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        opacity: isFlying ? 0 : 1,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        touchAction: 'none',
                        willChange: 'transform',
                    }}
                    onMouseDown={e => onDragStart(e.clientX)}
                    onMouseMove={e => onDragMove(e.clientX)}
                    onMouseUp={onDragEnd}
                    onMouseLeave={onDragEnd}
                    onTouchStart={e => onDragStart(e.touches[0].clientX)}
                    onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX); }}
                    onTouchEnd={onDragEnd}
                >
                    {/* LIKE badge */}
                    <div style={{
                        position: 'absolute', top: '22px', right: '18px',
                        background: 'rgba(74,222,128,0.12)',
                        border: '2.5px solid #4ade80',
                        borderRadius: '10px', padding: '5px 12px',
                        color: '#4ade80', fontWeight: 800, fontSize: '1rem',
                        opacity: likeOpacity,
                        transform: 'rotate(-12deg)',
                        pointerEvents: 'none',
                    }}>
                        😂 אהבתי!
                    </div>

                    {/* NOPE badge */}
                    <div style={{
                        position: 'absolute', top: '22px', left: '18px',
                        background: 'rgba(248,113,133,0.12)',
                        border: '2.5px solid #f87171',
                        borderRadius: '10px', padding: '5px 12px',
                        color: '#f87171', fontWeight: 800, fontSize: '1rem',
                        opacity: nopeOpacity,
                        transform: 'rotate(12deg)',
                        pointerEvents: 'none',
                    }}>
                        😐 לא מצחיק
                    </div>

                    {/* Joke text */}
                    <div style={{
                        fontSize: '1.35rem',
                        lineHeight: 1.65,
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '16px',
                    }}>
                        "{currentJoke}"
                    </div>

                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 'auto' }}>
                        בדיחה {currentIndex + 1} מתוך {jokes.length}
                    </div>
                </div>
            </div>

            {/* Hint text */}
            <div style={{
                marginTop: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                fontSize: '0.85rem',
            }}>
                <span style={{ color: '#f87171' }}>👈 לא מצחיק</span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ color: '#4ade80' }}>אהבתי 👉</span>
            </div>

        </div>
    );
};

export default DadJokes;
