// atoms.jsx — Desktop-Bausteine
import { CLDIcon } from './icons.jsx';

export const CLDfmt = {
  date: (iso) => new Date(iso).toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'}),
  dateShort: (iso) => {
    const d=new Date(iso), m=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    return `${String(d.getDate()).padStart(2,'0')} ${m[d.getMonth()]} ${d.getFullYear()}`;
  },
  day: (iso)=> String(new Date(iso).getDate()).padStart(2,'0'),
  mon: (iso)=> ['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'][new Date(iso).getMonth()],
  duration:(min)=>{const h=Math.floor(min/60),m=min%60;return m?`${h} h ${m} min`:`${h} h`;},
  durationShort:(min)=>{const h=Math.floor(min/60),m=min%60;return m?`${h}h ${m}m`:`${h}h`;},
  // Für Kennzahlen-Kacheln: große Zahl, Einheit steht daneben — „8:45“ + „h“
  hhmm:(min)=>{const h=Math.floor(min/60),m=min%60;return m?`${h}:${String(m).padStart(2,'0')}`:`${h}`;},
  m:(v)=> v>=1000?`${(v/1000).toFixed(1)} km`:`${v} m`,
  gps:(lat,lng)=> `${Number(lat).toFixed(4)}° N · ${Number(lng).toFixed(4)}° E`,
};

// Eyebrow / Kicker
export const CLDKicker = ({ children, theme, color }) => (
  <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase',
    color: color || theme.accent }}>{children}</div>
);

// Sterne
export const CLDStars = ({ value=0, max=5, size=15, theme }) => (
  <div style={{ display:'inline-flex', gap:3 }}>
    {Array.from({length:max}).map((_,i)=>(
      <CLDIcon key={i} name={i<value?'star-filled':'star'} size={size}
        color={i<value?theme.star:theme.lineHi} strokeWidth={1.4}/>
    ))}
  </div>
);

// Chip
export const CLDChip = ({ icon, label, theme, tone='neutral' }) => {
  const map = {
    neutral:{c:theme.textMute, b:theme.line, bg:'transparent'},
    accent:{c:theme.accent, b:theme.accent+'40', bg:theme.accentSoft},
    cool:{c:theme.cool, b:theme.cool+'40', bg:theme.coolSoft},
    rope:{c:theme.rope, b:theme.rope+'40', bg:theme.rope+'1a'},
  };
  const s = map[tone]||map.neutral;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 11px',
      borderRadius:999, fontSize:12, fontWeight:600, letterSpacing:0.2,
      color:s.c, background:s.bg, border:`1px solid ${s.b}` }}>
      {icon && <CLDIcon name={icon} size={13} color={s.c} strokeWidth={1.9}/>}
      {label}
    </span>
  );
};

// Difficulty — 3 Achsen (T/K/P)
export const CLDDifficulty = ({ diff, theme, mode='bars', size='md' }) => {
  const axes = [
    { key:'t', label:'Technisch', val:diff.t, color:theme.accent },
    { key:'k', label:'Körperlich', val:diff.k, color:theme.rope },
    { key:'p', label:'Psychisch', val:diff.p, color:theme.cool },
  ];
  const big = size==='lg';
  if (mode==='dots') {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:big?12:9 }}>
        {axes.map(a=>(
          <div key={a.key} style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ width:74, fontSize:11, fontWeight:600, color:theme.textMute, letterSpacing:0.3 }}>{a.label}</span>
            <div style={{ display:'flex', gap:5 }}>
              {[1,2,3,4,5].map(n=>(
                <div key={n} style={{ width:big?11:9, height:big?11:9, borderRadius:'50%',
                  background:n<=a.val?a.color:'transparent', border:`1.5px solid ${n<=a.val?a.color:theme.lineHi}` }}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (mode==='numeric') {
    return (
      <div style={{ display:'flex', gap:8 }}>
        {axes.map(a=>(
          <div key={a.key} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{ fontFamily:'Fraunces, serif', fontSize:big?30:24, fontWeight:600, color:a.color, lineHeight:1 }}>{a.val}</div>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:theme.textMute }}>{a.key.toUpperCase()}</div>
          </div>
        ))}
      </div>
    );
  }
  // bars
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:big?14:10 }}>
      {axes.map(a=>(
        <div key={a.key} style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ width:74, fontSize:11, fontWeight:600, color:theme.textMute }}>{a.label}</span>
          <div style={{ flex:1, display:'flex', gap:4 }}>
            {[1,2,3,4,5].map(n=>(
              <div key={n} style={{ flex:1, height:big?8:6, borderRadius:3,
                background:n<=a.val?a.color:theme.line }}/>
            ))}
          </div>
          <span style={{ width:16, textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontSize:12, color:a.color, fontWeight:600 }}>{a.val}</span>
        </div>
      ))}
    </div>
  );
};

// Daten-Metrik (gross)
export const CLDMetric = ({ icon, label, value, unit, prefix, theme, accent }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
      {icon && <CLDIcon name={icon} size={14} color={accent||theme.textDim}/>}
      <span style={{ fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:theme.textMute }}>{label}</span>
    </div>
    <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
      <span style={{ fontFamily:'Fraunces, serif', fontSize:30, fontWeight:600, color:theme.text, lineHeight:0.95, letterSpacing:-0.5 }}>{prefix}{value}</span>
      {unit && <span style={{ fontSize:13, color:theme.textMute, fontWeight:500 }}>{unit}</span>}
    </div>
  </div>
);
