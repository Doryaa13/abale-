import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Inline Google "G" mark (lucide has no brand logo).
const GoogleG = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.6 35.8 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z" />
  </svg>
);

/**
 * Login / registration modal.
 * Talks only to useAuth — the same buttons get wired to Firebase in Phase B
 * with no changes here.
 */
const AuthModal = ({ isOpen, onClose, onSuccess, headline }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Map Firebase's English error codes to friendly Hebrew messages.
  const messageFor = (e) => {
    switch (e?.code) {
      case 'auth/email-already-in-use': return 'האימייל הזה כבר רשום. נסה להתחבר במקום.';
      case 'auth/invalid-email': return 'כתובת אימייל לא תקינה.';
      case 'auth/weak-password': return 'הסיסמה קצרה מדי (לפחות 6 תווים).';
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'אימייל או סיסמה שגויים.';
      case 'auth/user-not-found': return 'לא נמצא חשבון עם האימייל הזה.';
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request': return 'ההתחברות בוטלה.';
      case 'auth/network-request-failed': return 'אין חיבור לאינטרנט. נסה שוב.';
      case 'auth/too-many-requests': return 'יותר מדי ניסיונות. נסה שוב בעוד כמה דקות.';
      default: return 'משהו השתבש, נסה שוב.';
    }
  };

  const run = async (fn) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      onSuccess?.();
      onClose?.();
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('נא למלא אימייל וסיסמה');
      return;
    }
    if (mode === 'register') run(() => register(email.trim(), password, consent));
    else run(() => login(email.trim(), password));
  };

  const inputStyle = {
    width: '100%', padding: '14px 44px 14px 14px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
    color: 'white', outline: 'none', fontSize: '1rem', fontFamily: 'inherit',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: '360px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(59,130,246,0.3)', borderRadius: '24px',
        padding: '28px 22px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '14px', left: '14px', background: 'transparent',
          border: 'none', color: '#64748b', cursor: 'pointer',
        }}><X size={22} /></button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: '4px 0 6px', textAlign: 'center' }}>
          {mode === 'register' ? 'הרשמה חינמית' : 'התחברות'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', textAlign: 'center', margin: '0 0 22px' }}>
          {headline || 'התחבר כדי לשמור ולסנכרן את ההתקדמות שלך'}
        </p>

        {/* Google */}
        <button onClick={() => run(loginWithGoogle)} disabled={busy} style={{
          width: '100%', padding: '13px', borderRadius: '14px',
          background: 'white', border: 'none', color: '#1f2937',
          fontSize: '1rem', fontWeight: 700, cursor: busy ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          fontFamily: 'inherit',
        }}>
          <GoogleG /> המשך עם Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>או</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Email / password */}
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Mail size={18} color="#64748b" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '14px' }} />
            <input type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} dir="ltr" />
          </div>
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Lock size={18} color="#64748b" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '14px' }} />
            <input type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} dir="ltr" />
          </div>

          {/* Marketing consent — opt-in, only on register (Israeli anti-spam law) */}
          {mode === 'register' && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: '3px', accentColor: '#3b82f6', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.4 }}>
                אני מאשר/ת לקבל עדכונים וטיפים במייל (אפשר לבטל בכל עת)
              </span>
            </label>
          )}

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 12px', textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" disabled={busy} style={{
            width: '100%', padding: '15px', borderRadius: '14px',
            background: 'var(--primary)', border: 'none', color: 'white',
            fontSize: '1.05rem', fontWeight: 'bold', cursor: busy ? 'wait' : 'pointer',
            boxShadow: '0 4px 20px rgba(59,130,246,0.4)', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            {busy && <Loader2 size={18} className="spin" />}
            {mode === 'register' ? 'הרשמה' : 'התחברות'}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: '18px 0 0' }}>
          {mode === 'register' ? 'כבר יש לך חשבון?' : 'עדיין אין לך חשבון?'}{' '}
          <button onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }} style={{
            background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer',
            fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9rem',
          }}>
            {mode === 'register' ? 'התחבר' : 'הירשם'}
          </button>
        </p>

        <style>{`.spin { animation: authspin 0.8s linear infinite; } @keyframes authspin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default AuthModal;
