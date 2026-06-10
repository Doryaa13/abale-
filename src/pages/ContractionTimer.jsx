import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Square, RefreshCcw, Clock, AlertCircle, ArrowRight, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'אשר', confirmColor = '#ef4444' }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
            <div style={{
                position: 'relative', zIndex: 1000, background: '#1a2632',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
                padding: '28px 24px', maxWidth: '300px', width: '100%', textAlign: 'center'
            }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{title}</p>
                {message && <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '24px' }}>{message}</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontSize: '0.95rem' }}>ביטול</button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: confirmColor, border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold' }}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

const ContractionTimer = () => {
    // Load persisted state or defaults
    const [isActive, setIsActive] = useState(() => {
        return localStorage.getItem('abale_timer_active') === 'true';
    });
    const [startTime, setStartTime] = useState(() => {
        const saved = localStorage.getItem('abale_timer_start');
        return saved ? parseInt(saved) : null;
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('abale_contraction_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [elapsed, setElapsed] = useState(0);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Persist active state changes
    useEffect(() => {
        localStorage.setItem('abale_timer_active', isActive);
        if (startTime) {
            localStorage.setItem('abale_timer_start', startTime);
        } else {
            localStorage.removeItem('abale_timer_start');
        }
    }, [isActive, startTime]);

    useEffect(() => {
        let interval = null;
        if (isActive && startTime) {
            // Update immediately to avoid 100ms lag on load
            setElapsed(Date.now() - startTime);
            interval = setInterval(() => {
                setElapsed(Date.now() - startTime);
            }, 100);
        } else if (!isActive && elapsed !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, startTime]);

    useEffect(() => {
        localStorage.setItem('abale_contraction_history', JSON.stringify(history));
    }, [history]);

    const toggleTimer = () => {
        if (!isActive) {
            const now = Date.now();
            setStartTime(now);
            setIsActive(true);
        } else {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const newRecord = {
                start: startTime,
                end: endTime,
                duration: duration
            };
            setHistory([newRecord, ...history]);
            setIsActive(false);
            setStartTime(null);
            setElapsed(0);
        }
    };

    const resetHistory = () => {
        setShowResetConfirm(true);
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const calculateFrequency = (index) => {
        if (index >= history.length - 1) return '-';
        const currentStart = history[index].start;
        const prevStart = history[index + 1].start;
        const diff = currentStart - prevStart;
        const minutes = Math.floor(diff / 60000);
        return `${minutes} דק'`;
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={24} />
                </Link>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Clock color="var(--primary)" />
                    תזמון צירים
                </h2>
            </div>

            <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                <div style={{ fontSize: '4rem', fontFamily: 'monospace', marginBottom: '30px', fontWeight: 'bold', color: isActive ? 'var(--primary)' : '#fff' }}>
                    {formatTime(elapsed)}
                </div>

                <button
                    onClick={toggleTimer}
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isActive ? '#ef4444' : 'var(--primary)', // Red for stop, Primary for start
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        cursor: 'pointer',
                        boxShadow: `0 0 20px ${isActive ? 'rgba(239, 68, 68, 0.4)' : 'rgba(14, 165, 233, 0.4)'}`,
                        transition: 'all 0.3s ease'
                    }}
                >
                    {isActive ? <Square size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </button>
                <div style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {isActive ? 'לחץ לעצירה' : 'לחץ להתחלת מדידה'}
                </div>
            </div>

            {history.length > 0 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>היסטוריה</h3>
                        <button onClick={resetHistory} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <RefreshCcw size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {history.map((item, index) => (
                            <div key={item.start} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                borderRight: '4px solid var(--primary)'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatTime(item.duration)}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(item.start).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>הפרש</div>
                                    <div style={{ fontWeight: 'bold' }}>{calculateFrequency(index)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {history.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                    <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
                    <p>אין נתונים עדיין.<br />כשיתחילו הצירים, אנחנו כאן.</p>
                </div>
            )}

            <ConfirmModal
                isOpen={showResetConfirm}
                title="למחוק היסטוריית צירים?"
                message="כל הנתונים יימחקו לצמיתות"
                onConfirm={() => { setHistory([]); setShowResetConfirm(false); }}
                onCancel={() => setShowResetConfirm(false)}
                confirmLabel="מחק הכל"
            />
        </div>
    );
};

export default ContractionTimer;
