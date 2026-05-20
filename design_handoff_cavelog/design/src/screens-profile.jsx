// screens-profile.jsx — Nutzer-Profil

const CLProfileScreen = ({ theme, tweaks }) => {
  const u = CL_CURRENT_USER;
  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Hero */}
      <div style={{ position: 'relative', padding: '28px 20px 20px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          <CLCaveArt variant="chamber" seed={99} theme={theme} height={200}/>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 20%, ${theme.bg})` }}/>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 82, height: 82, borderRadius: '50%',
            margin: '0 auto',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.rope})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 600,
            color: theme.bg,
            border: `3px solid ${theme.bg}`,
            boxShadow: `0 0 30px ${theme.accent}44`,
          }}>MK</div>
          <div style={{ marginTop: 12, fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: theme.text }}>
            {u.name}
          </div>
          <div style={{ fontSize: 12, color: theme.textMute, marginTop: 2 }}>
            {u.handle} · dabei seit Juni 2019
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginTop: 10, padding: '4px 10px',
            background: theme.accentSoft, borderRadius: 999,
            border: `0.5px solid ${theme.borderHi}`,
            fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.accent, textTransform: 'uppercase',
          }}>
            <CLIcon name="lock" size={10} color={theme.accent}/>
            Admin
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ padding: '4px 16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {[
          { l: 'Touren', v: u.trips },
          { l: 'Höhlen', v: u.caves },
          { l: 'Tiefe', v: `−${Math.max(...CL_TRIPS.map(t=>t.depth))}` },
          { l: 'Stunden', v: u.totalHours },
        ].map((s, i) => (
          <div key={i} style={{
            background: theme.bgCard, border: `1px solid ${theme.border}`,
            borderRadius: 12, padding: '10px 4px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: theme.text, lineHeight: 1 }}>
              {s.v}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: theme.textMute, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Settings list */}
      <div style={{ padding: '22px 16px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
          Administration
        </div>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {[
            { icon: 'people', l: 'Nutzer verwalten', r: '4 Betrachter' },
            { icon: 'upload', l: 'Export (GPX · PDF · CSV)', r: '' },
            { icon: 'globe', l: 'Sichtbarkeit · Öffentlich', r: '2 freigegeben' },
            { icon: 'edit', l: 'Höhlen-Einträge verwalten', r: `${CL_CAVES.length} aktiv` },
          ].map((row, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 14px',
              borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: theme.accentSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CLIcon name={row.icon} size={16} color={theme.accent}/>
              </div>
              <div style={{ flex: 1, fontSize: 14, color: theme.text, fontWeight: 500 }}>{row.l}</div>
              {row.r && <div style={{ fontSize: 11, color: theme.textMute }}>{row.r}</div>}
              <CLIcon name="chevron-right" size={14} color={theme.textMute}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>
          App
        </div>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {[
            { icon: 'bars', l: 'Darstellungsoptionen' },
            { icon: 'weather', l: 'Einheiten · Metrisch' },
            { icon: 'warning', l: 'Datenschutz & Sicherheit' },
          ].map((row, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 14px',
              borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: theme.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CLIcon name={row.icon} size={16} color={theme.textMute}/>
              </div>
              <div style={{ flex: 1, fontSize: 14, color: theme.text, fontWeight: 500 }}>{row.l}</div>
              <CLIcon name="chevron-right" size={14} color={theme.textMute}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: '16px 20px 0', textAlign: 'center', color: theme.textDim,
        fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
      }}>
        CaveLog v0.1 · build 2026.04
      </div>
    </div>
  );
};

window.CLProfileScreen = CLProfileScreen;
