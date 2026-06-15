import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

/**
 * Wraps gated content. When `locked` is true AND no user is signed in, the
 * children are shown blurred behind a "register free to read" card.
 * Otherwise the children render normally.
 *
 * The "first one free" decision lives in the PARENT — it decides what to pass
 * as `locked`. This component is purely the blur + lock overlay.
 */
const RegistrationGate = ({ locked, title, subtitle, children }) => {
  const { isLoggedIn } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (isLoggedIn || !locked) return children;

  return (
    <div style={{ position: 'relative' }}>
      {/* Blurred, non-interactive content */}
      <div aria-hidden style={{
        filter: 'blur(7px)', pointerEvents: 'none', userSelect: 'none',
        maxHeight: '420px', overflow: 'hidden', opacity: 0.6,
      }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '20px',
        background: 'linear-gradient(180deg, rgba(10,16,28,0.25) 0%, rgba(10,16,28,0.75) 100%)',
      }}>
        <div style={{
          width: '100%', maxWidth: '320px', textAlign: 'center',
          background: 'rgba(20,28,42,0.92)', backdropFilter: 'blur(4px)',
          border: '1px solid rgba(59,130,246,0.35)', borderRadius: '20px',
          padding: '26px 22px', boxShadow: '0 16px 50px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Lock size={26} color="#60a5fa" />
          </div>

          <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px' }}>
            {title || 'תוכן להמשך — בהרשמה חינמית'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 20px' }}>
            {subtitle || 'הירשם בחינם (2 שניות) כדי לפתוח את כל התוכן ולשמור את ההתקדמות שלך.'}
          </p>

          <button onClick={() => setAuthOpen(true)} style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            background: 'var(--primary)', border: 'none', color: 'white',
            fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(59,130,246,0.4)', fontFamily: 'inherit',
          }}>
            הירשם חינם כדי לקרוא
          </button>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} headline="הירשם בחינם כדי לפתוח את כל התוכן" />
    </div>
  );
};

export default RegistrationGate;
