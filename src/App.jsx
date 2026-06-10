import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Shield, CheckCircle, Monitor, Settings, Menu, X, LogOut, Clock, ShoppingBag, Smile, User, Download, Shield as ShieldIcon, Sparkles, Bookmark, Camera } from 'lucide-react';

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
import { fetchGuidesData } from './services/sheetsService';
import localGuidesData from './data/guides_db.json';


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
        padding: '15px 20px',
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
        <button onClick={() => { setIsMenuOpen(true); loadSavedArticles(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
          <Menu size={28} />
        </button>
      </header>

      {/* Menu Drawer Overlay */}
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }} />}

      {/* Menu Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '100%', width: '280px',
        background: 'var(--bg-panel)', zIndex: 101,
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>תפריט</h2>
          <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link to="/timer" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'white', display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><Clock size={20} /> <span>תזמון צירים</span></Link>
          <Link to="/bag" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'white', display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><ShoppingBag size={20} /> <span>תיק לחדר לידה</span></Link>
          <Link to="/jokes" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'white', display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><Smile size={20} /> <span>בדיחות אבא</span></Link>
          <Link to="/saved" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'white', display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><Bookmark size={20} /> <span>מאמרים שמורים</span></Link>
          <Link to="/belly" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'white', display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><Camera size={20} /> <span>מעקב בטן</span></Link>

          <div className="h-px bg-gray-700 my-2"></div>



          <button onClick={() => { setIsMenuOpen(false); setIsAboutOpen(true); }} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', gap: '10px', alignItems: 'center', textAlign: 'right', fontSize: '1rem' }}><User size={20} /> <span>על עצמי</span></button>
          <button onClick={() => { setIsMenuOpen(false); handleInstallClick(); }} style={{ background: 'none', border: 'none', color: '#3b82f6', display: 'flex', gap: '10px', alignItems: 'center', textAlign: 'right', fontSize: '1rem' }}><Download size={20} /> <span>התקן אפליקציה</span></button>
          <button onClick={handlePurge} style={{ background: 'none', border: 'none', color: '#ef4444', display: 'flex', gap: '10px', alignItems: 'center', textAlign: 'right', fontSize: '1rem', marginTop: 'auto' }}><LogOut size={20} /> <span>מחק נתונים</span></button>
        </nav>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <InstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} onInstall={handleInstallClick} isIOS={isIOS} />
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


// --- App Content ---
const AppContent = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeWeek, setWelcomeWeek] = useState(null);

  // ... (Existing Week State Logic - Shortened for brevity if not changed, but must include full logic) ...
  const [currentWeek, setCurrentWeek] = useState(() => {
    const savedWeek = localStorage.getItem('abale_user_week');
    const registrationDate = localStorage.getItem('abale_registration_date');
    const initialWeek = localStorage.getItem('abale_initial_week');
    if (registrationDate && initialWeek) {
      const regDate = new Date(registrationDate);
      const now = new Date();

      // Calculate weeks passed aligned to registration day-of-week
      // E.g., if registered on Tuesday week 17, the next Tuesday = week 18
      const diffTime = Math.max(0, now - regDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // We use floor(diffDays / 7) which correctly counts full 7-day cycles
      // This means the week advances every 7 days from the EXACT registration date/time
      // So if you registered on Tuesday at 10am, the week changes next Tuesday at 10am
      const weeksPassed = Math.floor(diffDays / 7);
      let validWeek = parseInt(initialWeek, 10) + weeksPassed;

      if (isNaN(validWeek)) {
        validWeek = savedWeek ? parseInt(savedWeek, 10) : 1;
      }

      if (validWeek > 40) validWeek = 40;
      if (validWeek < 1) validWeek = 1;

      localStorage.setItem('abale_user_week', validWeek);
      return validWeek;
    }
    if (savedWeek) {
      const parsedSaved = parseInt(savedWeek, 10);
      return (parsedSaved >= 1 && parsedSaved <= 40) ? parsedSaved : null;
    }
    return null;
  });

  // Determine if onboarding is needed:
  // - No current week AND no onboarding_done flag = needs onboarding
  // Note: We only set this to true initially if we absolutely know there's no week data locally.
  // The isFetchingWeek spinner handles the waiting period for returning users.
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

        {/* Main App Slider or Onboarding (catch-all, must be LAST) */}
        <Route path="/*" element={
          shouldRenderOnboarding
            ? <Onboarding onComplete={(w) => { setCurrentWeek(w); setIsOnboarding(false); localStorage.setItem('abale_onboarding_done', 'true'); }} />
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
