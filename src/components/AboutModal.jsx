import React from 'react';
import { X } from 'lucide-react';
import dorAvatar from '../assets/dor.png';

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200, // Higher than header
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)'
                }}
            />

            {/* Modal Content */}
            <div className="card" style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '30px 24px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                textAlign: 'center',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px', // Hebrew layout
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'var(--text-muted)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <X size={18} />
                </button>

                <div style={{
                    width: '100px',
                    height: '100px',
                    margin: '0 auto 20px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid var(--primary)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                }}>
                    <img src={dorAvatar} alt="Dor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'white' }}>נעים מאוד, אני דור</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '24px', fontWeight: 500 }}>יוצר אבאל'ה</p>

                <div style={{ textAlign: 'right', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p>
                        היי אבאל'ה שבדרך (34). כשנכנסנו להיריון הראשון, מצאתי את עצמי בסיטואציה מוזרה: הרגשתי שאני דמות משנית בסיפור של עצמי.
                        רציתי להיות הגבר הכי תומך ומבין שיש, אבל בפועל? לא באמת ידעתי מה עובר על אשתי. הייתי תלוי באפליקציות 'נשיות' שלא דיברו אליי, או בשאלות בלתי פוסקות שהפנו אותי שוב ושוב אליה.
                    </p>
                    <p>
                        הרגשתי שחסר כאן קול – הקול שלנו, הגברים. פיתחתי את 'אבאל'ה' כדי שאתה לא תצטרך לנחש. כדי שתקבל את המידע שרלוונטי אליך, בגובה העיניים ובזמן אמת.
                        נכון, להן זה הרבה יותר קשה פיזית (והלידה... ובכן, זה סיפור אחר), אבל גם החיים שלך הולכים להשתנות מקצה לקצה.
                    </p>
                    <p style={{ fontWeight: 'bold', color: 'white' }}>
                        אני מאחל לכם מסע זוגי מרגש ומחבר. אני פה כדי לעזור לך להיות האבא והפרטנר שתמיד רצית להיות. בהצלחה!
                    </p>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '30px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        width: '100%'
                    }}
                >
                    יאללה, תודה אחי
                </button>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default AboutModal;
