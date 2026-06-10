import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';

const Notification = ({ message, subMessage, onClose, type = 'info' }) => {

    // Auto close after 6 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 6000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            right: '20px',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none' // Click through empty space
        }}>
            <div style={{
                pointerEvents: 'auto',
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(10px)',
                width: '100%',
                maxWidth: '400px',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'slideDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
                <div style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Bell size={20} color="var(--primary)" />
                </div>

                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'white' }}>{message}</h4>
                    {subMessage && <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{subMessage}</p>}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={18} />
                </button>
            </div>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Notification;
