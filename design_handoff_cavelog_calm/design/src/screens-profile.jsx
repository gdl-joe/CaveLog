// screens-profile.jsx — Profil, ruhig

const CLProfileScreen = ({ theme, tweaks }) => {
  const u = CL_CURRENT_USER;
  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '20px 18px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.warm} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 600, color: theme.bg,
          letterSpacing: 0.5,
        }}>
          MK
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: theme.text, lineHeight: 1.1 }}>{u.name}</div>
          <div style={{ fontSize: 12, color: theme.warm, marginTop: 3, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {u.handle}
          </div>
          <div style={{ marginTop: 6, display: 'inline-block',
            padding: '2px 8px', borderRadius: 999,
            background: theme.accentSoft, border: `1px solid ${theme.accent}33`,
            fontSize: 10, fontWeight: 600, color: theme.accent, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            {u.role}
          </div>
        </div>
      </div>

      {/* Mini KPI strip */}
      <div style={{ padding: '0 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <CLStatTile label="Trips" value={u.trips} theme={theme} accent="primary"/>
        <CLStatTile label="Höhlen" value={u.caves} theme={theme} accent="warm"/>
        <CLStatTile label="Stunden" value={u.totalHours} unit="h" theme={theme} accent="ochre"/>
      </div>

      {/* Sections */}
      <CLSection title="Konto" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <CLRow label="Name" value={u.name.split(' ')[0]} theme={theme} onClick={() => {}}/>
          <CLRow label="E-Mail" value="m@…de" theme={theme} onClick={() => {}}/>
          <CLRow label="Passwort" value="••••" theme={theme} onClick={() => {}} last/>
        </div>
      </CLSection>

      <CLSection title="Darstellung" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <CLRow label="Theme" value="Hell" theme={theme} onClick={() => {}}/>
          <CLRow label="Listen-Layout" value="Karten" theme={theme} onClick={() => {}}/>
          <CLRow label="Schwierigkeit" value="Balken" theme={theme} onClick={() => {}} last/>
        </div>
      </CLSection>

      <CLSection title="Export" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <CLRow label="Logbuch als PDF" hint="Aktuelles Jahr · alle Trips" theme={theme} onClick={() => {}}/>
          <CLRow label="JSON-Export" hint="Alle Daten" theme={theme} onClick={() => {}}/>
          <CLRow label="Höhlen als CSV" theme={theme} onClick={() => {}} last/>
        </div>
      </CLSection>

      <CLSection title="Admin" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <CLRow label="Nutzer verwalten" hint="3 aktiv · 1 ausstehend" theme={theme} onClick={() => {}}/>
          <CLRow label="Einladungen" theme={theme} onClick={() => {}} last/>
        </div>
      </CLSection>

      <CLSection title="" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <CLRow label="Abmelden" theme={theme} onClick={() => {}} danger last/>
        </div>
        <div style={{
          marginTop: 18, textAlign: 'center',
          fontSize: 10, color: theme.textDim,
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.4,
        }}>
          CaveLog · v0.2 · seit {u.since}
        </div>
      </CLSection>
    </div>
  );
};

window.CLProfileScreen = CLProfileScreen;
