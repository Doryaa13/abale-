import React from 'react';
import { X, Share, PlusSquare, ArrowDownCircle } from 'lucide-react';

const InstallModal = ({ isOpen, onClose, onInstall, isIOS }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '24px',
                padding: '30px',
                width: '100%',
                maxWidth: '340px',
                position: 'relative',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        padding: '5px'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    margin: '0 auto 20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}>
                    <img src="/pwa-192x192.png" alt="App Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'white' }}>התקן את אבאל'ה</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '25px', lineHeight: 1.5 }}>
                    לחוויה הטובה ביותר, הוסף את האפליקציה למסך הבית שלך.
                </p>

                {isIOS ? (
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '15px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#e2e8f0' }}>
                            <span style={{ background: 'var(--bg-core)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>1</span>
                            <span>לחץ על כפתור השיתוף</span>
                            <Share size={20} style={{ color: '#3b82f6' }} />
                        </div>
                        <div style={{ width: '1px', height: '15px', background: 'var(--border-subtle)', marginRight: '11px', marginBottom: '5px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0' }}>
                            <span style={{ background: 'var(--bg-core)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>2</span>
                            <span>בחר <strong>"הוסף למסך הבית"</strong></span>
                            <PlusSquare size={20} />
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onInstall}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'var(--primary)',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <ArrowDownCircle size={20} />
                        התקן כעת
                    </button>
                )}

            </div>
            <style>{`
                @keyframes slideUp { 
                    from { transform: translateY(20px); opacity: 0; } 
                    to { transform: translateY(0); opacity: 1; } 
                }
            `}</style>
        </div>
    );
};

export default InstallModal;
