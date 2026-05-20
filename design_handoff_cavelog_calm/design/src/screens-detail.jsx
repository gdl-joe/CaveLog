// screens-detail.jsx — Trip-Detail, ruhig

const CLDetailScreen = ({ trip, theme, tweaks, onBack }) => {
  const cave = CL_getCave(trip.caveId);
  const diffMode = tweaks.diffMode || 'bars';
  const diffColored = !!tweaks.diffColored;

  return (
    <div style={{ paddingBottom: 30 }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: theme.bg,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <button onClick={onBack} style={{
          appearance: 'none', border: `1px solid ${theme.border}`, background: theme.bgCard,
          width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CLIcon name="back" size={18} color={theme.text}/>
        </button>
        <div style={{ fontSize: 11, color: theme.warm, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
          {CLfmt.date(trip.date)}
        </div>
        <button style={{
          appearance: 'none', border: `1px solid ${theme.border}`, background: theme.bgCard,
          width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CLIcon name="more" size={18} color={theme.text}/>
        </button>
      </div>

      {/* Title block */}
      <div style={{ padding: '20px 18px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 14, height: 2, background: theme.accent, borderRadius: 1 }}/>
          <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {cave.name} · {cave.region}
          </div>
        </div>
        <h1 style={{
          margin: 0, fontSize: 24, fontWeight: 600, lineHeight: 1.18,
          color: theme.text, letterSpacing: -0.4,
        }}>
          {trip.title}
        </h1>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          <CLChip icon label={trip.type} theme={theme} tone="neutral"/>
          <CLChip icon label={trip.wet} theme={theme} tone={trip.wet === 'Trocken' ? 'neutral' : 'wet'}/>
          <CLChip icon label={trip.rope} theme={theme} tone="rope"/>
          {trip.weather && <CLChip label={trip.weather} theme={theme} tone="neutral"/>}
        </div>
      </div>

      {/* Stats grid */}
      <CLSection title="Kennzahlen" theme={theme}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <MiniStat label="Start" value={trip.start} theme={theme} mono/>
          <MiniStat label="Ende" value={trip.end} theme={theme} mono/>
          <MiniStat label="Dauer" value={CLfmt.duration(trip.duration)} theme={theme}/>
          <MiniStat label="Tiefe" value={`−${trip.depth} m`} theme={theme} mono/>
          <MiniStat label="Länge" value={CLfmt.m(trip.length)} theme={theme} mono/>
          <MiniStat label="Bewertung" value={`${trip.rating}/5`} theme={theme}/>
        </div>
      </CLSection>

      {/* Difficulty */}
      <CLSection title="Schwierigkeit" theme={theme}>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        }}>
          <CLDifficulty diff={trip.difficulty} mode={diffMode} theme={theme} size="md" colored={diffColored}/>
        </div>
      </CLSection>

      {/* Team */}
      <CLSection title={`Team · ${trip.team.length}`} theme={theme}>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: 12,
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          {trip.team.map((m, i) => (
            <div key={m} style={{
              padding: '8px 4px',
              borderBottom: i < trip.team.length - 1 ? `1px solid ${theme.border}` : 'none',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: theme.bgSubtle, border: `1px solid ${theme.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color: theme.text, letterSpacing: 0.3,
              }}>
                {m.split(' ').map(p => p[0]).join('').slice(0,2)}
              </div>
              <div style={{ fontSize: 13, color: theme.text }}>{m}</div>
            </div>
          ))}
        </div>
      </CLSection>

      {/* Gear */}
      <CLSection title="Ausrüstung" theme={theme}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {trip.gear.map(g => (
            <div key={g} style={{
              padding: '6px 10px',
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              fontSize: 12, color: theme.text,
            }}>{g}</div>
          ))}
        </div>
      </CLSection>

      {/* Hazards */}
      {trip.hazards.length > 0 && (
        <CLSection title="Gefahren" theme={theme}>
          <div style={{
            background: theme.bgCard, border: `1px solid ${theme.border}`,
            borderLeft: `2px solid ${theme.danger}`,
            borderRadius: 8, padding: '10px 14px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {trip.hazards.map(h => (
              <div key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: theme.text, lineHeight: 1.4 }}>
                <span style={{ color: theme.danger, marginTop: 1 }}>•</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </CLSection>
      )}

      {/* Notes */}
      <CLSection title="Notizen" theme={theme}>
        <div style={{
          fontSize: 14, lineHeight: 1.6, color: theme.text, fontWeight: 400,
          textWrap: 'pretty',
        }}>
          {trip.notes}
        </div>
      </CLSection>

      {/* Photos */}
      <CLSection title={`Fotos · ${trip.photos}`} theme={theme}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[0,1,2].map(i => (
            <CLPhoto key={i} theme={theme} height={92} radius={6}/>
          ))}
        </div>
        <button style={{
          marginTop: 10, width: '100%', appearance: 'none',
          background: 'transparent', border: `1px solid ${theme.border}`,
          borderRadius: 8, padding: 10, fontSize: 12, color: theme.text,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Alle {trip.photos} anzeigen
        </button>
      </CLSection>
    </div>
  );
};

const MiniStat = ({ label, value, theme, mono }) => (
  <div style={{
    background: theme.bgCard, border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: '10px 12px',
  }}>
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, color: theme.textMute, textTransform: 'uppercase', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{
      fontSize: 14, fontWeight: 600, color: theme.text, lineHeight: 1.1,
      fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter',
    }}>
      {value}
    </div>
  </div>
);

window.CLDetailScreen = CLDetailScreen;
