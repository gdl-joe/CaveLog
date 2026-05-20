// screens-stats.jsx — Dashboard

const CLStatsScreen = ({ theme, tweaks }) => {
  const u = CL_CURRENT_USER;
  // Aggregate by month for the 6-month chart
  const months = ['Nov', 'Dez', 'Jan', 'Feb', 'Mär', 'Apr'];
  const byMonth = [
    { m: 'Nov', h: 10.6, d: 220 },
    { m: 'Dez', h: 0, d: 0 },
    { m: 'Jan', h: 4.75, d: 38 },
    { m: 'Feb', h: 16.5, d: 480 },
    { m: 'Mär', h: 8.25, d: 25 },
    { m: 'Apr', h: 11.25, d: 310 },
  ];
  const maxH = Math.max(...byMonth.map(m => m.h));

  // Type distribution
  const typeDist = {};
  CL_TRIPS.forEach(t => { typeDist[t.type] = (typeDist[t.type] || 0) + 1; });
  const typeTotal = CL_TRIPS.length;
  const typeColors = {
    Vertikal: theme.accent, Horizontal: theme.rope, Labyrinth: theme.wet, Mixed: theme.success,
  };

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Hero */}
      <div style={{ padding: '20px 20px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: theme.accent, textTransform: 'uppercase', marginBottom: 6 }}>
          Dashboard
        </div>
        <h1 style={{
          margin: 0, fontFamily: 'Fraunces, serif',
          fontSize: 32, fontWeight: 500, color: theme.text, letterSpacing: -0.3, lineHeight: 1.05,
        }}>Seit <span style={{ fontStyle: 'italic', color: theme.accent }}>2019</span> unter Tage.</h1>
      </div>

      {/* Key tiles */}
      <div style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <CLStatTile icon="caves" label="Befahrungen" value={u.trips} unit="Touren" theme={theme} accent={theme.accent}/>
        <CLStatTile icon="depth" label="Max. Tiefe" value={Math.max(...CL_TRIPS.map(t=>t.depth))} unit="m" theme={theme} accent={theme.accent}/>
        <CLStatTile icon="length" label="Gesamtstrecke" value={(u.totalLength/1000).toFixed(1)} unit="km" theme={theme} accent={theme.rope}/>
        <CLStatTile icon="clock" label="Stunden" value={u.totalHours} unit="h" theme={theme} accent={theme.wet}/>
      </div>

      {/* Monthly chart */}
      <div style={{ padding: '18px 20px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 14 }}>
          Letzte 6 Monate · Stunden
        </div>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 14, padding: '16px 14px',
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 150 }}>
            {byMonth.map((m, i) => (
              <div key={m.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: m.h > 0 ? theme.accent : theme.textDim,
                  fontWeight: 600,
                }}>{m.h > 0 ? m.h.toFixed(1) : '·'}</div>
                <div style={{
                  width: '100%',
                  height: m.h > 0 ? Math.round((m.h/maxH) * 100) : 2,
                  minHeight: 2,
                  background: m.h > 0
                    ? `linear-gradient(to top, ${theme.accent}, ${theme.accent}88)`
                    : theme.border,
                  borderRadius: '3px 3px 0 0',
                  position: 'relative',
                }}>
                  {m.h > 0 && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                      background: theme.accent,
                    }}/>
                  )}
                </div>
                <div style={{ fontSize: 10, color: theme.textMute, fontWeight: 500 }}>{m.m}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Type distribution */}
      <div style={{ padding: '18px 20px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 14 }}>
          Höhlentypen
        </div>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 14, padding: 14,
        }}>
          {/* Stacked bar */}
          <div style={{
            display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 12,
          }}>
            {Object.entries(typeDist).map(([t, n]) => (
              <div key={t} style={{
                width: `${(n/typeTotal)*100}%`,
                background: typeColors[t] || theme.accent,
              }}/>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(typeDist).map(([t, n]) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: typeColors[t] || theme.accent, flexShrink: 0,
                }}/>
                <div style={{ flex: 1, fontSize: 13, color: theme.text, minWidth: 0 }}>{t}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: theme.textMute, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {n} · {Math.round((n/typeTotal)*100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Depth profile */}
      <div style={{ padding: '18px 20px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 14 }}>
          Tiefenprofil · Alle Touren
        </div>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 14, padding: '16px 14px',
          position: 'relative',
        }}>
          <svg viewBox="0 0 280 140" width="100%" style={{ display: 'block' }}>
            {/* horizon */}
            <line x1="0" y1="10" x2="280" y2="10" stroke={theme.border} strokeDasharray="2 3"/>
            <text x="2" y="8" fontSize="8" fill={theme.textMute} fontFamily="JetBrains Mono, monospace">0m</text>
            <line x1="0" y1="70" x2="280" y2="70" stroke={theme.border} strokeDasharray="2 3" opacity="0.5"/>
            <text x="2" y="68" fontSize="8" fill={theme.textMute} fontFamily="JetBrains Mono, monospace">−250m</text>
            <line x1="0" y1="130" x2="280" y2="130" stroke={theme.border} strokeDasharray="2 3" opacity="0.5"/>
            <text x="2" y="128" fontSize="8" fill={theme.textMute} fontFamily="JetBrains Mono, monospace">−500m</text>
            {/* bars */}
            {CL_TRIPS.slice().reverse().map((t, i) => {
              const x = 30 + i * 40;
              const h = (t.depth / 500) * 120;
              return (
                <g key={t.id}>
                  <rect x={x} y="10" width="20" height={h}
                    fill={theme.accent} opacity="0.7" rx="2"/>
                  <text x={x+10} y={10 + h + 10} fontSize="7" fill={theme.textMute} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                    {CLfmt.dateShort(t.date)}
                  </text>
                  <text x={x+10} y={10 + h - 3} fontSize="8" fill={theme.accent} textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="600">
                    {t.depth}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Achievements */}
      <div style={{ padding: '18px 20px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 14 }}>
          Meilensteine
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: 'depth', label: 'Tiefer als 300m', sub: 'Schwarzmooskogel, April 2026', color: theme.accent },
            { icon: 'flame', label: '100 Stunden unter Tage', sub: '102h · erreicht im März', color: theme.rope },
            { icon: 'caves', label: '6 verschiedene Höhlen', sub: 'In 3 Ländern', color: theme.wet },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: theme.bgCard,
              border: `1px solid ${theme.border}`, borderRadius: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: a.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CLIcon name={a.icon} size={18} color={a.color}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                <div style={{ color: theme.textMute, fontSize: 11 }}>{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.CLStatsScreen = CLStatsScreen;
