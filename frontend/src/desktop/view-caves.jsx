// view-caves.jsx — Höhlen-Verzeichnis (Raster mit Tiefenvisualisierung)
import { useState } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDKicker } from './atoms.jsx';
import { CLDPhoto } from './photos.jsx';
import { caveCover, tripCover } from './adapt.js';

const CLDCaves = ({ caves, trips, theme, onOpenCave }) => {
  const [sort, setSort] = useState('entries');
  const sorted = [...caves].sort((a,b)=>{
    if (sort==='entries') return (b.entries||0)-(a.entries||0);
    if (sort==='depth') return (b.depth||0)-(a.depth||0);
    if (sort==='length') return (b.length||0)-(a.length||0);
    return a.name.localeCompare(b.name);
  });
  const maxDepth = Math.max(1, ...caves.map(c=>c.depth||0));

  return (
    <div style={{ padding:'40px 56px 72px' }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:30 }}>
        <div>
          <CLDKicker theme={theme}>Verzeichnis</CLDKicker>
          <h1 style={{ margin:'10px 0 0', fontFamily:'Fraunces, serif', fontSize:42, fontWeight:600, color:theme.text, letterSpacing:-0.8 }}>
            Höhlen, in denen ich <span style={{ fontStyle:'italic', color:theme.accent }}>war</span>.
          </h1>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[{k:'entries',l:'Besuche'},{k:'depth',l:'Tiefe'},{k:'length',l:'Länge'},{k:'name',l:'A–Z'}].map(s=>(
            <button key={s.k} onClick={()=>setSort(s.k)} style={{
              appearance:'none', cursor:'pointer', fontFamily:'inherit',
              padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:600,
              background: sort===s.k?theme.accent:'transparent', color: sort===s.k?theme.bg:theme.textMute,
              border:`1px solid ${sort===s.k?theme.accent:theme.line}` }}>{s.l}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(420px, 1fr))', gap:18 }}>
        {sorted.map(c=>{
          const ct = trips.filter(t=>(t.caveId||t.cave_id)===c.id);
          const discovered = c.discovered ?? c.discovered_year;
          // Titelbild der Höhle, sonst Cover der jüngsten Befahrung als Vorschau
          const latest = [...ct].sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
          const cover = caveCover(c) || tripCover(latest);
          return (
            <div key={c.id} onClick={()=> ct.length && onOpenCave(c.id)} style={{
              display:'flex', gap:18, alignItems:'center', cursor: ct.length?'pointer':'default',
              background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, padding:16 }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=theme.lineHi}
              onMouseLeave={e=>e.currentTarget.style.borderColor=theme.line}>
              {/* Titelbild — oder Tiefen-Visual als Fallback */}
              <div style={{ width:84, height:104, borderRadius:12, overflow:'hidden', flexShrink:0, position:'relative',
                background:theme.bg2, border:`1px solid ${theme.line}` }}>
                {cover ? (
                  <>
                    <CLDPhoto photo={cover} theme={theme} grade={false} w={300}/>
                    <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg, transparent 45%, ${theme.bg}e0)` }}/>
                    <div style={{ position:'absolute', left:0, right:0, bottom:7, textAlign:'center',
                      fontFamily:'JetBrains Mono, monospace', fontSize:11, fontWeight:700, color:'#fff' }}>−{c.depth||0} m</div>
                  </>
                ) : (
                  <>
                    <div style={{ position:'absolute', left:0, right:0, bottom:0, height:`${Math.min(100, (c.depth||0)/maxDepth*100)}%`,
                      background:`linear-gradient(180deg, ${theme.accent}55, ${theme.accent}10)` }}/>
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', paddingBottom:9 }}>
                      <CLDIcon name="depth" size={16} color={theme.accent} style={{ marginBottom:6, opacity:0.5 }}/>
                      <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, fontWeight:700, color:theme.accent }}>−{c.depth||0} m</div>
                    </div>
                  </>
                )}
              </div>
              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
                  <span style={{ fontSize:9.5, fontWeight:700, color:theme.accent, letterSpacing:0.6 }}>{c.country}</span>
                  <span style={{ fontSize:11, color:theme.textDim }}>·</span>
                  <span style={{ fontSize:11.5, color:theme.textMute }}>{c.region}</span>
                </div>
                <div style={{ fontFamily:'Fraunces, serif', fontSize:21, fontWeight:600, color:theme.text, lineHeight:1.12, letterSpacing:-0.3, marginBottom:10 }}>{c.name}</div>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontFamily:'JetBrains Mono, monospace', fontSize:11.5, color:theme.textMute }}>
                  <span>{(c.length||0)>=1000?((c.length||0)/1000).toFixed(1)+' km':(c.length||0)+' m'}</span>
                  <span style={{ color:theme.accent }}>{c.entries||0}× besucht</span>
                  {c.type && <span>{c.type}</span>}
                  {discovered && <span>seit {discovered}</span>}
                </div>
              </div>
              {ct.length>0 && <CLDIcon name="chevron-right" size={18} color={theme.textDim}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CLDCaves;
