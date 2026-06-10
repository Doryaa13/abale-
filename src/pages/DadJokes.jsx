import React, { useState } from 'react';
import { Smile, RefreshCw, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import jokesData from '../data/jokes_db.json';

const DadJokes = () => {
    // Shuffle jokes on initial load
    const [jokes, setJokes] = useState(() => [...jokesData].sort(() => 0.5 - Math.random()));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(null); // 'left' or 'right' for animation

    const nextJoke = (dir) => {
        setDirection(dir);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % jokes.length);
            setDirection(null);
        }, 300); // Wait for animation
    };

    const currentJoke = jokes[currentIndex];

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={24} />
                </Link>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'center' }}>
                    <Smile color="var(--primary)" size={32} />
                    בדיחות אבא
                </h2>
            </div>

            <div style={{
                position: 'relative',
                height: '300px',
                perspective: '1000px'
            }}>
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'var(--bg-card)',
                    borderRadius: '20px',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    transform: direction === 'left' ? 'translateX(-150%) rotate(-20deg)' :
                        direction === 'right' ? 'translateX(150%) rotate(20deg)' : 'translateX(0) rotate(0)',
                    opacity: direction ? 0 : 1,
                    transition: 'all 0.3s ease-in-out'
                }}>
                    <div style={{ fontSize: '1.5rem', lineHeight: '1.6', fontWeight: 'bold', marginBottom: '20px' }}>
                        "{currentJoke}"
                    </div>

                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 'auto' }}>
                        בדיחה {currentIndex + 1} מתוך {jokes.length}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                <button
                    onClick={() => nextJoke('left')}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '2px solid #ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                >
                    <ThumbsDown size={24} />
                </button>

                <button
                    onClick={() => nextJoke('right')}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '2px solid #10b981',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                >
                    <ThumbsUp size={24} />
                </button>
            </div>
            <div style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
                החלק ימינה אם צחקת, שמאלה אם זה נורא
            </div>
        </div>
    );
};

export default DadJokes;
