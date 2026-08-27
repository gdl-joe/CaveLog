// view-cave.jsx — Höhlen-Detailseite: Stammdaten + alle Befahrungen + Galerie-Wand
// `album` = aggregierte, bereits adaptierte Fotos aller Befahrungen dieser Höhle
// (von der Shell via getPhotos geladen). Jedes Foto trägt date/tripId/caption.
import { useState, useRef } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDfmt, CLDKicker, CLDStars, CLDChip, CLDMetric } from './atoms.jsx';
import { CLDPhoto } from './photos.jsx';
import { tripCover, caveCover } from './adapt.js';
import { btnPrimary, btnGhost } from './ui.js';
import { api } from '../api.js';
import CLDPlans from './view-plans.jsx';
import { EU_COUNTRIES } from './countries.js';
import CLMapyMap from '../components/MapyMap.jsx';
import { safeUrl } from '../safe-url.js';
import RichText, { FORMAT_HINWEIS } from '../components/RichText.jsx';

const CLDCave = ({ cave, trips, album=[], theme, isAdmin=true, onBack, onOpenTrip, onCinemaAlbum, onNew, onCoverChanged }) => {
  const [editing, setEditing] = useState(false);
  const visits = trips.filter(t=>(t.caveId||t.cave_id)===cave.id).sort((a,b)=>(b.date||'').localeCompare(a.date||''));

  const totalH = Math.round(visits.reduce((s,t)=>s+(t.duration||0),0)/60);
  const maxDepth = visits.length ? Math.max(...visits.map(t=>t.depth||0)) : 0;
  const photoCount = visits.reduce((s,t)=>s+(typeof t.photos==='number'?t.photos:0),0);
  const dates = visits.map(t=>t.date).sort();
  // Titelbild: vom Admin gewählt/hochgeladen, sonst erstes Foto als Fallback
  const cover = caveCover(cave);
  const heroPhoto = cover || album[0] || tripCover(visits[0]) || null;

  // Titelbild-Verwaltung (nur Admin)
  const coverRef = useRef(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const setCoverFromPhoto = async (p) => {
    setCoverBusy(true);
    try { await api.updateCave(cave.id, { cover_path: p.url, cover_thumb: p.thumb || p.url }); if (onCoverChanged) await onCoverChanged(); }
    finally { setCoverBusy(false); }
  };
  const onCoverFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCoverBusy(true);
    try { await api.uploadCaveCover(cave.id, file); if (onCoverChanged) await onCoverChanged(); }
    finally { setCoverBusy(false); }
  };
  const discovered = cave.discovered ?? cave.discovered_year;
  const hasGps = cave.lat != null && cave.lng != null;

  // Mini-Topo mit Eingangs-Pin (stilisierte Karte — bewusst kein Mapy, nur Haupt-Karte)
  const bbox = { latMin:46.2, latMax:52.2, lngMin:7.8, lngMax:14.4 };
  const pin = hasGps ? {
    x:((cave.lng-bbox.lngMin)/(bbox.lngMax-bbox.lngMin))*100,
    y:((bbox.latMax-cave.lat)/(bbox.latMax-bbox.latMin))*100,
  } : null;

  return (
    <div>
      {/* Hero */}
      <div style={{ position:'relative', height:'48vh', minHeight:400, overflow:'hidden' }}>
        <CLDPhoto photo={heroPhoto} theme={theme} grade={false} eager w={2200}/>
        <div style={{ position:'absolute', inset:0, background:theme.heroGrade }}/>
        <button onClick={onBack} style={{ position:'absolute', top:24, left:24, appearance:'none', cursor:'pointer',
          padding:'10px 16px 10px 12px', borderRadius:11, background:`${theme.bg}9c`, backdropFilter:'blur(10px)',
          border:`1px solid ${theme.lineHi}`, display:'flex', alignItems:'center', gap:8, color:theme.text, fontFamily:'inherit', fontSize:13.5, fontWeight:600 }}>
          <CLDIcon name="arrow-left" size={17} color={theme.text}/> Verzeichnis
        </button>
        {isAdmin && (
          <div style={{ position:'absolute', top:24, right:24, display:'flex', gap:10 }}>
            <input ref={coverRef} type="file" accept="image/*" onChange={onCoverFile} style={{ display:'none' }}/>
            <button onClick={()=>coverRef.current && coverRef.current.click()} disabled={coverBusy} style={{ ...btnGhost(theme), padding:'10px 16px', fontSize:13, opacity: coverBusy?0.6:1 }}>
              <CLDIcon name="camera" size={15} color={theme.text}/> {coverBusy ? 'Lädt…' : 'Titelbild'}
            </button>
            <button onClick={()=>setEditing(true)} style={{ ...btnGhost(theme), padding:'10px 16px', fontSize:13 }}>
              <CLDIcon name="edit" size={15} color={theme.text}/> Bearbeiten
            </button>
            <button onClick={onNew} style={{ ...btnGhost(theme), padding:'10px 16px', fontSize:13 }}>
              <CLDIcon name="plus" size={15} color={theme.text} strokeWidth={2}/> Befahrung hier
            </button>
          </div>
        )}
        <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 56px 40px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <CLDIcon name="pin" size={15} color={theme.accent}/>
            <span style={{ fontSize:13, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:theme.accent }}>{[cave.country, cave.region].filter(Boolean).join(' · ')}</span>
          </div>
          <h1 style={{ margin:0, fontFamily:'Fraunces, serif', fontSize:'clamp(36px,4.4vw,64px)', fontWeight:600,
            lineHeight:1.0, letterSpacing:-1.2, color:theme.text, maxWidth:900 }}>{cave.name}</h1>
          <div style={{ display:'flex', gap:8, marginTop:18, flexWrap:'wrap' }}>
            {cave.type && <CLDChip icon="caves" label={cave.type} theme={theme}/>}
            <CLDChip icon="depth" label={`Gesamttiefe −${cave.depth||0} m`} theme={theme} tone="accent"/>
            <CLDChip icon="length" label={`Ganglänge ${(cave.length||0)>=1000?((cave.length||0)/1000).toFixed(1)+' km':(cave.length||0)+' m'}`} theme={theme}/>
            {discovered && <CLDChip label={`Erstbefahrung ${discovered}`} theme={theme}/>}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'flex-start', gap:44, padding:'40px 56px 72px' }}>
        {/* Linke Rail: Bilanz + Karte */}
        <aside style={{ width:320, flexShrink:0, position:'sticky', top:24, display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, padding:'18px 20px' }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:theme.textMute, marginBottom:18 }}>Meine Bilanz hier</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'22px 14px' }}>
              <CLDMetric icon="caves" label="Befahrungen" value={visits.length} theme={theme} accent={theme.accent}/>
              <CLDMetric icon="depth" label="Tiefste" prefix="−" value={maxDepth} unit="m" theme={theme} accent={theme.accent}/>
              <CLDMetric icon="clock" label="Stunden" value={totalH} unit="h" theme={theme} accent={theme.accent}/>
              <CLDMetric icon="camera" label="Fotos" value={photoCount} theme={theme} accent={theme.accent}/>
            </div>
            {visits.length>0 && (
              <div style={{ display:'flex', gap:16, marginTop:20, paddingTop:16, borderTop:`1px solid ${theme.line}` }}>
                <div><div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:theme.textDim, marginBottom:4 }}>Erste</div><div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12.5, color:theme.text }}>{CLDfmt.dateShort(dates[0])}</div></div>
                <div><div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:theme.textDim, marginBottom:4 }}>Letzte</div><div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12.5, color:theme.text }}>{CLDfmt.dateShort(dates[dates.length-1])}</div></div>
              </div>
            )}
          </div>
          {/* Mini-Karte */}
          {hasGps && (
          <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, padding:16 }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:theme.textMute, marginBottom:12 }}>Eingang</div>
            <div style={{ position:'relative', height:150, borderRadius:11, overflow:'hidden', border:`1px solid ${theme.line}` }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
                <rect width="100" height="100" fill={theme.bg2}/>
                {Array.from({length:14}).map((_,i)=>(<path key={i} d={`M0 ${i*8} Q25 ${i*8+(i%3-1)*4} 50 ${i*8} T100 ${i*8}`} fill="none" stroke={theme.accent} strokeOpacity={0.07} strokeWidth="0.2"/>))}
                <path d="M0 70 L20 56 L40 64 L60 50 L80 60 L100 54 L100 100 0 100Z" fill={theme.accent} fillOpacity="0.05"/>
              </svg>
              <div style={{ position:'absolute', left:`${pin.x}%`, top:`${pin.y}%`, transform:'translate(-50%,-100%)', filter:`drop-shadow(0 0 8px ${theme.accent})` }}>
                <svg width="26" height="31" viewBox="0 0 32 38"><path d="M16 37 Q16 30 22 22 Q28 14 28 10 A12 12 0 0 0 4 10 Q4 14 10 22 Q16 30 16 37Z" fill={theme.accent} stroke={theme.bg} strokeWidth="1.5"/></svg>
              </div>
            </div>
            <div style={{ marginTop:10, fontFamily:'JetBrains Mono, monospace', fontSize:11.5, color:theme.textMute }}>{CLDfmt.gps(cave.lat, cave.lng)}</div>
          </div>
          )}
        </aside>

        {/* Rechte Spalte */}
        <main style={{ flex:1, minWidth:0 }}>
          {/* Befahrungen */}
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
            <div>
              <CLDKicker theme={theme}>Historie</CLDKicker>
              <h2 style={{ margin:'8px 0 0', fontFamily:'Fraunces, serif', fontSize:28, fontWeight:600, color:theme.text }}>{visits.length} {visits.length===1?'Befahrung':'Befahrungen'}</h2>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:48 }}>
            {visits.map(v=>(
              <button key={v.id} onClick={()=>onOpenTrip(v.id)} style={{
                appearance:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                display:'flex', gap:18, alignItems:'center', background:theme.card, border:`1px solid ${theme.line}`, borderRadius:14, padding:12 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=theme.lineHi}
                onMouseLeave={e=>e.currentTarget.style.borderColor=theme.line}>
                <div style={{ width:120, height:78, borderRadius:10, overflow:'hidden', flexShrink:0 }}><CLDPhoto photo={tripCover(v)} theme={theme} grade={false} w={400}/></div>
                <div style={{ width:54, textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontFamily:'Fraunces, serif', fontSize:24, fontWeight:600, color:theme.text, lineHeight:1 }}>{CLDfmt.day(v.date)}</div>
                  <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:1, color:theme.accent, marginTop:2 }}>{CLDfmt.mon(v.date)} {new Date(v.date).getFullYear()}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Fraunces, serif', fontSize:18, fontWeight:600, color:theme.text, lineHeight:1.15, marginBottom:8, letterSpacing:-0.2 }}>{v.title}</div>
                  <div style={{ display:'flex', gap:14, alignItems:'center', fontFamily:'JetBrains Mono, monospace', fontSize:11.5, color:theme.textMute }}>
                    <span>−{v.depth} m</span><span>{CLDfmt.m(v.length)}</span><span>{CLDfmt.durationShort(v.duration)}</span>
                    <CLDChip label={v.rope} theme={theme} tone={v.rope!=='Ohne'?'rope':'neutral'}/>
                  </div>
                </div>
                <CLDStars value={v.rating} size={13} theme={theme}/>
                <CLDIcon name="chevron-right" size={18} color={theme.textDim}/>
              </button>
            ))}
          </div>

          {/* Beschreibung der Höhle — gilt unabhängig von der einzelnen Befahrung */}
          {cave.notes && (
            <section style={{ marginBottom:34 }}>
              <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:16 }}>
                <CLDIcon name="feed" size={17} color={theme.accent}/>
                <CLDKicker theme={theme}>Über diese Höhle</CLDKicker>
              </div>
              <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, padding:'22px 26px' }}>
                <RichText text={cave.notes} theme={theme} size={14.5}/>
              </div>
            </section>
          )}

          {/* Herkunft der Daten — steht dort, wo die Daten gezeigt werden, und
              ist für jeden sichtbar, nicht nur für Bearbeiter. */}
          {cave.source && (
            <section style={{ marginBottom:34 }}>
              <div style={{ background:theme.card, border:`1px solid ${theme.line}`,
                borderRadius:16, padding:'16px 20px', display:'flex', gap:11, alignItems:'flex-start' }}>
                <CLDIcon name="link" size={16} color={theme.textDim}/>
                <div style={{ fontSize:12.5, color:theme.textMute, lineHeight:1.6 }}>
                  Höhlendaten übernommen aus{' '}
                  {safeUrl(cave.source_url)
                    ? <a href={safeUrl(cave.source_url)} target="_blank" rel="noopener noreferrer"
                        style={{ color:theme.accent, textDecoration:'none' }}>{cave.source}</a>
                    : <span style={{ color:theme.text }}>{cave.source}</span>}
                  {cave.source_license && <> · Lizenz: {cave.source_license}</>}
                </div>
              </div>
            </section>
          )}

          {/* Pläne — gehören zur Höhle, nicht zur einzelnen Befahrung */}
          <section style={{ marginBottom:34 }}>
            <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:16 }}>
              <CLDIcon name="plan" size={17} color={theme.accent}/>
              <CLDKicker theme={theme}>Pläne</CLDKicker>
            </div>
            <CLDPlans caveId={cave.id} caveName={cave.name} theme={theme} isAdmin={isAdmin}/>
          </section>

          {/* Galerie-Wand */}
          {album.length>0 && (
          <>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
            <div>
              <CLDKicker theme={theme}>Galerie-Wand</CLDKicker>
              <h2 style={{ margin:'8px 0 0', fontFamily:'Fraunces, serif', fontSize:28, fontWeight:600, color:theme.text }}>{album.length} Aufnahmen, alle Touren</h2>
            </div>
            <button onClick={()=>onCinemaAlbum(album, 0, cave)} style={{ ...btnPrimary(theme), padding:'12px 18px', fontSize:13.5 }}>
              <CLDIcon name="play" size={15} color={theme.bg}/> Galerie als Diashow
            </button>
          </div>
          <div style={{ columnCount:3, columnGap:12 }}>
            {album.map((p,i)=>{
              const isCover = cover && (cover.url === p.url || cover.thumb === p.thumb);
              return (
              <div key={i} onClick={()=>onCinemaAlbum(album, i, cave)} className="cld-gal" style={{
                breakInside:'avoid', marginBottom:12, borderRadius:12, overflow:'hidden', cursor:'pointer',
                height: 150 + (i*53 % 120), position:'relative',
                border:`1px solid ${isCover?theme.accent:theme.line}` }}>
                <CLDPhoto photo={p} theme={theme} grade={false} w={600}/>
                <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg, transparent 55%, ${theme.bg}d8)` }}/>
                {isAdmin && (
                  isCover ? (
                    <div style={{ position:'absolute', top:10, right:10, display:'flex', alignItems:'center', gap:5,
                      padding:'5px 9px', borderRadius:999, background:theme.accent, color:theme.bg, fontSize:10.5, fontWeight:700 }}>
                      <CLDIcon name="check" size={12} color={theme.bg} strokeWidth={2.6}/> Titelbild
                    </div>
                  ) : (
                    <button onClick={(e)=>{ e.stopPropagation(); setCoverFromPhoto(p); }} disabled={coverBusy} style={{
                      position:'absolute', top:10, right:10, appearance:'none', cursor:'pointer',
                      padding:'5px 10px', borderRadius:999, background:`${theme.bg}cc`, backdropFilter:'blur(6px)',
                      border:`1px solid ${theme.lineHi}`, color:theme.text, fontFamily:'inherit', fontSize:10.5, fontWeight:600 }}>
                      Als Titelbild
                    </button>
                  )
                )}
                <div style={{ position:'absolute', left:12, right:12, bottom:10 }}>
                  <div style={{ fontSize:11.5, color:theme.text, fontWeight:500, lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.caption}</div>
                  {p.date && <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, color:theme.textMute, marginTop:3 }}>{CLDfmt.dateShort(p.date)}</div>}
                </div>
              </div>
              );
            })}
          </div>
          </>
          )}
        </main>
      </div>

      {editing && (
        <CaveEditModal cave={cave} theme={theme} onClose={()=>setEditing(false)}
          onSaved={async ()=>{ setEditing(false); if (onCoverChanged) await onCoverChanged(); }}/>
      )}
    </div>
  );
};

// ── Höhle bearbeiten (Stammdaten inkl. Land) ──────────────
function CaveEditModal({ cave, theme, onClose, onSaved }) {
  const [f, setF] = useState({
    name: cave.name || '', region: cave.region || '', country: cave.country || 'DE',
    type: cave.type || 'Horizontal', depth_m: cave.depth ?? cave.depth_m ?? '',
    length_m: cave.length ?? cave.length_m ?? '', discovered_year: cave.discovered ?? cave.discovered_year ?? '',
    notes: cave.notes || '',
    source: cave.source || '', source_url: cave.source_url || '',
    source_license: cave.source_license || '',
    lat: cave.lat != null ? Number(cave.lat) : null,
    lng: cave.lng != null ? Number(cave.lng) : null,
    coords: (cave.lat != null && cave.lng != null)
      ? `${Number(cave.lat).toFixed(5)}, ${Number(cave.lng).toFixed(5)}` : '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k,v) => setF(s=>({ ...s, [k]:v }));

  // Eingabe „48.48500, 9.55300" → Zahlenwerte. Unfertige Eingaben bleiben
  // stehen, ohne die gespeicherte Lage zu überschreiben.
  const setCoords = (v) => {
    setF(s => {
      const next = { ...s, coords: v };
      const m = v.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
      if (m) {
        const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) { next.lat = lat; next.lng = lng; }
      } else if (v.trim() === '') {
        next.lat = null; next.lng = null;
      }
      return next;
    });
  };
  const setFromMap = ({ lat, lng }) =>
    setF(s => ({ ...s, lat, lng, coords: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));

  const inp = { width:'100%', appearance:'none', padding:'11px 13px', background:theme.bg2, border:`1px solid ${theme.line}`,
    borderRadius:10, color:theme.text, fontSize:14, outline:'none', fontFamily:'inherit', colorScheme:'dark' };
  const lbl = { fontSize:10, fontWeight:700, letterSpacing:1.4, textTransform:'uppercase', color:theme.textMute, marginBottom:7, display:'block' };

  const save = async () => {
    if (!f.name.trim()) { setErr('Name darf nicht leer sein.'); return; }
    setBusy(true); setErr('');
    try {
      await api.updateCave(cave.id, {
        name: f.name.trim(), region: f.region.trim() || null, country: f.country, type: f.type,
        depth_m: f.depth_m === '' ? null : Number(f.depth_m),
        length_m: f.length_m === '' ? null : Number(f.length_m),
        discovered_year: f.discovered_year === '' ? null : Number(f.discovered_year),
        notes: f.notes.trim() || null,
        source: f.source.trim() || null,
        source_url: f.source_url.trim() || null,
        source_license: f.source_license.trim() || null,
        lat: f.lat, lng: f.lng,
      });
      if (onSaved) await onSaved();
    } catch (e) { setErr(e?.message || 'Speichern fehlgeschlagen.'); setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1100, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div onClick={e=>e.stopPropagation()} className="cld-scroll" style={{ width:'100%', maxWidth:540, background:theme.panel,
        border:`1px solid ${theme.lineHi}`, borderRadius:18, padding:'26px 28px', boxShadow:'0 24px 60px rgba(0,0,0,0.5)',
        maxHeight:'calc(100vh - 48px)', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <h2 style={{ margin:0, fontFamily:'Fraunces, serif', fontSize:24, fontWeight:600, color:theme.text }}>Höhle bearbeiten</h2>
          <button onClick={onClose} style={{ appearance:'none', border:'none', background:'transparent', cursor:'pointer', padding:4 }}>
            <CLDIcon name="close" size={20} color={theme.textMute}/>
          </button>
        </div>
        {err && <div style={{ marginBottom:16, padding:'10px 13px', borderRadius:10, background:theme.danger+'1a', border:`1px solid ${theme.danger}55`, color:theme.danger, fontSize:13 }}>{err}</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div><label style={lbl}>Name</label><input value={f.name} onChange={e=>set('name',e.target.value)} style={inp}/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={lbl}>Region</label><input value={f.region} onChange={e=>set('region',e.target.value)} placeholder="z. B. Jura" style={inp}/></div>
            <div><label style={lbl}>Land</label>
              <select value={f.country} onChange={e=>set('country',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                {EU_COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
              </select>
            </div>
          </div>
          <div><label style={lbl}>Typ</label>
            <div style={{ display:'flex', background:theme.bg2, border:`1px solid ${theme.line}`, borderRadius:10, padding:3, gap:2 }}>
              {['Horizontal','Vertikal','Labyrinth','Mixed'].map(o=>(
                <button key={o} onClick={()=>set('type',o)} style={{ flex:1, appearance:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
                  padding:'9px 6px', borderRadius:8, fontSize:12.5, fontWeight:600,
                  background: f.type===o?theme.accent:'transparent', color: f.type===o?theme.bg:theme.textMute }}>{o}</button>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div><label style={lbl}>Gesamttiefe (m)</label><input type="number" value={f.depth_m} onChange={e=>set('depth_m',e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Ganglänge (m)</label><input type="number" value={f.length_m} onChange={e=>set('length_m',e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Erstbefahrung</label><input type="number" value={f.discovered_year} onChange={e=>set('discovered_year',e.target.value)} placeholder="Jahr" style={inp}/></div>
          </div>

          {/* Lage — Eingabe oder Klick auf die Karte */}
          <div>
            <label style={lbl}>Lage (Eingang)</label>
            <input value={f.coords} onChange={e=>setCoords(e.target.value)} placeholder="48.48500, 9.55300"
              style={{ ...inp, fontFamily:'JetBrains Mono, monospace', fontSize:13 }}/>
            <div style={{ height:190, marginTop:10, borderRadius:11, overflow:'hidden', border:`1px solid ${theme.line}` }}>
              <CLMapyMap
                center={f.lat != null ? [f.lat, f.lng] : [48.5, 11]}
                zoom={f.lat != null ? 12 : 5}
                theme={{ ...theme, bgCard: theme.card, bgElev: theme.bg2 }}
                height="100%"
                onMapClick={setFromMap}
                pickedCoords={f.lat != null ? { lat: f.lat, lng: f.lng } : null}/>
            </div>
            <div style={{ fontSize:11, color:theme.textDim, marginTop:7 }}>
              Auf die Karte tippen setzt den Eingang. Leeres Feld entfernt die Lage.
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label style={lbl}>Beschreibung der Höhle</label>
            <textarea value={f.notes} onChange={e=>set('notes',e.target.value)} rows={10}
              placeholder={'Zustieg, Verlauf, Genehmigung, Besonderheiten…\n\n## Zustieg\nVom Parkplatz dem Weg folgen…\n\n## Befahrung\n- Erster Schacht 25 m\n- Danach Mäander'}
              style={{ ...inp, resize:'vertical', lineHeight:1.6, fontFamily:'inherit' }}/>
            <div style={{ fontSize:10.5, color:theme.textDim, marginTop:6, lineHeight:1.5 }}>
              {FORMAT_HINWEIS}
            </div>
          </div>

          {/* Herkunft — Pflicht, sobald Daten aus einer fremden Sammlung stammen */}
          <div>
            <label style={lbl}>Datenquelle</label>
            <div style={{ fontSize:11, color:theme.textDim, marginBottom:8, lineHeight:1.5 }}>
              Nur ausfüllen, wenn die Angaben aus einer fremden Sammlung übernommen
              wurden. Sie werden dann bei der Höhle sichtbar ausgewiesen.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <input value={f.source} onChange={e=>set('source',e.target.value)}
                placeholder="z. B. GrottoCenter" style={inp}/>
              <input value={f.source_license} onChange={e=>set('source_license',e.target.value)}
                placeholder="Lizenz, z. B. ODbL 1.0" style={inp}/>
            </div>
            <input value={f.source_url} onChange={e=>set('source_url',e.target.value)}
              placeholder="Link zum Eintrag bei der Quelle" style={{ ...inp, marginTop:12 }}/>
          </div>
        </div>
        <div style={{ display:'flex', gap:12, marginTop:26, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ ...btnGhost(theme), padding:'12px 20px', fontSize:13.5 }}>Abbrechen</button>
          <button onClick={save} disabled={busy} style={{ ...btnPrimary(theme), padding:'12px 22px', fontSize:13.5, opacity: busy?0.6:1 }}>
            <CLDIcon name="check" size={16} color={theme.bg} strokeWidth={2.4}/> {busy ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CLDCave;
