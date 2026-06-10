import React, { useEffect, useState } from 'react';
import { X, Calendar, PartyPopper } from 'lucide-react';

const WeekWelcomeModal = ({ isOpen, onClose, week }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
        } else {
            setTimeout(() => setVisible(false), 300);
        }
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease'
        }}>
            <div className="card-glass" style={{
                position: 'relative',
                width: '90%',
                maxWidth: '350px',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '30px',
                borderRadius: '24px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 0 50px rgba(59, 130, 246, 0.2)',
                textAlign: 'center',
                transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(59, 130, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px auto',
                        border: '2px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <PartyPopper size={40} color="#3b82f6" />
                    </div>

                    <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: 'white', fontWeight: 800 }}>
                        מזל טוב!
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: '#cbd5e1', margin: '0' }}>
                        הגעתם לשבוע <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.4rem' }}>{week}</span>
                    </p>
                </div>

                <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '25px' }}>
                    עוד שלב בדרך לדבר האמיתי.
                    <br />
                    כנס לראות מה חדש השבוע!
                </p>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '16px',
                        background: 'var(--primary)',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                    }}
                >
                    יאללה בלאגן 🚀
                </button>
            </div>

            {/* Confetti Effect */}
            {isOpen && [...Array(18)].map((_, i) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#00f3ff'];
                const color = colors[i % colors.length];
                const left = `${(i * 5.5 + 3) % 100}%`;
                const delay = `${(i * 0.15) % 1.5}s`;
                const size = `${6 + (i % 4) * 3}px`;
                const duration = `${1.8 + (i % 5) * 0.3}s`;
                return (
                    <div key={i} style={{
                        position: 'fixed',
                        bottom: '-10px',
                        left,
                        width: size,
                        height: size,
                        borderRadius: i % 3 === 0 ? '50%' : '2px',
                        background: color,
                        animation: `float ${duration} ease-in ${delay} forwards`,
                        opacity: 0.9,
                        pointerEvents: 'none',
                        zIndex: 9998
                    }} />
                );
            })}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 0.9; }
                    80% { opacity: 0.7; }
                    100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default WeekWelcomeModal;
