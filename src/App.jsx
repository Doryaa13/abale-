import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Shield, CheckCircle, Monitor, Settings, Menu, X, Clock, ShoppingBag, Smile, User, Download, Shield as ShieldIcon, Sparkles, Bookmark, Camera, ChevronLeft, Trash2 } from 'lucide-react';
import { rgba } from './utils/accent';

// Context & Pages
import Home from './pages/Home';
import OpsLog from './pages/Log';
import Onboarding from './pages/Onboarding';
import ContractionTimer from './pages/ContractionTimer';
import HospitalBag from './pages/HospitalBag';
import DadJokes from './pages/DadJokes';
import AboutModal from './components/AboutModal';
import InstallModal from './components/InstallModal';
import WeekWelcomeModal from './components/WeekWelcomeModal';
import Tests from './pages/Tests';
import ArticlePage from './pages/ArticlePage';
import SavedArticles from './pages/SavedArticles';
import BellyGrowth from './pages/BellyGrowth';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { fetchGuidesData } from './services/sheetsService';
import localGuidesData from './data/guides_db.json';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';


// --- Onboarding Tooltip Overlay ---
const NavOnboardingTooltip = ({ onDismiss }) => {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      paddingBottom: '90px', paddingLeft: '20px', paddingRight: '20px',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.5)',
        borderRadius: '16px',
        padding: '20px',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(59, 130, 246, 0.2)',
        marginBottom: '10px' // Space for the arrow
      }}>
        <div style={{
          position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0, borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent', borderTop: '10px solid rgba(30, 41, 59, 0.95)',
          zIndex: 2, filter: 'drop-shadow(0 2px 2px rgba(59,130,246,0.3))'
        }} />

        <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#3b82f6" fill="#3b82f6" />
          הכל עובד מכאן
        </h3>
        <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
          למטה תמצא את המסכים הראשיים: מידע על השבוע (ראשי), משימות שבועיות שתעזורנה לך להתאפס, וריכוז של כל הבדיקות שצריך לעשות.
        </p>

        <button onClick={onDismiss} style={{
          marginTop: '16px', width: '100%', padding: '12px', borderRadius: '10px',
          background: 'var(--primary)', border: 'none', color: 'white',
          fontWeight: 'bold', cursor: 'pointer'
        }}>
          הבנתי, תודה!
        </button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

// --- Navigation Component ---
const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(21, 31, 41, 0.98)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '74px', // Increased slightly to accommodate fixed spacing
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <NavItem
        icon={Shield}
        label="ראשי"
        isActive={activeTab === 'home'}
        onClick={() => onTabChange('home')}
      />
      <NavItem
        icon={CheckCircle}
        label="משימות"
        isActive={activeTab === 'log'}
        onClick={() => onTabChange('log')}
      />
      <NavItem
        icon={({ size, ...props }) => <span {...props} className="material-symbols-outlined" style={{ fontSize: 26 }}>monitor_heart</span>}
        label="בדיקות"
        isActive={activeTab === 'tests'}
        onClick={() => onTabChange('tests')}
      />
    </nav>
  );
};

const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button onClick={onClick} style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Changed to flex-start with padding to align from top? No, let's use fixed heights.
    height: '100%',
    padding: '4px 0 0 0',
    background: 'transparent',
    border: 'none',
    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
    transition: 'all 0.3s',
    cursor: 'pointer'
  }}>
    <div style={{
      position: 'relative',
      height: '36px', // Fixed height for icon container
      width: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      background: isActive ? 'rgba(25, 127, 230, 0.1)' : 'transparent',
      transition: 'all 0.3s',
      marginBottom: '2px'
    }}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      {isActive && (
        <span style={{
          position: 'absolute',
          bottom: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: 'var(--primary)',
          boxShadow: '0 0 8px var(--primary)'
        }} />
      )}
    </div>
    <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 600 : 400, transform: isActive ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.2s' }}>{label}</span>
  </button>
);

// --- Header Component ---
const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [savedArticles, setSavedArticles] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();

  // Build saved articles list from localStorage + guidesData
  const loadSavedArticles = async () => {
    const saved = JSON.parse(localStorage.getItem('abale_saved_articles') || '{}');
    if (Object.keys(saved).length === 0) {
      setSavedArticles([]);
      return;
    }

    try {
      // First try local
      let allData = localGuidesData;
      // Then try sheets (so we don't miss any)
      const fetched = await fetchGuidesData();
      if (fetched) allData = fetched;

      const results = [];
      const seenTitles = new Set();

      allData.forEach(guide => {
        (guide.articles || []).forEach((article, idx) => {
          const title = article.title;
          // We support the old id/idx saving temporarily so users don't lose old saves, but prefer title
          const isSaved = saved[title] || saved[article.id] || saved[idx];

          if (isSaved && title && !seenTitles.has(title)) {
            results.push({ ...article, month: guide.month, key: title });
            seenTitles.add(title);
          }
        });
      });
      setSavedArticles(results);
    } catch (err) {
      console.error('Failed to load saved articles', err);
    }
  };



  useEffect(() => {
    if (isMenuOpen) loadSavedArticles();
  }, [isMenuOpen]);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);


  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const handlePurge = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      <header style={{
        padding: '10px 16px 10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(17, 25, 33, 0.9)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo.png" alt="Abale Logo" style={{ height: '32px', width: 'auto' }} />
        </div>
        <button
          onClick={() => { setIsMenuOpen(true); loadSavedArticles(); }}
          aria-label="תפריט"
          style={{
            width: '42px', height: '42px', padding: 0, borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'var(--text-main)', cursor: 'pointer',
          }}
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Menu Drawer Overlay — fades + blurs in */}
      <div
        onClick={() => setIsMenuOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(3,7,14,0.6)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Menu Drawer */}
      <aside
        aria-hidden={!isMenuOpen}
        style={{
          position: 'fixed', top: 0, left: 0, height: '100%', width: '304px', maxWidth: '86vw',
          zIndex: 101,
          background: 'radial-gradient(120% 45% at 0% 0%, rgba(34,211,238,0.13), transparent 60%), radial-gradient(100% 40% at 100% 100%, rgba(167,139,250,0.1), transparent 60%), linear-gradient(180deg, rgba(16,24,36,0.98), rgba(9,14,22,0.99))',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          boxShadow: isMenuOpen ? '12px 0 60px rgba(0,0,0,0.7)' : 'none',
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(-105%)',
          transition: 'transform 0.45s cubic-bezier(0.2, 0.9, 0.25, 1), box-shadow 0.45s ease',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 18px 16px' }}>
          <img src="/images/logo.png" alt="Abale" style={{ height: '28px', width: 'auto' }} />
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="סגירה"
            style={{
              width: '38px', height: '38px', padding: 0, borderRadius: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1', cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Re-keyed on open so the items animate in every time */}
        <div key={isMenuOpen ? 'open' : 'closed'} style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '0 16px 20px' }}>

          {/* Account */}
          <div className="abl-drawer-item" style={{ '--d': '60ms' }}>
            {isLoggedIn ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '13px 13px 13px 12px', borderRadius: '20px',
                background: 'linear-gradient(160deg, rgba(59,130,246,0.16), rgba(34,211,238,0.05))',
                border: '1px solid rgba(96,165,250,0.25)',
              }}>
                <span style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(145deg, #22d3ee, #3b82f6)',
                  color: 'white', fontSize: '18px', fontWeight: 800,
                  boxShadow: '0 0 20px -4px rgba(34,211,238,0.6)',
                }}>
                  {(user?.name || user?.email || '?').trim().charAt(0).toUpperCase()}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: '#67e8f9', fontSize: '0.74rem', fontWeight: 700 }}>מחובר</div>
                  <div style={{ color: 'white', fontSize: '0.86rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right' }}>{user?.email}</div>
                </div>
                <button onClick={() => logout()} style={{
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                  color: '#fca5a5', cursor: 'pointer', borderRadius: '12px', padding: '8px 12px',
                  fontSize: '0.82rem', fontWeight: 700, fontFamily: 'inherit', flexShrink: 0,
                }}>התנתק</button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMenuOpen(false); setIsAuthOpen(true); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px 12px 12px', borderRadius: '20px', textAlign: 'right',
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(59,130,246,0.14))',
                  border: '1px solid rgba(34,211,238,0.38)',
                  boxShadow: '0 12px 30px -14px rgba(34,211,238,0.7)',
                  color: 'white', fontSize: '0.96rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                <span style={{
                  width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(145deg, #22d3ee, #3b82f6)',
                  boxShadow: '0 0 18px -4px rgba(34,211,238,0.7)',
                }}>
                  <User size={20} color="white" />
                </span>
                <span style={{ flex: 1 }}>התחבר / גבה התקדמות</span>
                <ChevronLeft size={18} color="#67e8f9" />
              </button>
            )}
          </div>

          {/* Main screens */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { to: '/saved', icon: Bookmark, label: 'מאמרים שמורים', color: '#fbbf24' },
              { to: '/jokes', icon: Smile, label: 'בדיחות אבא', color: '#4ade80' },
              { to: '/belly', icon: Camera, label: 'מעקב בטן', color: '#fb7185' },
              { to: '/bag', icon: ShoppingBag, label: 'תיק לחדר לידה', color: '#a78bfa' },
              { to: '/timer', icon: Clock, label: 'תזמון צירים', color: '#38bdf8' },
            ].map(({ to, icon: Icon, label, color }, i) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className="abl-drawer-item abl-drawer-link"
                style={{ '--d': `${130 + i * 55}ms` }}
              >
                <span style={{
                  width: '40px', height: '40px', borderRadius: '13px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(160deg, ${rgba(color, 0.24)}, ${rgba(color, 0.06)})`,
                  border: `1px solid ${rgba(color, 0.32)}`,
                  boxShadow: `0 0 16px -6px ${rgba(color, 0.65)}`,
                }}>
                  <Icon size={19} color={color} />
                </span>
                <span style={{ flex: 1, fontSize: '0.98rem', fontWeight: 600 }}>{label}</span>
                {to === '/saved' && savedArticles.length > 0 && (
                  <span style={{
                    minWidth: '22px', height: '22px', padding: '0 6px', borderRadius: '999px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800, color: '#1c1300', background: '#fbbf24',
                    boxShadow: '0 0 12px -2px rgba(251,191,36,0.7)',
                  }}>{savedArticles.length}</span>
                )}
                <ChevronLeft size={16} color="#475569" />
              </Link>
            ))}
          </nav>

          {/* Secondary actions — grouped panel */}
          <div className="abl-drawer-item" style={{
            '--d': '430ms',
            borderRadius: '18px', overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <button className="abl-drawer-row" onClick={() => { setIsMenuOpen(false); setIsAboutOpen(true); }} style={{ background: 'transparent', color: '#cbd5e1' }}>
              <User size={18} color="#94a3b8" /> <span style={{ flex: 1 }}>על עצמי</span>
            </button>
            <button className="abl-drawer-row" onClick={() => { setIsMenuOpen(false); handleInstallClick(); }} style={{ background: 'transparent', color: '#93c5fd' }}>
              <Download size={18} color="#60a5fa" /> <span style={{ flex: 1 }}>התקן אפליקציה</span>
            </button>
            <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="abl-drawer-row" style={{ color: '#94a3b8' }}>
              <ShieldIcon size={18} color="#64748b" /> <span style={{ flex: 1 }}>מדיניות פרטיות</span>
            </Link>
          </div>

          {/* Danger zone */}
          <button
            onClick={handlePurge}
            className="abl-drawer-item"
            style={{
              '--d': '490ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '12px', borderRadius: '16px',
              background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            <Trash2 size={16} /> <span>מחק נתונים</span>
          </button>
        </div>
      </aside>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <InstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} onInstall={handleInstallClick} isIOS={isIOS} canPrompt={!!deferredPrompt} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};


// --- Swipeable Layout Component ---
const MainLayout = ({ currentWeek, setCurrentWeek }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showNavTooltip, setShowNavTooltip] = useState(false);

  // Check if we need to show the tooltip (first open after onboarding)
  useEffect(() => {
    // Has completed main onboarding but NOT the nav tooltip yet
    const isOnboarded = localStorage.getItem('abale_onboarding_done');
    const hasSeenNavTooltip = localStorage.getItem('abale_nav_tooltip_seen');
    if (isOnboarded && !hasSeenNavTooltip) {
      // Small delay for better UX after main animation
      const timer = setTimeout(() => setShowNavTooltip(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissNavTooltip = () => {
    localStorage.setItem('abale_nav_tooltip_seen', 'true');
    setShowNavTooltip(false);
  };

  // Sync URL to Tab & Scroll to Top logic
  useEffect(() => {
    const path = location.pathname;
    let newTab = 'home';

    if (path === '/log') newTab = 'log';
    else if (path === '/tests') newTab = 'tests';
    else if (location.state?.targetTab) {
      newTab = location.state.targetTab;
      // Also update the URL so we are actually on /tests
      navigate(`/${newTab}`, { replace: true, state: {} });
    }

    setActiveTab(newTab);

    // If we came with a targetTab state, force scroll to it immediately
    if (location.state?.targetTab) {
      setTimeout(() => scrollToTab(newTab), 50);
    }
  }, [location, navigate]);

  // Ref to track location without triggering effects
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Handle Tab Click (Navigation)
  const handleTabChange = (tab) => {
    // Lock observer immediately
    if (containerRef.current) {
      containerRef.current.isScrollingProgrammatically = true;
    }

    setActiveTab(tab);
    const path = tab === 'home' ? '/' : `/${tab}`;
    navigate(path);

    // Scroll immediately
    scrollToTab(tab);
  };

  // Scroll Logic - Updated to match swipe behavior (X-axis only)
  const scrollToTab = (tab) => {
    // Only attempt scroll after a frame to catch any layout shifts
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const targetEl = document.getElementById(`tab-${tab}`);
      if (!targetEl) return;

      const container = containerRef.current;

      // Disable snap temporarily to prevent fighting with smooth scroll
      container.style.scrollSnapType = 'none';
      container.isScrollingProgrammatically = true;

      // Scroll container to the exact offset to prevent vertical jumps
      container.scrollTo({ left: targetEl.offsetLeft, behavior: 'smooth' });

      // Also reset vertical scroll of the target tab to the top
      targetEl.scrollTo({ top: 0, behavior: 'smooth' });

      // Restore snap and clear flag after scroll animation
      // Increased timeout to ensure scroll is fully complete on mobile
      setTimeout(() => {
        if (container) {
          container.isScrollingProgrammatically = false;
          container.style.scrollSnapType = 'x mandatory';
        }
      }, 850);
    });
  };

  // Use Intersection Observer to detect active slide and update URL silently
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      // Skip if we are scrolling programmatically
      if (containerRef.current && containerRef.current.isScrollingProgrammatically) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const id = entry.target.id;
          const tab = id.replace('tab-', '');

          const currentPath = locationRef.current.pathname; // Use Ref
          const expectedPath = tab === 'home' ? '/' : `/${tab}`;

          // Only update if we are not already there
          if (currentPath !== expectedPath) {
            navigate(expectedPath, { replace: true });
            setActiveTab(tab);
          }
        }
      });
    }, { threshold: 0.6, root: containerRef.current });

    const tabs = ['home', 'log', 'tests'];
    tabs.forEach(t => {
      const el = document.getElementById(`tab-${t}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navigate]); // Removed location.pathname dependency


  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', width: '100%', background: 'var(--bg-core)' }}>
      <Header />

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pt-[62px]"
        style={{ scrollBehavior: 'smooth', height: '100%', minHeight: 0 }}
      >
        {/* Home Tab */}
        <div id="tab-home" className="w-full flex-shrink-0 snap-center snap-always overflow-y-auto" style={{ minWidth: '100%', height: 'calc(100dvh - 62px)' }}>
          <div style={{ paddingBottom: 'calc(74px + env(safe-area-inset-bottom) + 20px)' }}>
            <Home currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
          </div>
        </div>

        {/* Log Tab */}
        <div id="tab-log" className="w-full flex-shrink-0 snap-center snap-always overflow-y-auto" style={{ minWidth: '100%', height: 'calc(100dvh - 62px)' }}>
          <div style={{ paddingBottom: 'calc(74px + env(safe-area-inset-bottom) + 20px)' }}>
            <OpsLog currentWeek={currentWeek} />
          </div>
        </div>

        {/* Tests Tab */}
        <div id="tab-tests" className="w-full flex-shrink-0 snap-center snap-always overflow-y-auto" style={{ minWidth: '100%', height: 'calc(100dvh - 62px)' }}>
          <div style={{ paddingBottom: 'calc(74px + env(safe-area-inset-bottom) + 20px)' }}>
            <Tests currentWeek={currentWeek || 0} />
          </div>
        </div>

      </div>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Nav Tooltip Overlay */}
      {showNavTooltip && <NavOnboardingTooltip onDismiss={dismissNavTooltip} />}
    </div>
  );
};


// Compute the current week from stored registration data.
// Weeks advance every 7 days from the EXACT registration date/time — so if you
// registered Tuesday 10am, the week changes the next Tuesday at 10am.
// Returns a clamped week number, or null when there's no usable data.
const computeCurrentWeek = () => {
  const savedWeek = localStorage.getItem('abale_user_week');
  const registrationDate = localStorage.getItem('abale_registration_date');
  const initialWeek = localStorage.getItem('abale_initial_week');

  if (registrationDate && initialWeek) {
    const diffDays = Math.floor(Math.max(0, new Date() - new Date(registrationDate)) / (1000 * 60 * 60 * 24));
    const weeksPassed = Math.floor(diffDays / 7);
    let validWeek = parseInt(initialWeek, 10) + weeksPassed;

    if (isNaN(validWeek)) {
      validWeek = savedWeek ? parseInt(savedWeek, 10) : 1;
    }
    return Math.min(40, Math.max(1, validWeek));
  }

  if (savedWeek) {
    const parsedSaved = parseInt(savedWeek, 10);
    return (parsedSaved >= 1 && parsedSaved <= 40) ? parsedSaved : null;
  }
  return null;
};

// --- App Content ---
const AppContent = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeWeek, setWelcomeWeek] = useState(null);

  const [currentWeek, setCurrentWeek] = useState(() => {
    const week = computeCurrentWeek();
    if (week) localStorage.setItem('abale_user_week', week);
    return week;
  });

  // Recompute the week when the app is resumed/refocused, so a long-running
  // session (e.g. an installed PWA returning from background) crosses the
  // switch-day boundary without needing a full reload.
  useEffect(() => {
    const syncWeek = () => {
      if (document.visibilityState !== 'visible') return;
      const week = computeCurrentWeek();
      if (week) setCurrentWeek(prev => (prev !== week ? week : prev));
    };
    document.addEventListener('visibilitychange', syncWeek);
    window.addEventListener('focus', syncWeek);
    return () => {
      document.removeEventListener('visibilitychange', syncWeek);
      window.removeEventListener('focus', syncWeek);
    };
  }, []);

  // Determine if onboarding is needed:
  // - No current week AND no onboarding_done flag = needs onboarding
  // We only set this to true initially if we absolutely know there's no week data locally.
  const onboardingDone = localStorage.getItem('abale_onboarding_done');
  const [isOnboarding, setIsOnboarding] = useState(() => {
    return !currentWeek || !onboardingDone;
  });

  // Sync week to localStorage + check for week progression modal
  useEffect(() => {
    if (currentWeek) {
      localStorage.setItem('abale_user_week', currentWeek);

      // Check for week progression
      const lastSeenWeek = localStorage.getItem('abale_last_seen_week');
      if (lastSeenWeek && parseInt(lastSeenWeek) < currentWeek) {
        setWelcomeWeek(currentWeek);
        setShowWelcomeModal(true);
      }
      localStorage.setItem('abale_last_seen_week', currentWeek);
    }
  }, [currentWeek]);

  const shouldRenderOnboarding = isOnboarding;

  return (
    <>
      <Routes>

        {/* Full Screen Overlays */}
        <Route path="/timer" element={<ContractionTimer />} />
        <Route path="/bag" element={<HospitalBag />} />
        <Route path="/saved" element={<SavedArticles />} />
        <Route path="/belly" element={<BellyGrowth currentWeek={currentWeek} />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/jokes" element={<DadJokes />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Main App Slider or Onboarding (catch-all, must be LAST) */}
        <Route path="/*" element={
          shouldRenderOnboarding
            ? <Onboarding onComplete={(w) => { setCurrentWeek(w); setIsOnboarding(false); }} />
            : <MainLayout currentWeek={currentWeek} setCurrentWeek={setCurrentWeek} />
        } />

      </Routes>

      <WeekWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        week={welcomeWeek}
      />
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
