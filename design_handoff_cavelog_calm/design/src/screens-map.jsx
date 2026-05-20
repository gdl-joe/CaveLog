// screens-map.jsx — Karten-Screen, ruhig (Mock-Karte)

const CLMapScreen = ({ theme, tweaks, onOpenCave }) => {
  const [filter, setFilter] = React.useState('alle');
  const filters = ['alle','DE','AT','CH','Favoriten'];

  const visible = filter === 'alle' || filter === 'Favoriten'
    ? CL_CAVES
    : CL_CAVES.filter(c => c.country === filter);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Map area (Mock) */}
      <div style={{
        flex: 1, position: 'relative',
        background: theme.bgSubtle,
        borderBottom: `1px solid ${theme.border}`,
        overflow: 'hidden',
      }}>
        {/* Subtle grid for "map" feel */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme.border} strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          {/* Mock terrain contours */}
          <path d="M 0 200 Q 100 150 200 220 T 400 180" stroke={theme.borderHi} strokeWidth="1" fill="none" opacity="0.6"/>
          <path d="M 0 280 Q 120 240 220 290 T 400 250" stroke={theme.borderHi} strokeWidth="1" fill="none" opacity="0.4"/>
          <path d="M 0 360 Q 150 320 250 370 T 400 340" stroke={theme.borderHi} strokeWidth="1" fill="none" opacity="0.3"/>
        </svg>

        {/* Search */}
        <div style={{
          position: 'absolute', top: 14, left: 14, right: 14,
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <CLIcon name="search" size={16} color={theme.textMute}/>
          <input placeholder="Höhle suchen…" style={{
            flex: 1, border: 'none', background: 'transparent',
            color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}/>
        </div>

        {/* Filter pills */}
        <div style={{
          position: 'absolute', top: 64, left: 14, right: 14,
          display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              appearance: 'none', cursor: 'pointer',
              padding: '5px 11px',
              background: filter === f ? theme.text : theme.bgCard,
              color: filter === f ? theme.bg : theme.text,
              border: `1px solid ${filter === f ? theme.text : theme.border}`,
              borderRadius: 6, fontSize: 11, fontWeight: 500,
              whiteSpace: 'nowrap', fontFamily: 'inherit',
            }}>{f}</button>
          ))}
        </div>

        {/* Mock pins */}
        {visible.map((c, i) => {
          const x = 30 + (i * 67) % 320;
          const y = 180 + ((i * 89) % 200);
          return (
            <div key={c.id} onClick={() => onOpenCave(c.id)} style={{
              position: 'absolute', left: x, top: y,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: theme.text, color: theme.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                border: `2px solid ${theme.bg}`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}>{c.entries}</div>
            </div>
          );
        })}

        {/* Attribution */}
        <div style={{
          position: 'absolute', bottom: 6, right: 8,
          fontSize: 9, color: theme.textMute,
          fontFamily: 'JetBrains Mono, monospace',
        }}>© Mapy.cz</div>
      </div>

      {/* Bottom sheet */}
      <div style={{
        background: theme.bgElev, borderTop: `1px solid ${theme.border}`,
        maxHeight: '38%', overflowY: 'auto',
      }}>
        <div style={{
          padding: '10px 16px 4px',
          fontSize: 10, fontWeight: 600, letterSpacing: 1,
          textTransform: 'uppercase', color: theme.textMute,
        }}>
          Sichtbar · {visible.length}
        </div>
        {visible.map(c => (
          <div key={c.id} onClick={() => onOpenCave(c.id)} style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${theme.border}`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{c.name}</div>
              <div style={{ fontSize: 11, color: theme.textMute }}>{c.region}</div>
            </div>
            <div style={{ fontSize: 11, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
              {c.entries} Bef.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.CLMapScreen = CLMapScreen;
