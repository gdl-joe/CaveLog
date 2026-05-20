// App.jsx — Root-Komponente: Auth, Routing, Navigation, Theme
import { useState, useEffect, useCallback } from 'react';
import { getTheme, stageBg } from './theme.js';
import { CL_TRIPS, CL_CAVES } from './data.js'; // Mock-Fallback
import { api } from './api.js';

import LoginScreen    from './screens/LoginScreen.jsx';
import FeedScreen     from './screens/FeedScreen.jsx';
import DetailScreen   from './screens/DetailScreen.jsx';
import EditTripScreen from './screens/EditTripScreen.jsx';
import NewScreen      from './screens/NewScreen.jsx';
import MapScreen      from './screens/MapScreen.jsx';
import CavesScreen    from './screens/CavesScreen.jsx';
import StatsScreen    from './screens/StatsScreen.jsx';
import ProfileScreen  from './screens/ProfileScreen.jsx';
import CLIcon         from './icons.jsx';

// ── Prefs ─────────────────────────────────────────────────
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem('cl_prefs') || '{}'); } catch { return {}; }
}
function savePrefs(p) {
  try { localStorage.setItem('cl_prefs', JSON.stringify(p)); } catch { /* ignore */ }
}
const DEFAULT_PREFS = { theme: 'light', layout: 'cards', diffMode: 'bars' };

// ── App ───────────────────────────────────────────────────
export default function App() {
  // Auth
  const [user,    setUser]    = useState(undefined); // undefined = Laden, null = nicht angemeldet
  const [authErr, setAuthErr] = useState('');

  // Daten
  const [trips,   setTrips]   = useState(null);  // null = noch nicht geladen
  const [caves,   setCaves]   = useState(null);

  // Navigation
  const [screen,  setScreen]  = useState('feed');
  const [navTab,  setNavTab]  = useState('feed');
  const [tripId,  setTripId]  = useState(null);
  const [editing, setEditing] = useState(false); // Edit-Modus im Detail

  // Prefs (theme, layout, diffMode)
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...loadPrefs() }));
  const theme = getTheme(prefs.theme);

  const updatePref = (key, val) => {
    setPrefs(p => { const n = { ...p, [key]: val }; savePrefs(n); return n; });
  };

  // ── Auth prüfen beim Start ────────────────────────────────
  useEffect(() => {
    api.me()
      .then(u => setUser(u))        // null wenn nicht angemeldet (PHP gibt null zurück)
      .catch(() => setUser(null));  // Netzwerkfehler → nicht angemeldet annehmen
  }, []);

  // ── Daten laden sobald eingeloggt ────────────────────────
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = useCallback(async () => {
    // Trips laden (API → Fallback auf Mock)
    try {
      const res = await api.getTrips({ limit: 50 });
      setTrips(normalizeTrips(res.items ?? res));
    } catch {
      setTrips(CL_TRIPS); // Mock-Fallback
    }
    // Caves laden
    try {
      const res = await api.getCaves();
      setCaves(normalizeCaves(res));
    } catch {
      setCaves(CL_CAVES); // Mock-Fallback
    }
  }, []);

  // ── Login / Logout ────────────────────────────────────────
  const handleLogin = async (email, pw) => {
    const res = await api.login(email, pw); // wirft Error bei Fehlschlag
    setUser(res.user);
    setAuthErr('');
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch { /* ignore */ }
    setUser(null);
    setTrips(null);
    setCaves(null);
    setScreen('feed');
  };

  // ── Navigation ────────────────────────────────────────────
  const openTrip = (id) => { setTripId(id); setEditing(false); setScreen('detail'); };
  const openCave = (id) => {
    const trip = (trips || CL_TRIPS).find(x => x.caveId === id);
    if (trip) openTrip(trip.id);
  };
  const back  = () => { setEditing(false); setScreen(navTab); };
  const goTab = (tab) => { setNavTab(tab); setScreen(tab); };

  const currentTrip = (trips || CL_TRIPS).find(x => x.id === tripId) || (trips || CL_TRIPS)[0];

  // ── theme-color + Stage-Background ───────────────────────
  useEffect(() => {
    const m = document.getElementById('meta-theme-color');
    if (m) m.content = theme.bg;
    // Desktop-Bühne folgt dem Theme
    if (window.innerWidth > 500) {
      document.body.style.background = stageBg(prefs.theme);
      document.body.style.color = theme.text;
    }
  }, [theme.bg, prefs.theme, theme.text]);

  // ── Render ────────────────────────────────────────────────

  // Lade-Spinner (Auth-Check)
  if (user === undefined) return <LoadingScreen theme={theme} />;

  // Login
  if (!user) return (
    <AppShell theme={theme}>
      <LoginScreen theme={theme} onLogin={handleLogin} />
    </AppShell>
  );

  // Daten noch nicht da: Spinner zeigen, aber bereits navigierbar
  const activeTrips = trips || CL_TRIPS;
  const activeCaves = caves || CL_CAVES;

  // Map-Karte: immer gerendert, nie unmounted — nur display:none wenn inaktiv
  // Verhindert Leaflet-Neuinitialisierung und Größen-Verzerrung beim Tab-Wechsel
  const mapContent = <MapScreen theme={theme} caves={activeCaves} trips={activeTrips} onOpenCave={openCave} />;

  const renderScreen = () => {
    switch (screen) {
      case 'feed':
        return <FeedScreen trips={activeTrips} caves={activeCaves} theme={theme} prefs={prefs} onOpenTrip={openTrip} loading={!trips} />;
      case 'detail':
        return editing
          ? <EditTripScreen trip={currentTrip} caves={activeCaves} theme={theme} onBack={() => setEditing(false)} onSaved={loadData} />
          : <DetailScreen trip={currentTrip} caves={activeCaves} theme={theme} prefs={prefs} user={user} onBack={back} onEdit={() => setEditing(true)} />;
      case 'new':
        return <NewScreen theme={theme} prefs={prefs} caves={activeCaves} onClose={back} onSaved={loadData} />;
      case 'caves':
        return <CavesScreen theme={theme} caves={activeCaves} trips={activeTrips} onOpenCave={openCave} loading={!caves} />;
      case 'stats':
        return <StatsScreen theme={theme} trips={activeTrips} caves={activeCaves} />;
      case 'profile':
        return (
          <ProfileScreen
            theme={theme} prefs={prefs} user={user}
            trips={activeTrips} caves={activeCaves}
            onChangeTheme={v  => updatePref('theme', v)}
            onChangeLayout={v => updatePref('layout', v)}
            onChangeDiffMode={v => updatePref('diffMode', v)}
            onLogout={handleLogout}
          />
        );
      default: return null;
    }
  };

  return (
    <AppShell theme={theme}>
      <PhoneFrame theme={theme} screen={screen} navTab={navTab} goTab={goTab} setScreen={setScreen}
        mapContent={mapContent}>
        {renderScreen()}
      </PhoneFrame>
    </AppShell>
  );
}

// ── Shell (Desktop-Hintergrund oder Mobile-Vollbild) ──────
function AppShell({ theme, children }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
}

// ── Phone-Frame (Desktop: 412×892 Bezel, Mobile: Vollbild) ─
function PhoneFrame({ theme, screen, navTab, goTab, setScreen, mapContent, children }) {
  const isNarrow = window.matchMedia('(max-width: 500px)').matches;

  const inner = (
    <div className="cl-app" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {isNarrow ? <MobileStatusBar theme={theme} /> : <PhoneStatusBar theme={theme} />}

      {/* Content-Bereich: Map immer im DOM, andere Screens nur wenn aktiv */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Karte — bleibt permanent gemountet, nur sichtbar wenn aktiv */}
        <div style={{
          display: screen === 'map' ? 'flex' : 'none',
          flex: 1, flexDirection: 'column',
        }}>
          {mapContent}
        </div>

        {/* Alle anderen Screens */}
        {screen !== 'map' && (
          <div className="cl-scroll" style={{
            flex: 1, overflow: 'auto',
            background: theme.bg, color: theme.text, position: 'relative',
          }}>
            {children}
          </div>
        )}
      </div>

      {screen !== 'new' && (
        <TabBar screen={navTab} onTab={goTab} onNew={() => setScreen('new')} theme={theme} />
      )}
      <AndroidPill theme={theme} />
    </div>
  );

  if (isNarrow) {
    return <div style={{ width: '100%', height: '100%' }}>{inner}</div>;
  }

  return (
    <div style={{
      width: 412, height: 892, borderRadius: 40, overflow: 'hidden',
      background: theme.bg,
      border: `8px solid ${theme.statusBarDark ? '#0a0b0e' : '#dad9d4'}`,
      boxShadow: theme.statusBarDark
        ? '0 30px 90px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.04)'
        : '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      {inner}
    </div>
  );
}

// ── Status-Bars ───────────────────────────────────────────
function PhoneStatusBar({ theme }) {
  const c = theme.statusBarDark ? theme.text : '#000';
  return (
    <div style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', position: 'relative', background: theme.bg, flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: c, fontFamily: 'Inter' }}>9:42</span>
      <div style={{ position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)', width: 110, height: 22, borderRadius: 12, background: '#000' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="7" width="2.5" height="3" fill={c}/><rect x="4" y="5" width="2.5" height="5" fill={c}/><rect x="8" y="2" width="2.5" height="8" fill={c}/><rect x="12" y="0" width="2.5" height="10" fill={c} opacity="0.4"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"><path d="M 1 4 Q 7 -1 13 4"/><path d="M 3 6 Q 7 3 11 6"/><circle cx="7" cy="8.5" r="0.8" fill={c} stroke="none"/></svg>
        <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke={c} fill="none"/><rect x="19.5" y="3" width="1.5" height="4" fill={c}/><rect x="2" y="2" width="13" height="6" fill={c} rx="1"/></svg>
      </div>
    </div>
  );
}
function MobileStatusBar({ theme }) {
  return <div style={{ height: 'env(safe-area-inset-top, 0px)', background: theme.bg, flexShrink: 0 }} />;
}
function AndroidPill({ theme }) {
  return (
    <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div style={{ width: 108, height: 4, borderRadius: 2, background: theme.text, opacity: 0.4 }} />
    </div>
  );
}

// ── Tab-Bar mit FAB ───────────────────────────────────────
function TabBar({ screen, onTab, onNew, theme }) {
  const tabs = [
    { k: 'feed',    i: 'feed',    l: 'Logbuch' },
    { k: 'map',     i: 'map',     l: 'Karte'   },
    { k: 'caves',   i: 'caves',   l: 'Höhlen'  },
    { k: 'stats',   i: 'stats',   l: 'Stats'   },
    { k: 'profile', i: 'profile', l: 'Profil'  },
  ];
  return (
    <div style={{ flexShrink: 0, background: theme.bgElev, borderTop: `1px solid ${theme.border}`, padding: '4px 0 6px', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
      <button onClick={onNew} className="cl-glow" style={{
        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
        width: 50, height: 50, borderRadius: '50%',
        appearance: 'none', border: `3px solid ${theme.bg}`,
        background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 4,
        boxShadow: `0 8px 24px ${theme.accent}55, 0 0 0 1px ${theme.accent}22`,
      }}>
        <CLIcon name="plus" size={24} color={theme.bg} strokeWidth={2.6} />
      </button>
      {tabs.slice(0,2).map(t => <TabBtn key={t.k} tab={t} active={screen===t.k} onClick={() => onTab(t.k)} theme={theme} />)}
      <div style={{ width: 50, flexShrink: 0 }} />
      {tabs.slice(2).map(t => <TabBtn key={t.k} tab={t} active={screen===t.k} onClick={() => onTab(t.k)} theme={theme} />)}
    </div>
  );
}
function TabBtn({ tab, active, onClick, theme }) {
  return (
    <button onClick={onClick} style={{ flex: 1, appearance: 'none', border: 'none', background: 'transparent', padding: '10px 0 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
      <CLIcon name={tab.i} size={20} color={active ? theme.accent : theme.textMute} strokeWidth={active ? 1.9 : 1.5} />
      <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? theme.accent : theme.textMute, letterSpacing: 0.4 }}>{tab.l}</span>
    </button>
  );
}

// ── Lade-Spinner ──────────────────────────────────────────
function LoadingScreen({ theme }) {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: theme.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <CLIcon name="caves" size={36} color={theme.accent} />
      <div style={{ fontSize: 11, color: theme.textMute, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
        Lädt…
      </div>
    </div>
  );
}

// ── API-Antwort normalisieren → Mock-kompatibles Format ───
function normalizeTrips(items) {
  return items.map(t => ({
    ...t,
    caveId:     t.caveId     ?? t.cave_id,
    heroIcon:   t.heroIcon   ?? t.hero_icon   ?? 'tunnel',
    difficulty: t.difficulty ?? { t: t.diff_t ?? 1, k: t.diff_k ?? 1, p: t.diff_p ?? 1 },
    duration:   t.duration   ?? t.duration_min ?? 0,
    depth:      t.depth      ?? t.depth_m  ?? 0,
    length:     t.length     ?? t.length_m ?? 0,
    start:      t.start      ?? t.start_time ?? '00:00',
    end:        t.end        ?? t.end_time   ?? '00:00',
    photos:     t.photos     ?? t.photo_count ?? 0,
    rating:     t.rating     ?? 0,
    team:       t.team       ?? [],
    gear:       t.gear       ?? [],
    hazards:    t.hazards    ?? [],
  }));
}
function normalizeCaves(items) {
  return items.map(c => ({
    ...c,
    depth:   c.depth   ?? c.depth_m  ?? 0,
    length:  c.length  ?? c.length_m ?? 0,
    entries: c.entries ?? 0,
  }));
}
