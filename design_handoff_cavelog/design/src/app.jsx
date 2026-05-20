// app.jsx — Haupt-App, Navigation, Tweaks, Android-Frame

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "layout": "cards",
  "diffMode": "bars",
  "accent": "#f5a524",
  "showTwoFrames": false
}/*EDITMODE-END*/;

function CaveLogApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const baseTheme = CL_THEMES[t.theme] || CL_THEMES.dark;
  const theme = { ...baseTheme, accent: t.accent || baseTheme.accent };

  const [screen, setScreen] = useState('feed'); // feed|detail|new|map|caves|stats|profile
  const [tripId, setTripId] = useState(null);
  const [navTab, setNavTab] = useState('feed');

  const openTrip = (id) => { setTripId(id); setScreen('detail'); };
  const openCave = (id) => {
    // For prototype: switch to first trip of that cave
    const trip = CL_TRIPS.find(x => x.caveId === id);
    if (trip) openTrip(trip.id);
  };
  const back = () => setScreen(navTab);
  const goTab = (tab) => { setNavTab(tab); setScreen(tab); };

  const currentTrip = CL_TRIPS.find(x => x.id === tripId) || CL_TRIPS[0];

  const renderScreen = () => {
    switch (screen) {
      case 'feed': return <CLFeedScreen trips={CL_TRIPS} theme={theme} tweaks={t} onOpenTrip={openTrip} onNew={() => setScreen('new')}/>;
      case 'detail': return <CLDetailScreen trip={currentTrip} theme={theme} tweaks={t} onBack={back}/>;
      case 'new': return <CLNewScreen theme={theme} tweaks={t} onClose={back}/>;
      case 'map': return <CLMapScreen theme={theme} tweaks={t} onOpenCave={openCave}/>;
      case 'caves': return <CLCavesScreen theme={theme} tweaks={t} onOpenCave={openCave}/>;
      case 'stats': return <CLStatsScreen theme={theme} tweaks={t}/>;
      case 'profile': return <CLProfileScreen theme={theme} tweaks={t}/>;
      default: return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 40, flexWrap: 'wrap',
    }}>
      <Phone theme={theme} screen={screen} navTab={navTab} setScreen={setScreen} goTab={goTab} renderScreen={renderScreen}/>
      {t.showTwoFrames && (
        <SecondaryFrames theme={theme} tweaks={t}/>
      )}

      <TweaksPanel>
        <TweakSection label="Farbschema"/>
        <TweakRadio label="Theme" value={t.theme} options={['dark', 'amber', 'light']}
          onChange={v => setTweak('theme', v)}/>
        <TweakColor label="Akzent" value={t.accent} onChange={v => setTweak('accent', v)}/>

        <TweakSection label="Listen-Layout"/>
        <TweakRadio label="Feed-Layout" value={t.layout} options={['cards', 'compact', 'timeline']}
          onChange={v => setTweak('layout', v)}/>

        <TweakSection label="Schwierigkeit"/>
        <TweakRadio label="Darstellung" value={t.diffMode} options={['bars', 'dots', 'numeric']}
          onChange={v => setTweak('diffMode', v)}/>

        <TweakSection label="Ansicht"/>
        <TweakToggle label="Mehrere Geräte" value={t.showTwoFrames}
          onChange={v => setTweak('showTwoFrames', v)}/>

        <TweakSection label="Navigation"/>
        <TweakButton label="Feed" onClick={() => { setScreen('feed'); setTweak('__noop', Date.now()); }}/>
        <TweakButton label="Detail" onClick={() => setScreen('detail')}/>
        <TweakButton label="Neue Befahrung" onClick={() => setScreen('new')}/>
        <TweakButton label="Karte" onClick={() => setScreen('map')}/>
        <TweakButton label="Höhlen" onClick={() => setScreen('caves')}/>
        <TweakButton label="Dashboard" onClick={() => setScreen('stats')}/>
        <TweakButton label="Profil" onClick={() => setScreen('profile')}/>
      </TweaksPanel>
    </div>
  );
}

// Single phone frame with our own content + tab bar
function Phone({ theme, screen, navTab, setScreen, goTab, renderScreen }) {
  return (
    <div style={{
      width: 412, height: 892,
      borderRadius: 40, overflow: 'hidden',
      background: theme.bg,
      border: `8px solid ${theme.borderHi === 'rgba(90, 60, 20, 0.25)' ? '#2a1a0a33' : '#0a070544'}`,
      boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 60px ${theme.accent}0a`,
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Status bar */}
      <PhoneStatusBar theme={theme}/>

      {/* content */}
      <div className="cl-app cl-scroll" style={{
        flex: 1, overflow: 'auto',
        background: theme.bg,
        color: theme.text,
        position: 'relative',
      }}>
        {renderScreen()}
      </div>

      {/* Bottom tab bar — only when not in detail or new */}
      {screen !== 'new' && (
        <PhoneTabBar screen={navTab} onTab={goTab} onNew={() => setScreen('new')} theme={theme}/>
      )}

      {/* Android pill */}
      <div style={{
        height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: theme.bg,
      }}>
        <div style={{
          width: 108, height: 4, borderRadius: 2,
          background: theme.text, opacity: 0.4,
        }}/>
      </div>
    </div>
  );
}

function SecondaryFrames({ theme, tweaks }) {
  return (
    <>
      <Phone theme={theme} screen="detail" navTab="feed" setScreen={()=>{}} goTab={()=>{}}
        renderScreen={() => <CLDetailScreen trip={CL_TRIPS[0]} theme={theme} tweaks={tweaks} onBack={()=>{}}/>}/>
      <Phone theme={theme} screen="stats" navTab="stats" setScreen={()=>{}} goTab={()=>{}}
        renderScreen={() => <CLStatsScreen theme={theme} tweaks={tweaks}/>}/>
    </>
  );
}

// Statusbar styled to match theme (not the starter)
function PhoneStatusBar({ theme }) {
  const c = theme.statusBarDark ? theme.text : '#000';
  return (
    <div style={{
      height: 38, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 22px',
      position: 'relative', background: theme.bg, flexShrink: 0,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: c, fontFamily: 'Inter' }}>9:42</span>
      <div style={{
        position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
        width: 110, height: 22, borderRadius: 12, background: '#000',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {/* signal */}
        <svg width="16" height="10" viewBox="0 0 16 10">
          <rect x="0" y="7" width="2.5" height="3" fill={c}/>
          <rect x="4" y="5" width="2.5" height="5" fill={c}/>
          <rect x="8" y="2" width="2.5" height="8" fill={c}/>
          <rect x="12" y="0" width="2.5" height="10" fill={c} opacity="0.4"/>
        </svg>
        {/* wifi */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
          <path d="M 1 4 Q 7 -1 13 4"/>
          <path d="M 3 6 Q 7 3 11 6"/>
          <circle cx="7" cy="8.5" r="0.8" fill={c}/>
        </svg>
        {/* battery */}
        <svg width="22" height="10" viewBox="0 0 22 10">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke={c} fill="none"/>
          <rect x="19.5" y="3" width="1.5" height="4" fill={c}/>
          <rect x="2" y="2" width="13" height="6" fill={c} rx="1"/>
        </svg>
      </div>
    </div>
  );
}

// Custom bottom tab bar for CaveLog
function PhoneTabBar({ screen, onTab, onNew, theme }) {
  const tabs = [
    { k: 'feed', i: 'feed', l: 'Logbuch' },
    { k: 'map', i: 'map', l: 'Karte' },
    { k: 'caves', i: 'caves', l: 'Höhlen' },
    { k: 'stats', i: 'stats', l: 'Stats' },
    { k: 'profile', i: 'profile', l: 'Profil' },
  ];
  return (
    <div style={{
      flexShrink: 0,
      background: theme.bgElev,
      borderTop: `1px solid ${theme.border}`,
      padding: '4px 0 6px',
      display: 'flex', alignItems: 'flex-end',
      position: 'relative',
    }}>
      {/* FAB */}
      <button onClick={onNew} style={{
        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
        width: 50, height: 50, borderRadius: '50%',
        appearance: 'none', border: `3px solid ${theme.bg}`,
        background: theme.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 4,
        boxShadow: `0 8px 24px ${theme.accent}55, 0 0 0 1px ${theme.accent}22`,
      }}>
        <CLIcon name="plus" size={24} color={theme.bg} strokeWidth={2.6}/>
      </button>

      {tabs.slice(0, 2).map(t => <TabBtn key={t.k} tab={t} active={screen === t.k} onClick={() => onTab(t.k)} theme={theme}/>)}
      <div style={{ width: 50, flexShrink: 0 }}/>
      {tabs.slice(2).map(t => <TabBtn key={t.k} tab={t} active={screen === t.k} onClick={() => onTab(t.k)} theme={theme}/>)}
    </div>
  );
}

function TabBtn({ tab, active, onClick, theme }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, appearance: 'none', border: 'none', background: 'transparent',
      padding: '10px 0 4px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      fontFamily: 'inherit',
    }}>
      <CLIcon name={tab.i} size={20} color={active ? theme.accent : theme.textMute} strokeWidth={active ? 1.9 : 1.5}/>
      <span style={{
        fontSize: 9, fontWeight: active ? 700 : 500,
        color: active ? theme.accent : theme.textMute,
        letterSpacing: 0.4,
      }}>{tab.l}</span>
    </button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CaveLogApp/>);
