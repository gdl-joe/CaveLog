// atoms.jsx — Ruhige, neutrale Bausteine für CaveLog v2

const { useState, useEffect, useRef, useMemo } = React;

// Sterne — Ocker (warmer Sekundärakzent), gibt Bewertungen subtilen Glow
const CLStars = ({ value = 0, max = 5, size = 13, theme }) => (
  <div style={{ display: 'inline-flex', gap: 2 }}>
    {Array.from({ length: max }).map((_, i) => (
      <CLIcon
        key={i}
        name={i < value ? 'star-filled' : 'star'}
        size={size}
        color={i < value ? theme.ochre : theme.borderHi}
        strokeWidth={1.4}
      />
    ))}
  </div>
);

// Chip — getönter Hintergrund + Punkt in Tonfarbe
const CLChip = ({ icon, label, theme, tone = 'neutral' }) => {
  // tone: neutral | wet | rope | danger | success | warm
  const toneColor = {
    neutral: theme.accent,
    wet: theme.wet,
    rope: theme.rope,
    danger: theme.danger,
    success: theme.success,
    warm: theme.warm,
  }[tone] || theme.accent;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px',
      background: toneColor + '14',
      color: theme.text,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: 0.1,
      border: `1px solid ${toneColor}33`,
    }}>
      {icon && (
        <span style={{
          display: 'inline-block',
          width: 6, height: 6, borderRadius: '50%',
          background: toneColor,
        }}/>
      )}
      <span>{label}</span>
    </div>
  );
};

// Difficulty — Standard mit drei Tonfarben (grün/terracotta/blau), tweakable
const CLDifficulty = ({ diff, mode = 'bars', theme, size = 'md', colored = false }) => {
  // T = Technik (Grün/Primär), K = Kletterei (Terracotta/Warm), P = Passagen/Wasser (Blau)
  const tColor = colored ? theme.accent : theme.accent;
  const kColor = colored ? theme.warm : theme.warm;
  const pColor = colored ? theme.wet : theme.wet;
  const axes = [
    { key: 't', label: 'T', val: diff.t, color: tColor },
    { key: 'k', label: 'K', val: diff.k, color: kColor },
    { key: 'p', label: 'P', val: diff.p, color: pColor },
  ];
  if (mode === 'bars') {
    return (
      <div style={{ display: 'flex', gap: size === 'sm' ? 8 : 12, alignItems: 'center' }}>
        {axes.map(a => (
          <div key={a.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: size === 'sm' ? 12 : 18 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{
                  width: size === 'sm' ? 2.5 : 3.5,
                  height: 3 + n * (size === 'sm' ? 1.8 : 2.8),
                  background: n <= a.val ? a.color : theme.border,
                  borderRadius: 0.5,
                }} />
              ))}
            </div>
            <div style={{ fontSize: 8, fontWeight: 600, color: theme.textMute, letterSpacing: 0.6 }}>
              {a.label}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (mode === 'dots') {
    return (
      <div style={{ display: 'flex', gap: 10 }}>
        {axes.map(a => (
          <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: theme.textMute }}>{a.label}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{
                  width: 5, height: 5, borderRadius: '50%',
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
    <div style={{ display: 'flex', gap: 4, fontFamily: 'JetBrains Mono, monospace' }}>
      {axes.map(a => (
        <div key={a.key} style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          padding: '2px 6px',
          border: `1px solid ${theme.border}`,
          color: theme.text,
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 600,
        }}>
          <span style={{ color: theme.textMute }}>{a.label}</span>
          <span>{a.val}</span>
        </div>
      ))}
    </div>
  );
};

// Foto-Platzhalter — warmer Erdton-Verlauf statt grauer Fläche
const CLPhoto = ({ theme, label = 'foto', width = '100%', height = 56, radius = 8, count = null }) => (
  <div style={{
    width, height,
    background: `linear-gradient(135deg, ${theme.warmSoft} 0%, ${theme.bgSubtle} 100%)`,
    borderRadius: radius,
    border: `1px solid ${theme.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9,
    color: theme.warmDim,
    letterSpacing: 0.5,
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  }}>
    <span>{label}{count !== null ? ` · ${count}` : ''}</span>
  </div>
);

// Formatierungs-Helper
const CLfmt = {
  date: (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  dateShort: (iso) => {
    const d = new Date(iso);
    const months = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    return `${String(d.getDate()).padStart(2,'0')}. ${months[d.getMonth()]}`;
  },
  duration: (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h} h` : `${h}h ${m}m`;
  },
  m: (v) => v >= 1000 ? `${(v/1000).toFixed(1)} km` : `${v} m`,
  depth: (v) => `−${v} m`,
};

// Stat-Kachel — flach, neutral
const CLStatTile = ({ icon, label, value, unit, theme, accent = 'primary' }) => {
  const accentColor = accent === 'warm' ? theme.warm : accent === 'ochre' ? theme.ochre : theme.accent;
  return (
    <div style={{
      background: theme.bgCard,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
      padding: '14px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      borderTop: `2px solid ${accentColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <CLIcon name={icon} size={13} color={accentColor} strokeWidth={1.6}/>}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.textMute }}>
          {label}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: theme.text, lineHeight: 1, letterSpacing: -0.4 }}>{value}</div>
        {unit && <div style={{ fontSize: 11, color: theme.textMute, fontWeight: 500 }}>{unit}</div>}
      </div>
    </div>
  );
};

// Section-Header — Inter Smallcaps, ruhig
const CLSection = ({ title, action, theme, children, padTop = 26 }) => (
  <div style={{ padding: `${padTop}px 20px 10px` }}>
    {(title || action) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {title && (
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
            textTransform: 'uppercase', color: theme.textMute,
          }}>{title}</div>
        )}
        {action}
      </div>
    )}
    {children}
  </div>
);

// Listenzeile (für Profil-Optionen, Höhlen-Liste, etc.)
const CLRow = ({ label, value, hint, onClick, theme, danger = false, last = false }) => (
  <div onClick={onClick} style={{
    padding: '16px 18px',
    borderBottom: last ? 'none' : `1px solid ${theme.border}`,
    cursor: onClick ? 'pointer' : 'default',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 10,
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <div style={{ fontSize: 14, color: danger ? theme.danger : theme.text, fontWeight: 500 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: theme.textMute }}>{hint}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.textMute, fontSize: 13 }}>
      {value && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{value}</span>}
      {onClick && <CLIcon name="chevron-right" size={14} color={theme.textDim}/>}
    </div>
  </div>
);

Object.assign(window, { CLStars, CLChip, CLDifficulty, CLPhoto, CLfmt, CLStatTile, CLSection, CLRow });
