// Stats-Screen — CaveLog Calm: Monatsbalken, Heatmap, Top-Höhlen
import { CLStatTile, CLSection, CLfmt } from '../atoms.jsx';

export default function StatsScreen({ theme, trips = [], caves = [] }) {
  // KPIs
  const kpis = [
    { label: 'Befahrungen', value: trips.length,                                                                        unit: '',  accent: 'primary' },
    { label: 'Höhlen',      value: new Set(trips.map(t => t.caveId)).size,                                              unit: '',  accent: 'warm'    },
    { label: 'Gesamttiefe', value: trips.reduce((s, t) => s + (t.depth  || 0), 0),                                     unit: 'm', accent: 'ochre'   },
    { label: 'Stunden',     value: Math.round(trips.reduce((s, t) => s + (t.duration || 0), 0) / 60),                 unit: 'h', accent: 'primary' },
  ];

  // Letzte 12 Monate
  const MON = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  const now  = new Date();
  const monthBars = Array.from({ length: 12 }, (_, i) => {
    const d  = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const mt = trips.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    return { m: MON[d.getMonth()].slice(0,1), count: mt.length };
  });
  const maxBar = Math.max(...monthBars.map(m => m.count), 1);

  // Typen-Verteilung (Donut)
  const typeCounts = {};
  trips.forEach(t => { if (t.type) typeCounts[t.type] = (typeCounts[t.type] || 0) + 1; });
  const types   = Object.entries(typeCounts);
  const total   = trips.length;
  let   acc     = 0;
  const segments = types.map(([k, v]) => {
    const start = acc / Math.max(total, 1);
    acc += v;
    return { k, v, start, end: acc / Math.max(total, 1) };
  });
  const segColors = [theme.accent, theme.warm, theme.ochre, theme.borderHi];

  // Heatmap (52 Wochen)
  const heatColors = [theme.bgSubtle, theme.accent + '40', theme.accent + '90', theme.accent];
  const heat = Array.from({ length: 52 * 7 }, (_, i) => {
    // echte Daten: trips nach Datum aufschlüsseln
    const weekAgo = new Date(now.getTime() - (52 * 7 - i) * 24 * 60 * 60 * 1000);
    const dateStr = weekAgo.toISOString().slice(0, 10);
    const count   = trips.filter(t => t.date === dateStr).length;
    return count >= 3 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0;
  });

  // Top-Höhlen
  const counts = {};
  trips.forEach(t => { if (t.caveId) counts[t.caveId] = (counts[t.caveId] || 0) + 1; });
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, c]) => ({ cave: caves.find(x => x.id === id), count: c }))
    .filter(x => x.cave);
  const maxCount = Math.max(...top.map(x => x.count), 1);

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '18px 18px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 4 }}>
          Übersicht
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: 1.1, color: theme.text, letterSpacing: -0.6 }}>
          Statistik
        </h1>
      </div>

      {/* KPI-Grid */}
      <div style={{ padding: '4px 14px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {kpis.map(k => (
          <CLStatTile key={k.label} label={k.label} value={k.value} unit={k.unit} theme={theme} accent={k.accent} />
        ))}
      </div>

      {/* Monatsbalken */}
      <CLSection title="Befahrungen pro Monat" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {monthBars.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  height: `${(m.count / maxBar) * 64}px`,
                  minHeight: m.count > 0 ? 4 : 2,
                  background: i % 2 === 0 ? theme.accent : theme.warm,
                  borderRadius: 2,
                  opacity: m.count > 0 ? 1 : 0.2,
                }} />
                <div style={{ fontSize: 8, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
                  {m.m}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CLSection>

      {/* Typen-Verteilung */}
      {types.length > 0 && (
        <CLSection title="Typen-Verteilung" theme={theme}>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 18 }}>
            <svg width="84" height="84" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
              {segments.map((s, i) => {
                const a1 = s.start * 2 * Math.PI - Math.PI / 2;
                const a2 = s.end   * 2 * Math.PI - Math.PI / 2;
                const x1 = 50 + 42 * Math.cos(a1); const y1 = 50 + 42 * Math.sin(a1);
                const x2 = 50 + 42 * Math.cos(a2); const y2 = 50 + 42 * Math.sin(a2);
                const lg = (s.end - s.start) > 0.5 ? 1 : 0;
                return <path key={s.k} d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${lg} 1 ${x2} ${y2} Z`} fill={segColors[i % segColors.length]} />;
              })}
              <circle cx="50" cy="50" r="22" fill={theme.bgCard} />
              <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="600" fill={theme.text} fontFamily="Inter">{total}</text>
            </svg>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {segments.map((s, i) => (
                <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: segColors[i % segColors.length], flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: theme.text, flex: 1 }}>{s.k}</div>
                  <div style={{ fontSize: 11, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </CLSection>
      )}

      {/* Aktivitäts-Heatmap */}
      <CLSection title="Aktivität · 52 Wochen" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 8px)', gridAutoFlow: 'column', gridAutoColumns: '8px', gap: 2 }}>
            {heat.map((v, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 1, background: heatColors[v] }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 9, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>weniger</span>
            {heatColors.map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 1, background: c }} />)}
            <span>mehr</span>
          </div>
        </div>
      </CLSection>

      {/* Top-Höhlen */}
      {top.length > 0 && (
        <CLSection title="Top Höhlen" theme={theme}>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '6px 12px' }}>
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {x.cave.name}
                  </div>
                  <div style={{ height: 4, background: theme.bgSubtle, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${(x.count / maxCount) * 100}%`, height: '100%', background: theme.warm }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: theme.text, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>{x.count}×</div>
              </div>
            ))}
          </div>
        </CLSection>
      )}
    </div>
  );
}
