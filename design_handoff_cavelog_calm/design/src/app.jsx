// app.jsx — Haupt-App, ruhige Variante

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "layout": "cards",
  "diffMode": "bars",
  "diffColored": false,
  "showTwoFrames": false
}/*EDITMODE-END*/;

function CaveLogApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = CL_THEMES[t.theme] || CL_THEMES.light;

  const [screen, setScreen] = useState('feed');
  const [tripId, setTripId] = useState(null);
  const [navTab, setNavTab] = useState('feed');

  const openTrip = (id) => { setTripId(id); setScreen('detail'); };
  const openCave = (id) => {
    const trip = CL_TRIPS.find(x => x.caveId === id);
    if (trip) openTrip(trip.id);
  };
  const back = () => setScreen(navTab);
  const goTab = (tab) => { setNavTab(tab); setScreen(tab); };

  const currentTrip = CL_TRIPS.find(x => x.id === tripId) || CL_TRIPS[0];

  const renderScreen = () => {
    switch (screen) {
      case 'feed': return <CLFeedScreen trips={CL_TRIPS} theme={theme} tweaks={t} onOpenTrip={openTrip}/>;
      case 'detail': return <CLDetailScreen trip={currentTrip} theme={theme} tweaks={t} onBack={back}/>;
      case 'new': return <CLNewScreen theme={theme} tweaks={t} onClose={back}/>;
      case 'map': return <CLMapScreen theme={theme} tweaks={t} onOpenCave={openCave}/>;
      case 'caves': return <CLCavesScreen theme={theme} tweaks={t} onOpenCave={openCave}/>;
      case 'stats': return <CLStatsScreen theme={theme} tweaks={t}/>;
      case 'profile': return <CLProfileScreen theme={theme} tweaks={t}/>;
      default: return null;
    }
  };

  // Stage background follows theme
  useEffect(() => {
    document.body.style.background = t.theme === 'light'
      ? 'radial-gradient(ellipse at top, #fbfbf7 0%, #e2e6da 85%)'
      : 'radial-gradient(ellipse at top, #1d2220 0%, #0d100e 85%)';
    document.body.style.color = theme.text;
  }, [theme, t.theme]);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 36, flexWrap: 'wrap',
    }}>
      <Phone theme={theme} screen={screen} navTab={navTab} setScreen={setScreen} goTab={goTab} renderScreen={renderScreen}/>
      {t.showTwoFrames && (
        <SecondaryFrames theme={theme} tweaks={t}/>
      )}

      <TweaksPanel>
        <TweakSection label="Farbschema"/>
        <TweakRadio label="Theme" value={t.theme} options={['light','dark']}
          onChange={v => setTweak('theme', v)}/>

        <TweakSection label="Listen-Layout"/>
        <TweakRadio label="Feed" value={t.layout} options={['cards','compact','timeline']}
          onChange={v => setTweak('layout', v)}/>

        <TweakSection label="Schwierigkeit"/>
        <TweakRadio label="Darstellung" value={t.diffMode} options={['bars','dots','numeric']}
          onChange={v => setTweak('diffMode', v)}/>
        <TweakToggle label="Farbig markieren" value={t.diffColored}
          onChange={v => setTweak('diffColored', v)}/>

        <TweakSection label="Ansicht"/>
        <TweakToggle label="Mehrere Geräte" value={t.showTwoFrames}
          onChange={v => setTweak('showTwoFrames', v)}/>

        <TweakSection label="Navigation"/>
        <TweakButton label="Logbuch" onClick={() => { setNavTab('feed'); setScreen('feed'); }}/>
        <TweakButton label="Detail" onClick={() => setScreen('detail')}/>
        <TweakButton label="Neue Befahrung" onClick={() => setScreen('new')}/>
        <TweakButton label="Karte" onClick={() => { setNavTab('map'); setScreen('map'); }}/>
        <TweakButton label="Höhlen" onClick={() => { setNavTab('caves'); setScreen('caves'); }}/>
        <TweakButton label="Statistik" onClick={() => { setNavTab('stats'); setScreen('stats'); }}/>
        <TweakButton label="Profil" onClick={() => { setNavTab('profile'); setScreen('profile'); }}/>
      </TweaksPanel>
    </div>
  );
}

function Phone({ theme, screen, navTab, setScreen, goTab, renderScreen }) {
  const isLight = theme.statusBarDark === false;
  return (
    <div style={{
      width: 412, height: 892,
      borderRadius: 36, overflow: 'hidden',
      background: theme.bg,
      border: `8px solid ${isLight ? '#dad9d4' : '#0a0b0e'}`,
      boxShadow: isLight
        ? '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)'
        : '0 30px 90px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
      position: 'relative',
    }}>
      <PhoneStatusBar theme={theme}/>
      <div className="cl-app cl-scroll" style={{
        flex: 1, overflow: 'auto',
        background: theme.bg,
        color: theme.text,
        position: 'relative',
      }}>
        {renderScreen()}
      </div>
      {screen !== 'new' && screen !== 'detail' && (
        <PhoneTabBar screen={navTab} onTab={goTab} onNew={() => setScreen('new')} theme={theme}/>
      )}
      <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
        <div style={{ width: 108, height: 4, borderRadius: 2, background: theme.text, opacity: 0.25 }}/>
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
        width: 100, height: 22, borderRadius: 12, background: '#000',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <svg width="16" height="10" viewBox="0 0 16 10">
          <rect x="0" y="7" width="2.5" height="3" fill={c}/>
          <rect x="4" y="5" width="2.5" height="5" fill={c}/>
          <rect x="8" y="2" width="2.5" height="8" fill={c}/>
          <rect x="12" y="0" width="2.5" height="10" fill={c} opacity="0.4"/>
        </svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
          <path d="M 1 4 Q 7 -1 13 4"/>
          <path d="M 3 6 Q 7 3 11 6"/>
          <circle cx="7" cy="8.5" r="0.8" fill={c}/>
        </svg>
        <svg width="22" height="10" viewBox="0 0 22 10">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke={c} fill="none"/>
          <rect x="19.5" y="3" width="1.5" height="4" fill={c}/>
          <rect x="2" y="2" width="13" height="6" fill={c} rx="1"/>
        </svg>
      </div>
    </div>
  );
}

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
      padding: '6px 0 6px',
      display: 'flex', alignItems: 'flex-end',
      position: 'relative',
    }}>
      <button onClick={onNew} style={{
        position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
        width: 48, height: 48, borderRadius: '50%',
        appearance: 'none', border: `2px solid ${theme.bg}`,
        background: theme.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 4,
        boxShadow: `0 4px 14px ${theme.accent}55`,
      }}>
        <CLIcon name="plus" size={22} color={theme.bg} strokeWidth={2.4}/>
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
      padding: '8px 0 4px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      fontFamily: 'inherit',
    }}>
      <CLIcon name={tab.i} size={19} color={active ? theme.accent : theme.textMute} strokeWidth={active ? 1.7 : 1.4}/>
      <span style={{
        fontSize: 9, fontWeight: active ? 600 : 500,
        color: active ? theme.accent : theme.textMute,
        letterSpacing: 0.3,
      }}>{tab.l}</span>
    </button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CaveLogApp/>);
