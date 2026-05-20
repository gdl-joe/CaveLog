// atoms.jsx — Wiederverwendbare Bausteine für CaveLog

const { useState, useEffect, useRef, useMemo } = React;

// Sterne-Rating
const CLStars = ({ value = 0, max = 5, size = 14, color }) => {
  const c = color || '#f5a524';
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <CLIcon
          key={i}
          name={i < value ? 'star-filled' : 'star'}
          size={size}
          color={i < value ? c : 'rgba(245,165,36,0.25)'}
          strokeWidth={1.4}
        />
      ))}
    </div>
  );
};

// Kleiner Chip (z.B. Nass, SRT, Vertikal)
const CLChip = ({ icon, label, color, bg, theme }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 9px',
    background: bg || theme.accentSoft,
    color: color || theme.accent,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: 0.2,
    border: `0.5px solid ${color ? color + '33' : theme.borderHi}`,
  }}>
    {icon && <CLIcon name={icon} size={12} color={color || theme.accent} strokeWidth={1.8} />}
    <span>{label}</span>
  </div>
);

// Difficulty-Visualisierung (drei Achsen: T, K, P)
const CLDifficulty = ({ diff, mode = 'bars', theme, size = 'md' }) => {
  const axes = [
    { key: 't', label: 'Technisch', val: diff.t, color: theme.accent },
    { key: 'k', label: 'Körperlich', val: diff.k, color: theme.rope },
    { key: 'p', label: 'Psychisch', val: diff.p, color: theme.wet },
  ];
  if (mode === 'bars') {
    return (
      <div style={{ display: 'flex', gap: size === 'sm' ? 6 : 10, alignItems: 'center' }}>
        {axes.map(a => (
          <div key={a.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: size === 'sm' ? 14 : 20 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{
                  width: size === 'sm' ? 2.5 : 4,
                  height: 4 + n * (size === 'sm' ? 2 : 3),
                  background: n <= a.val ? a.color : theme.border,
                  borderRadius: 1,
                }} />
              ))}
            </div>
            <div style={{ fontSize: size === 'sm' ? 8 : 9, fontWeight: 600, color: theme.textMute, letterSpacing: 1 }}>
              {a.key.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (mode === 'dots') {
    return (
      <div style={{ display: 'flex', gap: 12 }}>
        {axes.map(a => (
          <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: theme.textMute, letterSpacing: 1 }}>
              {a.key.toUpperCase()}
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: n <= a.val ? a.color : 'transparent',
                  border: `1px solid ${n <= a.val ? a.color : theme.border}`,
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  // numeric
  return (
    <div style={{ display: 'flex', gap: 6, fontFamily: 'JetBrains Mono, monospace' }}>
      {axes.map(a => (
        <div key={a.key} style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          padding: '3px 7px',
          background: a.color + '22',
          color: a.color,
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 700,
        }}>
          <span style={{ opacity: 0.7 }}>{a.key.toUpperCase()}</span>
          <span>{a.val}</span>
        </div>
      ))}
    </div>
  );
};

// Generative Höhlen-Illustration (Cover für Trip-Karten)
const CLCaveArt = ({ variant = 'tunnel', seed = 1, theme, width = '100%', height = 120 }) => {
  // deterministic pseudo-random
  const rnd = (() => {
    let s = seed * 9301 + 49297;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  })();

  const renderVariant = () => {
    switch (variant) {
      case 'pit': {
        // vertical shaft with rope
        return (
          <g>
            {/* rock walls */}
            <path d={`M 0 ${height} L 30 ${height*0.1} Q 50 0 100 0`} fill="none" stroke={theme.accent} strokeOpacity={0.3} strokeWidth={1.2}/>
            <path d={`M 200 ${height} L 170 ${height*0.12} Q 150 0 100 0`} fill="none" stroke={theme.accent} strokeOpacity={0.3} strokeWidth={1.2}/>
            {/* shaft outline darker */}
            <path d={`M 0 ${height} L 30 ${height*0.1} Q 50 0 100 0 Q 150 0 170 ${height*0.12} L 200 ${height}`} fill={theme.bg} opacity={0.55}/>
            {/* rope */}
            <path d={`M 100 0 Q 102 ${height/3} 98 ${height/2} Q 102 ${height*0.7} 100 ${height}`} stroke={theme.rope} strokeWidth={1.5} fill="none" strokeLinecap="round"/>
            {/* light beam from top */}
            <path d={`M 80 0 L 95 ${height} L 105 ${height} L 120 0 Z`} fill={theme.accent} opacity={0.08}/>
            {/* caver silhouette */}
            <circle cx="100" cy={height*0.55} r="4" fill={theme.text} opacity="0.6"/>
            <path d={`M 100 ${height*0.55+4} L 100 ${height*0.65}`} stroke={theme.text} strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
          </g>
        );
      }
      case 'tunnel': {
        // horizontal passage with water
        return (
          <g>
            {/* arches receding */}
            {[0, 1, 2, 3, 4].map(i => {
              const w = 180 - i * 22;
              const h = height - 10 - i * 12;
              const cx = 100;
              return (
                <path key={i}
                  d={`M ${cx - w/2} ${height} L ${cx - w/2} ${height - h*0.35} Q ${cx} ${height - h} ${cx + w/2} ${height - h*0.35} L ${cx + w/2} ${height}`}
                  fill="none"
                  stroke={theme.accent}
                  strokeOpacity={0.2 + i * 0.08}
                  strokeWidth={1.2}/>
              );
            })}
            {/* water */}
            <rect x="0" y={height-10} width="200" height="10" fill={theme.wet} opacity="0.15"/>
            <path d={`M 0 ${height-10} Q 50 ${height-13} 100 ${height-10} T 200 ${height-10}`} stroke={theme.wet} strokeWidth="0.8" fill="none" opacity="0.5"/>
            {/* distant light */}
            <circle cx="100" cy={height-35} r="3" fill={theme.accent} opacity="0.6" className="cl-glow"/>
          </g>
        );
      }
      case 'chamber': {
        // big room with stalactites/mites
        return (
          <g>
            {/* ceiling */}
            <path d={`M 0 0 Q 50 ${height*0.2} 100 ${height*0.1} T 200 ${height*0.15} L 200 0 Z`} fill={theme.accent} opacity="0.08"/>
            {/* stalactites */}
            {Array.from({length: 7}).map((_, i) => {
              const x = 10 + i * 28 + rnd()*10;
              const h = 8 + rnd()*18;
              return <path key={`sc-${i}`} d={`M ${x-3} ${height*0.1} L ${x} ${height*0.1 + h} L ${x+3} ${height*0.1}`} fill={theme.accent} opacity="0.4"/>;
            })}
            {/* stalagmites */}
            {Array.from({length: 5}).map((_, i) => {
              const x = 20 + i * 40 + rnd()*10;
              const h = 10 + rnd()*15;
              return <path key={`sg-${i}`} d={`M ${x-4} ${height} L ${x} ${height - h} L ${x+4} ${height}`} fill={theme.accent} opacity="0.35"/>;
            })}
            {/* floor outline */}
            <path d={`M 0 ${height} Q 100 ${height-5} 200 ${height}`} stroke={theme.accent} strokeOpacity="0.3" fill="none"/>
          </g>
        );
      }
      case 'maze': {
        // isometric labyrinth grid
        return (
          <g opacity="0.6">
            {Array.from({length: 8}).map((_, i) => (
              <line key={`v${i}`} x1={i*28} y1="0" x2={i*28 + 40} y2={height} stroke={theme.accent} strokeOpacity={0.15 + (i%3)*0.1} strokeWidth="1"/>
            ))}
            {Array.from({length: 5}).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i*28 + 5} x2="200" y2={i*28 - 15} stroke={theme.accent} strokeOpacity={0.12} strokeWidth="1"/>
            ))}
            {/* scattered chambers */}
            {[[50,30],[120,50],[80,80],[150,90],[30,70]].map(([x,y], i) => (
              <rect key={i} x={x-6} y={y-4} width="12" height="8" fill={theme.accent} opacity="0.3"/>
            ))}
          </g>
        );
      }
      case 'ice': {
        // ice cave with crystals
        return (
          <g>
            <path d={`M 0 ${height} L 0 ${height*0.3} Q 40 0 100 ${height*0.15} Q 160 0 200 ${height*0.3} L 200 ${height} Z`} fill={theme.wet} opacity="0.08"/>
            {/* ice spikes */}
            {Array.from({length: 9}).map((_, i) => {
              const x = i * 24 + 8;
              const h = 10 + rnd() * 25;
              return <path key={i} d={`M ${x-3} ${height*0.2} L ${x} ${height*0.2 + h} L ${x+3} ${height*0.2} Z`} fill={theme.wet} opacity={0.3 + rnd()*0.3}/>;
            })}
            {/* glimmers */}
            {Array.from({length: 12}).map((_, i) => (
              <circle key={i} cx={rnd()*200} cy={rnd()*height} r="0.8" fill={theme.text} opacity={0.6}/>
            ))}
          </g>
        );
      }
      default: return null;
    }
  };

  return (
    <svg viewBox={`0 0 200 ${height}`} preserveAspectRatio="xMidYMid slice" width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`cl-glow-${seed}`} cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="200" height={height} fill={theme.bgCardHi}/>
      <rect width="200" height={height} fill={`url(#cl-glow-${seed})`}/>
      {renderVariant()}
    </svg>
  );
};

// Formatierungs-Helper
const CLfmt = {
  date: (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  dateShort: (iso) => {
    const d = new Date(iso);
    const months = ['JAN','FEB','MRZ','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]}`;
  },
  duration: (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h} h` : `${h}h ${m}m`;
  },
  m: (v) => v >= 1000 ? `${(v/1000).toFixed(1)} km` : `${v} m`,
  depth: (v) => `−${v} m`,
};

// Stat-Kachel
const CLStatTile = ({ icon, label, value, unit, theme, accent }) => (
  <div style={{
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <CLIcon name={icon} size={14} color={accent || theme.textMute} />
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: theme.textMute }}>
        {label}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontFamily: 'Fraunces, serif' }}>
      <div style={{ fontSize: 24, fontWeight: 600, color: theme.text, lineHeight: 1 }}>{value}</div>
      {unit && <div style={{ fontSize: 11, color: theme.textMute, fontFamily: 'Inter', fontWeight: 500 }}>{unit}</div>}
    </div>
  </div>
);

// Section Header
const CLSection = ({ title, action, theme, children }) => (
  <div style={{ padding: '18px 18px 10px' }}>
    {(title || action) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        {title && (
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: theme.textMute,
          }}>{title}</div>
        )}
        {action}
      </div>
    )}
    {children}
  </div>
);

Object.assign(window, { CLStars, CLChip, CLDifficulty, CLCaveArt, CLfmt, CLStatTile, CLSection });
