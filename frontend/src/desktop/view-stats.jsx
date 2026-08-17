// view-stats.jsx — Statistik-Dashboard (volle Breite, mehrspaltig)
// Aggregate clientseitig aus den geladenen trips/caves. Monate dynamisch
// (letzte 6), Meilensteine aus echten Daten abgeleitet.
import { CLDIcon } from './icons.jsx';
import { CLDfmt, CLDKicker } from './atoms.jsx';

const MON = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

const CLDStats = ({ trips, caves, theme, user }) => {
  // Letzte 6 Monate dynamisch bis heute
  const now = new Date();
  const months = [];
  for (let i=5; i>=0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    months.push({ k:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, l:MON[d.getMonth()] });
  }
  const monthH = months.map(m=>{
    const mins = trips.filter(t=>t.date && t.date.startsWith(m.k)).reduce((s,t)=>s+(t.duration||0),0);
    return { ...m, h: Math.round(mins/60*10)/10 };
  });
  const maxH = Math.max(...monthH.map(m=>m.h), 1);

  // Typverteilung
  const typeColors = { Vertikal:theme.accent, Horizontal:theme.rope, Labyrinth:theme.cool, Mixed:theme.success };
  const typeDist = {};
  trips.forEach(t=>{ if(t.type) typeDist[t.type]=(typeDist[t.type]||0)+1; });
  const typeTotal = trips.length || 1;
  let acc = 0;
  const typeArcs = Object.entries(typeDist).map(([t,n])=>{
    const frac = n/typeTotal; const seg = { t, n, frac, start: acc }; acc += frac; return seg;
  });

  // Tiefenprofil (chronologisch alt→neu)
  const chron = [...trips].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  const maxDepth = Math.max(1, ...trips.map(t=>t.depth||0));

  // Top-Höhlen
  const topCaves = [...caves].sort((a,b)=>(b.entries||0)-(a.entries||0)).slice(0,5);
  const maxEntries = Math.max(1, ...caves.map(c=>c.entries||0));

  // Meilensteine aus echten Daten
  const deepest = [...trips].sort((a,b)=>(b.depth||0)-(a.depth||0))[0];
  const deepestCave = deepest ? (caves.find(c=>c.id===(deepest.caveId||deepest.cave_id))?.name || deepest.cave_name || '') : '';
  const countries = [...new Set(caves.filter(c=>trips.some(t=>(t.caveId||t.cave_id)===c.id)).map(c=>c.country).filter(Boolean))];
  const milestones = [
    deepest ? { i:'depth', l:`Tiefster Punkt −${deepest.depth} m`, s:`${deepestCave} · ${CLDfmt.dateShort(deepest.date)}`, c:theme.accent } : null,
    { i:'flame', l:`${user.totalHours} Stunden unter Tage`, s:`über ${user.trips} Befahrungen`, c:theme.rope },
    { i:'caves', l:`${user.caves} Höhlen in ${countries.length} ${countries.length===1?'Land':'Ländern'}`, s:countries.join(' · ')||'—', c:theme.cool },
  ].filter(Boolean);

  return (
    <div style={{ padding:'40px 56px 72px' }}>
      <CLDKicker theme={theme}>Übersicht</CLDKicker>
      <h1 style={{ margin:'10px 0 0', fontFamily:'Fraunces, serif', fontSize:42, fontWeight:600, color:theme.text, letterSpacing:-0.8 }}>
        Seit <span style={{ fontStyle:'italic', color:theme.accent }}>{user.since}</span> unter Tage.
      </h1>

      {/* KPI-Reihe */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16, marginTop:30 }}>
        {[
          { i:'caves', l:'Befahrungen', v:user.trips, u:'Touren', c:theme.accent },
          { i:'depth', l:'Tiefster Punkt', v:`−${user.maxDepth}`, u:'m', c:theme.accent },
          { i:'length', l:'Strecke gesamt', v:(user.totalLength/1000).toFixed(1), u:'km', c:theme.rope },
          { i:'clock', l:'Stunden', v:user.totalHours, u:'h', c:theme.cool },
          { i:'camera', l:'Fotos', v:user.totalPhotos, u:'Aufn.', c:theme.success },
        ].map((k,i)=>(
          <div key={i} style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, padding:'20px 22px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-14, right:-10, opacity:0.07 }}><CLDIcon name={k.i} size={80} color={k.c}/></div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <CLDIcon name={k.i} size={15} color={k.c}/>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:1.4, textTransform:'uppercase', color:theme.textMute }}>{k.l}</span>
            </div>
            <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
              <span style={{ fontFamily:'Fraunces, serif', fontSize:38, fontWeight:600, color:theme.text, lineHeight:0.9, letterSpacing:-1 }}>{k.v}</span>
              <span style={{ fontSize:13, color:theme.textMute }}>{k.u}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Spalten: Monatschart + Typdonut */}
      <div style={{ display:'grid', gridTemplateColumns:'1.7fr 1fr', gap:20, marginTop:20 }}>
        {/* Monate */}
        <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:18, padding:'22px 24px' }}>
          <PanelHead theme={theme} title="Aktivität · letzte 6 Monate" sub="Stunden unter Tage"/>
          <div style={{ display:'flex', gap:14, alignItems:'flex-end', height:200, marginTop:24 }}>
            {monthH.map(m=>(
              <div key={m.k} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8, height:'100%', justifyContent:'flex-end' }}>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, fontWeight:600, color:m.h>0?theme.accent:theme.textDim }}>{m.h>0?m.h:'·'}</div>
                <div style={{ width:'100%', maxWidth:54, height:m.h>0?`${Math.round(m.h/maxH*100)}%`:3, minHeight:3,
                  background:m.h>0?`linear-gradient(180deg, ${theme.accent}, ${theme.accentDeep})`:theme.line,
                  borderRadius:'5px 5px 0 0' }}/>
                <div style={{ fontSize:11, color:theme.textMute, fontWeight:600 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:18, padding:'22px 24px' }}>
          <PanelHead theme={theme} title="Höhlentypen" sub={`${trips.length} Befahrungen`}/>
          <div style={{ display:'flex', alignItems:'center', gap:24, marginTop:18 }}>
            <svg width="118" height="118" viewBox="0 0 42 42" style={{ flexShrink:0, transform:'rotate(-90deg)' }}>
              <circle cx="21" cy="21" r="15.9" fill="none" stroke={theme.bg2} strokeWidth="5"/>
              {typeArcs.map((a,i)=>(
                <circle key={i} cx="21" cy="21" r="15.9" fill="none"
                  stroke={typeColors[a.t]||theme.accent} strokeWidth="5"
                  strokeDasharray={`${a.frac*100} ${100-a.frac*100}`}
                  strokeDashoffset={`${-a.start*100}`}/>
              ))}
            </svg>
            <div style={{ display:'flex', flexDirection:'column', gap:9, flex:1 }}>
              {typeArcs.map((a,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:typeColors[a.t]||theme.accent, flexShrink:0 }}/>
                  <span style={{ flex:1, fontSize:13, color:theme.text }}>{a.t}</span>
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:theme.textMute }}>{Math.round(a.frac*100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tiefenprofil */}
      <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:18, padding:'22px 24px', marginTop:20 }}>
        <PanelHead theme={theme} title="Tiefenprofil · chronologisch" sub={`Tiefster Punkt: −${maxDepth} m`}/>
        <div style={{ display:'flex', gap:18, alignItems:'flex-start', height:220, marginTop:20, paddingLeft:8, overflowX:'auto' }}>
          {chron.map(t=>{
            const cave = caves.find(c=>c.id===(t.caveId||t.cave_id));
            const cn = (cave?.name || t.cave_name || '·');
            return (
              <div key={t.id} style={{ flex:'1 0 60px', display:'flex', flexDirection:'column', alignItems:'center', height:'100%' }}>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:theme.accent, fontWeight:600, marginBottom:5 }}>−{t.depth}</div>
                <div style={{ width:'100%', maxWidth:60, height:`${Math.round((t.depth||0)/maxDepth*82)}%`, minHeight:6,
                  background:`linear-gradient(180deg, ${theme.accent}, ${theme.accent}22)`, borderRadius:'5px 5px 0 0' }}/>
                <div style={{ marginTop:8, fontSize:10.5, color:theme.textMute, textAlign:'center', lineHeight:1.3 }}>
                  <div style={{ fontWeight:600, color:theme.text }}>{CLDfmt.day(t.date)} {CLDfmt.mon(t.date)}</div>
                  <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:90 }}>{cn.split(' ')[0]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top-Höhlen + Meilensteine */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20 }}>
        <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:18, padding:'22px 24px' }}>
          <PanelHead theme={theme} title="Meistbesuchte Höhlen" sub=""/>
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:18 }}>
            {topCaves.map((c,i)=>(
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontFamily:'Fraunces, serif', fontSize:18, fontWeight:600, color:theme.textDim, width:20 }}>{i+1}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13.5, color:theme.text, fontWeight:500 }}>{c.name}</span>
                    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:theme.textMute }}>{c.entries||0}×</span>
                  </div>
                  <div style={{ height:5, borderRadius:3, background:theme.bg2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${(c.entries||0)/maxEntries*100}%`, background:theme.accent, borderRadius:3 }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:18, padding:'22px 24px' }}>
          <PanelHead theme={theme} title="Meilensteine" sub=""/>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:18 }}>
            {milestones.map((a,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:13, padding:'12px 14px', background:theme.bg2, borderRadius:12 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:a.c+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <CLDIcon name={a.i} size={19} color={a.c}/>
                </div>
                <div>
                  <div style={{ fontSize:14, color:theme.text, fontWeight:600 }}>{a.l}</div>
                  <div style={{ fontSize:11.5, color:theme.textMute, marginTop:2 }}>{a.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PanelHead = ({ theme, title, sub }) => (
  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
    <span style={{ fontSize:11, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:theme.textMute }}>{title}</span>
    {sub && <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:theme.textDim }}>{sub}</span>}
  </div>
);

export default CLDStats;
