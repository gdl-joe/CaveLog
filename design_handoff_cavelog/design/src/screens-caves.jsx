// screens-caves.jsx — Höhlen-Verzeichnis

const CLCavesScreen = ({ theme, tweaks, onOpenCave }) => {
  const [sort, setSort] = React.useState('entries');
  const sorted = [...CL_CAVES].sort((a, b) => {
    if (sort === 'entries') return b.entries - a.entries;
    if (sort === 'depth') return b.depth - a.depth;
    if (sort === 'length') return b.length - a.length;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ padding: '18px 20px 4px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: theme.accent, textTransform: 'uppercase', marginBottom: 6 }}>
          Verzeichnis
        </div>
        <h1 style={{
          margin: 0, fontFamily: 'Fraunces, serif',
          fontSize: 32, fontWeight: 500, color: theme.text, letterSpacing: -0.3, lineHeight: 1.05,
        }}>Höhlen, in denen ich <span style={{ fontStyle: 'italic', color: theme.accent }}>war</span>.</h1>
        <div style={{ marginTop: 8, color: theme.textMute, fontSize: 12 }}>
          {CL_CAVES.length} Einträge · Sortiert nach
        </div>
      </div>

      {/* Sort chips */}
      <div style={{ padding: '10px 20px 14px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { k: 'entries', l: 'Besuche' },
          { k: 'depth', l: 'Tiefe' },
          { k: 'length', l: 'Länge' },
          { k: 'name', l: 'A–Z' },
        ].map(s => (
          <button key={s.k} onClick={() => setSort(s.k)} style={{
            appearance: 'none', border: `0.5px solid ${sort === s.k ? theme.accent : theme.border}`,
            padding: '6px 14px', borderRadius: 999,
            background: sort === s.k ? theme.accent : 'transparent',
            color: sort === s.k ? theme.bg : theme.textMute,
            fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}>{s.l}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((c, i) => (
          <div key={c.id} onClick={() => onOpenCave && onOpenCave(c.id)} style={{
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            padding: 14,
            cursor: 'pointer',
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            {/* Depth visual */}
            <div style={{
              width: 54, height: 54, flexShrink: 0,
              borderRadius: 10, background: theme.bg,
              border: `1px solid ${theme.border}`,
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center',
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${Math.min(100, (c.depth / 1300) * 100)}%`,
                background: `linear-gradient(to top, ${theme.accent}, ${theme.accent}66)`,
                opacity: 0.3,
              }}/>
              <div style={{
                position: 'relative', zIndex: 2,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9, color: theme.accent, fontWeight: 700,
                padding: '0 0 5px',
                letterSpacing: 0.5,
              }}>
                −{c.depth}m
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: theme.accent, letterSpacing: 0.8 }}>{c.country}</span>
                <span style={{ fontSize: 10, color: theme.textMute }}>·</span>
                <span style={{ fontSize: 10, color: theme.textMute }}>{c.region}</span>
              </div>
              <div style={{
                fontFamily: 'Fraunces, serif', fontSize: 16, color: theme.text,
                fontWeight: 500, lineHeight: 1.15, marginBottom: 4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{c.name}</div>
              <div style={{ display: 'flex', gap: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: theme.textMute }}>
                <span>{c.length >= 1000 ? (c.length/1000).toFixed(1)+' km' : c.length+'m'}</span>
                <span>·</span>
                <span style={{ color: theme.accent }}>{c.entries}× besucht</span>
                <span>·</span>
                <span>{c.type}</span>
              </div>
            </div>
            <CLIcon name="chevron-right" size={16} color={theme.textMute}/>
          </div>
        ))}
      </div>
    </div>
  );
};

window.CLCavesScreen = CLCavesScreen;
