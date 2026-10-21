import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, MailCheck, UserPlus, LogIn } from 'lucide-react';
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

// Input with a leading icon inside the glowing glass field.
const Field = ({ icon: Icon, ...props }) => (
  <div className="abl-input-wrap">
    <Icon size={18} color="#64748b" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '15px', pointerEvents: 'none' }} />
    <input {...props} dir="ltr" style={{ padding: '15px 46px 15px 15px', fontSize: '1rem' }} />
  </div>
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState(0); // re-triggers the shake on each new error
  const [verificationSent, setVerificationSent] = useState(false);

  if (!isOpen) return null;

  const showError = (msg) => { setError(msg); setErrorKey(k => k + 1); };

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
      case 'auth/operation-not-allowed': return 'הרשמה במייל אינה מופעלת כרגע. נסה דרך Google.';
      default: return 'משהו השתבש, נסה שוב.';
    }
  };

  // afterSuccess overrides the default "fire onSuccess + close" behavior — used
  // by email registration to show the "check your inbox" screen instead.
  const run = async (fn, afterSuccess) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      if (afterSuccess) afterSuccess();
      else { onSuccess?.(); onClose?.(); }
    } catch (e) {
      showError(messageFor(e));
    } finally {
      setBusy(false);
    }
  };

  // Proceed into the app after the verification screen.
  const finishAfterRegister = () => { onSuccess?.(); onClose?.(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showError('נא למלא אימייל וסיסמה');
      return;
    }
    if (mode === 'register') {
      if (password.length < 6) {
        showError('הסיסמה צריכה להכיל לפחות 6 תווים');
        return;
      }
      if (password !== confirmPassword) {
        showError('הסיסמאות אינן תואמות');
        return;
      }
      run(() => register(email.trim(), password, consent), () => setVerificationSent(true));
    } else {
      run(() => login(email.trim(), password));
    }
  };

  const ModeIcon = mode === 'register' ? UserPlus : LogIn;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="abl-backdrop" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(3,7,14,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      }} />

      <div className="abl-modal" style={{
        position: 'relative', width: '100%', maxWidth: '370px',
        maxHeight: 'calc(100dvh - 40px)', overflowY: 'auto',
        padding: '28px 22px 22px', borderRadius: '28px',
        background: 'radial-gradient(120% 60% at 50% 0%, rgba(34,211,238,0.14), transparent 60%), linear-gradient(165deg, rgba(30,44,62,0.97), rgba(12,18,28,0.98))',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <button
          onClick={verificationSent ? finishAfterRegister : onClose}
          aria-label="סגירה"
          style={{
            position: 'absolute', top: '16px', left: '16px',
            width: '34px', height: '34px', padding: 0, borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#cbd5e1', cursor: 'pointer',
          }}
        >
          <X size={17} />
        </button>

        {verificationSent ? (
          <div key="verified" className="abl-step-next" style={{ textAlign: 'center', padding: '6px 0' }}>
            <div style={{ position: 'relative', width: '84px', height: '84px', margin: '4px auto 20px' }}>
              <div className="abl-pop" style={{
                width: '84px', height: '84px', borderRadius: '26px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#04281c',
                background: 'linear-gradient(145deg, #6ee7b7, #10b981)',
                boxShadow: '0 0 40px -6px rgba(52,211,153,0.7)',
              }}>
                <MailCheck size={38} />
              </div>
            </div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'white', margin: '0 0 10px', fontFamily: 'inherit' }}>
              נרשמת בהצלחה! 🎉
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 6px' }}>
              שלחנו קישור אימות לכתובת:
            </p>
            <p style={{
              display: 'inline-block', color: '#a5f3fc', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px', direction: 'ltr',
              padding: '6px 14px', borderRadius: '12px',
              background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.22)',
            }}>
              {email.trim()}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 22px' }}>
              מומלץ לאמת את הכתובת (לא חובה כדי להמשיך). לא רואה את המייל? בדוק בתיקיית הספאם.
            </p>
            <button className="abl-cta" onClick={finishAfterRegister}>
              המשך לאפליקציה
            </button>
          </div>
        ) : (
          <div key={mode} className="abl-step-next">
            {/* Mode icon */}
            <div className="abl-pop" style={{
              width: '60px', height: '60px', borderRadius: '20px', margin: '0 auto 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              background: 'linear-gradient(145deg, #22d3ee, #3b82f6)',
              boxShadow: '0 0 32px -6px rgba(34,211,238,0.7), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}>
              <ModeIcon size={27} />
            </div>

            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'white', margin: '0 0 6px', textAlign: 'center', fontFamily: 'inherit' }}>
              {mode === 'register' ? 'הרשמה חינמית' : 'התחברות'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', textAlign: 'center', margin: '0 0 22px', lineHeight: 1.5 }}>
              {headline || 'התחבר כדי לשמור ולסנכרן את ההתקדמות שלך'}
            </p>

            {/* Google */}
            <button onClick={() => run(loginWithGoogle)} disabled={busy} style={{
              width: '100%', padding: '14px', borderRadius: '16px',
              background: 'white', border: 'none', color: '#1f2937',
              fontSize: '1rem', fontWeight: 700, cursor: busy ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              fontFamily: 'inherit',
              boxShadow: '0 12px 28px -12px rgba(255,255,255,0.35)',
            }}>
              <GoogleG /> המשך עם Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14))' }} />
              <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>או</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.14))' }} />
            </div>

            {/* Email / password */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              <Field icon={Mail} type="email" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Field icon={Lock} type="password" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} />

              {mode === 'register' && (
                <div className="abl-rise" style={{ '--d': '80ms' }}>
                  <Field icon={Lock} type="password" placeholder="אימות סיסמה" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              )}

              {/* Marketing consent — opt-in, only on register (Israeli anti-spam law) */}
              {mode === 'register' && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', margin: '3px 2px 2px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#22d3ee', flexShrink: 0 }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.45 }}>
                    אני מאשר/ת לקבל עדכונים וטיפים במייל (אפשר לבטל בכל עת)
                  </span>
                </label>
              )}

              {error && (
                <p key={errorKey} className="abl-shake" style={{
                  color: '#fca5a5', fontSize: '0.86rem', margin: '2px 0 0', textAlign: 'center',
                  padding: '9px 12px', borderRadius: '12px',
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                }}>{error}</p>
              )}

              <button type="submit" className="abl-cta" disabled={busy} style={{
                marginTop: '4px', padding: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                {busy && <Loader2 size={18} className="spin" />}
                {mode === 'register' ? 'הרשמה' : 'התחברות'}
              </button>
            </form>

            {/* Toggle mode */}
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: '18px 0 0' }}>
              {mode === 'register' ? 'כבר יש לך חשבון?' : 'עדיין אין לך חשבון?'}{' '}
              <button onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); setConfirmPassword(''); }} style={{
                background: 'none', border: 'none', color: '#67e8f9', cursor: 'pointer', padding: '2px 4px',
                fontWeight: 800, fontFamily: 'inherit', fontSize: '0.9rem',
              }}>
                {mode === 'register' ? 'התחבר' : 'הירשם'}
              </button>
            </p>

            <style>{`.spin { animation: authspin 0.8s linear infinite; } @keyframes authspin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
