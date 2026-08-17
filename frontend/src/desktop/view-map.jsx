// view-map.jsx — Karte (volle Fläche): echte Leaflet + Mapy.cz-Tiles als Untergrund,
// die gestalteten Glas-Panels (Suche, Höhlenliste, Detailkarte) als Overlays darüber.
import { useState, useMemo } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDPhoto } from './photos.jsx';
import { tripCover } from './adapt.js';
import CLMapyMap from '../components/MapyMap.jsx';

const CLDMap = ({ caves, trips, theme, onOpenCave }) => {
  const [sel, setSel] = useState(caves[0]?.id || null);
  const [q, setQ] = useState('');

  // Theme-Shim für die (Mobile-)MapyMap-Komponente
  const mapTheme = { ...theme, bgCard: theme.card, bgElev: theme.bg2 };

  const geoCaves = caves.filter(c => c.lat != null && c.lng != null);
  const pins = geoCaves.map(c => ({
    id: c.id, lat: Number(c.lat), lng: Number(c.lng),
    label: String(trips.filter(t=>(t.caveId||t.cave_id)===c.id).length),
  }));

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return caves;
    return caves.filter(c => `${c.name} ${c.region} ${c.country}`.toLowerCase().includes(s));
  }, [q, caves]);

  const selCave = caves.find(c=>c.id===sel);
  const selTrips = trips.filter(t=>(t.caveId||t.cave_id)===sel);

  // Mittelpunkt: Durchschnitt der Höhlen-Koordinaten (Fallback Alpen)
  const center = geoCaves.length
    ? [geoCaves.reduce((s,c)=>s+Number(c.lat),0)/geoCaves.length, geoCaves.reduce((s,c)=>s+Number(c.lng),0)/geoCaves.length]
    : [47.5, 11.5];

  return (
    <div style={{ position:'relative', height:'100%', minHeight:600, overflow:'hidden', background:theme.bg2 }}>
      {/* Echte Karte als Untergrund */}
      <div style={{ position:'absolute', inset:0 }}>
        <CLMapyMap center={center} zoom={6} pins={pins} theme={mapTheme} height="100%"
          onPinClick={(p)=>setSel(p.id)} />
      </div>

      {/* Suchleiste */}
      <div style={{ position:'absolute', top:24, left:24, right:24, display:'flex', justifyContent:'space-between', gap:16, zIndex:500, pointerEvents:'none' }}>
        <div style={{ width:380, display:'flex', alignItems:'center', gap:11, padding:'13px 16px', borderRadius:13,
          background:`${theme.panel}e0`, backdropFilter:'blur(14px)', border:`1px solid ${theme.lineHi}`, pointerEvents:'auto' }}>
          <CLDIcon name="search" size={17} color={theme.textMute}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Höhle, Region oder Koordinaten…" style={{ flex:1, appearance:'none', background:'transparent', border:'none', color:theme.text, fontSize:13.5, outline:'none', fontFamily:'inherit' }}/>
          <CLDIcon name="filter" size={16} color={theme.accent}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:11,
          background:`${theme.panel}d0`, backdropFilter:'blur(14px)', border:`1px solid ${theme.line}`, pointerEvents:'auto' }}>
          <CLDIcon name="layers" size={15} color={theme.textMute}/>
          <span style={{ fontSize:12, color:theme.textMute, fontFamily:'JetBrains Mono, monospace' }}>Mapy.cz · Outdoor</span>
        </div>
      </div>

      {/* Höhlenliste links */}
      <div style={{ position:'absolute', left:24, top:88, bottom:24, width:300, zIndex:500,
        background:`${theme.panel}e0`, backdropFilter:'blur(14px)', border:`1px solid ${theme.line}`, borderRadius:16,
        padding:16, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:theme.textMute, padding:'2px 4px 12px' }}>{filtered.length} Höhlen im Kataster</div>
        <div className="cld-strip" style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
          {filtered.map(c=>{
            const active = sel===c.id;
            return (
              <button key={c.id} onClick={()=>setSel(c.id)} style={{
                appearance:'none', border:'none', cursor:'pointer', textAlign:'left',
                padding:'11px 12px', borderRadius:11, background:active?theme.accentSoft:'transparent', fontFamily:'inherit',
                display:'flex', alignItems:'center', gap:11 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:active?theme.accent:theme.lineHi, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:600, color:active?theme.accent:theme.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize:11, color:theme.textDim }}>{c.region} · {c.country}</div>
                </div>
                <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:theme.textMute }}>−{c.depth||0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail-Karte rechts unten */}
      {selCave && (
        <div style={{ position:'absolute', right:24, bottom:24, width:360, zIndex:500,
          background:`${theme.panel}f2`, backdropFilter:'blur(16px)', border:`1px solid ${theme.lineHi}`, borderRadius:18,
          overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ height:128, position:'relative' }}>
            <CLDPhoto photo={tripCover(selTrips[0])} theme={theme} grade={false} w={600}/>
            <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg, transparent 30%, ${theme.panel})` }}/>
          </div>
          <div style={{ padding:'4px 20px 20px', marginTop:-30, position:'relative' }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.4, textTransform:'uppercase', color:theme.accent, marginBottom:5 }}>{selCave.country} · {selCave.region}</div>
            <div style={{ fontFamily:'Fraunces, serif', fontSize:23, fontWeight:600, color:theme.text, lineHeight:1.1, letterSpacing:-0.3 }}>{selCave.name}</div>
            <div style={{ display:'flex', gap:20, marginTop:16, fontFamily:'JetBrains Mono, monospace', fontSize:12, color:theme.textMute }}>
              <span><b style={{ color:theme.text, fontSize:15, fontFamily:'Fraunces, serif' }}>−{selCave.depth||0}</b> m</span>
              <span><b style={{ color:theme.text, fontSize:15, fontFamily:'Fraunces, serif' }}>{(selCave.length||0)>=1000?((selCave.length||0)/1000).toFixed(1)+' km':(selCave.length||0)+' m'}</b></span>
              <span><b style={{ color:theme.text, fontSize:15, fontFamily:'Fraunces, serif' }}>{selTrips.length}</b> Bef.</span>
            </div>
            <button onClick={()=>onOpenCave(selCave.id)} disabled={selTrips.length===0} style={{
              marginTop:16, width:'100%', appearance:'none', border:'none', cursor: selTrips.length?'pointer':'default',
              padding:'12px', borderRadius:11, background: selTrips.length?theme.accent:theme.cardHi,
              color: selTrips.length?theme.bg:theme.textDim, fontWeight:700, fontSize:13, fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {selTrips.length?<>Befahrungen ansehen <CLDIcon name="arrow-right" size={15} color={theme.bg}/></>:'Noch keine Befahrung'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CLDMap;
