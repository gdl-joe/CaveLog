// screens-stats.jsx — Dashboard, ruhig

const CLStatsScreen = ({ theme, tweaks }) => {
  const trips = CL_TRIPS;

  // KPIs
  const kpis = [
    { label: 'Befahrungen', value: trips.length, unit: '' },
    { label: 'Höhlen', value: new Set(trips.map(t => t.caveId)).size, unit: '' },
    { label: 'Gesamttiefe', value: trips.reduce((s,t) => s+t.depth, 0), unit: 'm' },
    { label: 'Stunden', value: Math.round(trips.reduce((s,t) => s+t.duration, 0)/60), unit: 'h' },
  ];

  // Monatsbalken (12 Monate, mock-Daten)
  const monthBars = [1,2,1,3,2,1,2,2,3,1,2,2];
  const maxBar = Math.max(...monthBars);

  // Donut: Typen
  const typeCounts = {};
  trips.forEach(t => { typeCounts[t.type] = (typeCounts[t.type] || 0) + 1; });
  const types = Object.entries(typeCounts);
  const total = trips.length;
  let acc = 0;
  const segments = types.map(([k, v]) => {
    const start = acc / total;
    acc += v;
    const end = acc / total;
    return { k, v, start, end };
  });
  const grayShades = [theme.accent, theme.accentDim || theme.textMute, theme.borderHi, theme.border];

  // Heatmap (52 Wochen)
  const heat = Array.from({ length: 52 * 7 }, (_, i) => {
    const r = Math.sin(i * 1.7) * Math.cos(i * 0.3);
    return r > 0.7 ? 3 : r > 0.3 ? 2 : r > -0.2 ? 1 : 0;
  });
  const heatColors = [
    theme.bgSubtle,
    theme.accent + '40',
    theme.accent + '90',
    theme.accent,
  ];

  // Top-Höhlen
  const counts = {};
  trips.forEach(t => { counts[t.caveId] = (counts[t.caveId] || 0) + 1; });
  const top = Object.entries(counts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, c]) => ({ cave: CL_getCave(id), count: c }));
  const maxCount = Math.max(...top.map(x => x.count));

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ padding: '18px 18px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 4 }}>
          Übersicht
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: 1.1, color: theme.text, letterSpacing: -0.6 }}>
          Statistik
        </h1>
      </div>

      {/* KPI grid */}
      <div style={{ padding: '4px 14px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {kpis.map((k, i) => (
          <CLStatTile key={k.label} label={k.label} value={k.value} unit={k.unit} theme={theme}
            accent={['primary','warm','ochre','primary'][i % 4]}/>
        ))}
      </div>

      {/* Monatsbalken */}
      <CLSection title="Befahrungen pro Monat" theme={theme}>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: '14px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {monthBars.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  height: `${(v / maxBar) * 64}px`,
                  background: i % 2 === 0 ? theme.accent : theme.warm,
                  borderRadius: 2,
                  opacity: v ? 1 : 0.2,
                }}/>
                <div style={{ fontSize: 8, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
                  {['M','J','J','A','S','O','N','D','J','F','M','A'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CLSection>

      {/* Donut */}
      <CLSection title="Typen-Verteilung" theme={theme}>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: 14,
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <svg width="84" height="84" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
            {segments.map((s, i) => {
              const a1 = s.start * 2 * Math.PI - Math.PI / 2;
              const a2 = s.end * 2 * Math.PI - Math.PI / 2;
              const x1 = 50 + 42 * Math.cos(a1);
              const y1 = 50 + 42 * Math.sin(a1);
              const x2 = 50 + 42 * Math.cos(a2);
              const y2 = 50 + 42 * Math.sin(a2);
              const large = (s.end - s.start) > 0.5 ? 1 : 0;
              return (
                <path key={s.k}
                  d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${large} 1 ${x2} ${y2} Z`}
                  fill={grayShades[i % grayShades.length]}/>
              );
            })}
            <circle cx="50" cy="50" r="22" fill={theme.bgCard}/>
            <text x="50" y="54" textAnchor="middle"
              fontSize="14" fontWeight="600" fill={theme.text}
              fontFamily="Inter">{total}</text>
          </svg>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {segments.map((s, i) => (
              <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: grayShades[i % grayShades.length],
                }}/>
                <div style={{ fontSize: 12, color: theme.text, flex: 1 }}>{s.k}</div>
                <div style={{ fontSize: 11, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </CLSection>

      {/* Heatmap */}
      <CLSection title="Aktivität · 52 Wochen" theme={theme}>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: 14, overflowX: 'auto',
        }}>
          <div style={{
            display: 'grid', gridTemplateRows: 'repeat(7, 8px)', gridAutoFlow: 'column',
            gridAutoColumns: '8px', gap: 2,
          }}>
            {heat.map((v, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: 1,
                background: heatColors[v],
              }}/>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            marginTop: 10, fontSize: 9, color: theme.textMute,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            <span>weniger</span>
            {heatColors.map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 1, background: c }}/>
            ))}
            <span>mehr</span>
          </div>
        </div>
      </CLSection>

      {/* Top-Höhlen */}
      <CLSection title="Top Höhlen" theme={theme}>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: '6px 12px',
        }}>
          {top.map((x, i) => (
            <div key={x.cave.id} style={{
              padding: '10px 0',
              borderBottom: i < top.length - 1 ? `1px solid ${theme.border}` : 'none',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ fontSize: 11, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace', width: 18 }}>
                {String(i+1).padStart(2,'0')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{x.cave.name}</div>
                <div style={{
                  height: 4, background: theme.bgSubtle, borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(x.count / maxCount) * 100}%`,
                    height: '100%', background: theme.warm,
                  }}/>
                </div>
              </div>
              <div style={{ fontSize: 12, color: theme.text, fontFamily: 'JetBrains Mono, monospace' }}>
                {x.count}×
              </div>
            </div>
          ))}
        </div>
      </CLSection>
    </div>
  );
};

window.CLStatsScreen = CLStatsScreen;
