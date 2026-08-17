// view-detail.jsx — Befahrungs-Detail: Hero + Split (Metadaten-Rail / Galerie)
import { useState, useRef } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDfmt, CLDKicker, CLDStars, CLDChip, CLDDifficulty, CLDMetric } from './atoms.jsx';
import { CLDPhoto } from './photos.jsx';
import { tripCover } from './adapt.js';
import { btnPrimary } from './ui.js';
import { api } from '../api.js';

const CLDDetail = ({ trip, caves, photos=[], theme, diffMode='bars', onBack, onCinema, onEdit, isAdmin=true, onPhotosChanged }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [prog, setProg] = useState({ done:0, total:0 });

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploading(true); setProg({ done:0, total:files.length });
    for (let i=0; i<files.length; i++) {
      try { await api.uploadPhoto(trip.id, files[i]); } catch { /* ein Fehler stoppt den Rest nicht */ }
      setProg({ done:i+1, total:files.length });
    }
    setUploading(false);
    if (onPhotosChanged) await onPhotosChanged();
  };
  const pickFiles = () => fileRef.current && fileRef.current.click();
  const uploadBtnLabel = uploading ? `Lädt ${prog.done}/${prog.total}…` : 'Fotos hinzufügen';

  // Foto als Titelbild der Befahrung setzen (steuert Feed-Hero, Grid, Detail-Hero)
  const [coverBusy, setCoverBusy] = useState(false);
  const makeCover = async (photo) => {
    if (!photo?.id) return;
    setCoverBusy(true);
    try { await api.makePhotoCover(photo.id); if (onPhotosChanged) await onPhotosChanged(); }
    finally { setCoverBusy(false); }
  };

  const caveObj = (caves||[]).find(c => c.id === (trip.caveId || trip.cave_id)) || {};
  const cave = {
    name:    trip.cave_name || caveObj.name || '',
    region:  trip.cave_region || caveObj.region || '',
    country: trip.cave_country || caveObj.country || '',
    lat:     trip.lat ?? caveObj.lat,
    lng:     trip.lng ?? caveObj.lng,
  };
  const lead = photos[0] || tripCover(trip);
  const gallery = photos;
  const team = trip.team || [];
  const gear = trip.gear || [];
  const hazards = trip.hazards || [];
  const notes = trip.notes || '';

  return (
    <div>
      {/* ── Hero ───────────────────────────────────── */}
      <div style={{ position:'relative', height:'56vh', minHeight:460, overflow:'hidden' }}>
        <CLDPhoto photo={lead} theme={theme} grade={false} eager w={2200}/>
        <div style={{ position:'absolute', inset:0, background:theme.heroGrade }}/>

        <button onClick={onBack} style={{
          position:'absolute', top:24, left:24, appearance:'none', cursor:'pointer',
          padding:'10px 16px 10px 12px', borderRadius:11,
          background:`${theme.bg}9c`, backdropFilter:'blur(10px)', border:`1px solid ${theme.lineHi}`,
          display:'flex', alignItems:'center', gap:8, color:theme.text, fontFamily:'inherit', fontSize:13.5, fontWeight:600 }}>
          <CLDIcon name="arrow-left" size={17} color={theme.text}/> Logbuch
        </button>

        {isAdmin && (
          <button onClick={onEdit} style={{
            position:'absolute', top:24, right:24, appearance:'none', cursor:'pointer',
            width:42, height:42, borderRadius:11,
            background:`${theme.bg}9c`, backdropFilter:'blur(10px)', border:`1px solid ${theme.lineHi}`,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CLDIcon name="edit" size={18} color={theme.text}/>
          </button>
        )}

        <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 56px 44px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <CLDIcon name="pin" size={15} color={theme.accent}/>
            <span style={{ fontSize:13, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:theme.accent }}>{[cave.name, cave.region, cave.country].filter(Boolean).join(' · ')}</span>
          </div>
          <h1 style={{ margin:0, fontFamily:'Fraunces, serif', fontSize:'clamp(36px,4.4vw,66px)', fontWeight:600,
            lineHeight:1.0, letterSpacing:-1.2, color:theme.text, maxWidth:900, textWrap:'balance' }}>{trip.title}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:24, flexWrap:'wrap' }}>
            <button onClick={()=>onCinema(0)} style={btnPrimary(theme)}>
              <CLDIcon name="play" size={16} color={theme.bg}/> Diashow starten
            </button>
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, color:theme.textMute, marginLeft:6 }}>{CLDfmt.date(trip.date)}</span>
            <span style={{ color:theme.textDim }}>·</span>
            <CLDStars value={trip.rating} size={16} theme={theme}/>
          </div>
        </div>
      </div>

      {/* ── Split ──────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:48, padding:'44px 56px 72px' }}>
        {/* Linke Rail */}
        <aside style={{ width:344, flexShrink:0, position:'sticky', top:24, display:'flex', flexDirection:'column', gap:30 }}>
          {/* Kennzahlen */}
          <Panel theme={theme}>
            <PanelTitle theme={theme}>Kennzahlen</PanelTitle>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px 14px', marginTop:16 }}>
              <CLDMetric icon="depth" label="Tiefe" prefix="−" value={trip.depth} unit="m" theme={theme} accent={theme.accent}/>
              <CLDMetric icon="length" label="Strecke" value={trip.length<1000?trip.length:(trip.length/1000).toFixed(1)} unit={trip.length<1000?'m':'km'} theme={theme} accent={theme.accent}/>
              <CLDMetric icon="clock" label="Dauer" value={Math.floor(trip.duration/60)} unit="h" theme={theme} accent={theme.accent}/>
            </div>
            <div style={{ display:'flex', gap:18, marginTop:22, paddingTop:18, borderTop:`1px solid ${theme.line}` }}>
              <DataPair label="Start" value={trip.start} theme={theme}/>
              <DataPair label="Ende" value={trip.end} theme={theme}/>
              <DataPair label="Wetter" value={(trip.weather||'').split(',')[1]?.trim()||trip.weather||'—'} theme={theme}/>
            </div>
            <div style={{ display:'flex', gap:7, marginTop:18, flexWrap:'wrap' }}>
              <CLDChip icon="caves" label={trip.type} theme={theme}/>
              <CLDChip icon="drop" label={trip.wet} theme={theme} tone={trip.wet!=='Trocken'?'cool':'neutral'}/>
              <CLDChip icon="rope" label={trip.rope} theme={theme} tone={trip.rope!=='Ohne'?'rope':'neutral'}/>
            </div>
          </Panel>

          {/* Schwierigkeit */}
          <Panel theme={theme}>
            <PanelTitle theme={theme}>Schwierigkeit · T·K·P</PanelTitle>
            <div style={{ marginTop:18 }}>
              <CLDDifficulty diff={trip.difficulty} theme={theme} mode={diffMode} size="lg"/>
            </div>
          </Panel>

          {/* Team */}
          {team.length>0 && (
          <Panel theme={theme}>
            <PanelTitle theme={theme}>Team · {team.length}</PanelTitle>
            <div style={{ display:'flex', flexDirection:'column', gap:2, marginTop:14 }}>
              {team.map((m,i)=>(
                <div key={m} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0',
                  borderBottom: i<team.length-1?`1px solid ${theme.line}`:'none' }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
                    background:`linear-gradient(135deg, ${theme.accent}cc, ${theme.rope}cc)`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:theme.bg, fontWeight:700, fontFamily:'Fraunces, serif', fontSize:13 }}>
                    {m.split(' ').map(p=>p[0]).join('').slice(0,2)}
                  </div>
                  <span style={{ fontSize:14, color:theme.text, fontWeight:500 }}>{m}</span>
                </div>
              ))}
            </div>
          </Panel>
          )}

          {/* Ausrüstung */}
          {gear.length>0 && (
          <Panel theme={theme}>
            <PanelTitle theme={theme}>Ausrüstung</PanelTitle>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:14 }}>
              {gear.map(g=><CLDChip key={g} label={g} theme={theme}/>)}
            </div>
          </Panel>
          )}

          {/* Gefahren */}
          {hazards.length>0 && (
            <Panel theme={theme} accent="danger">
              <PanelTitle theme={theme} color={theme.danger}>Gefahren & Hinweise</PanelTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:14 }}>
                {hazards.map(h=>(
                  <div key={h} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <CLDIcon name="warning" size={16} color={theme.danger} style={{ flexShrink:0, marginTop:1 }}/>
                    <span style={{ fontSize:13.5, color:theme.text, lineHeight:1.45 }}>{h}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* GPS */}
          {(cave.lat != null && cave.lng != null) && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'2px 4px' }}>
            <CLDIcon name="pin" size={15} color={theme.textDim}/>
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:theme.textMute }}>{CLDfmt.gps(cave.lat, cave.lng)}</span>
          </div>
          )}
        </aside>

        {/* Rechte Spalte */}
        <main style={{ flex:1, minWidth:0 }}>
          {/* Notizen */}
          {notes && (
          <div style={{ marginBottom:44 }}>
            <CLDKicker theme={theme}>Tourbericht</CLDKicker>
            <p style={{ margin:'18px 0 0', fontFamily:'Fraunces, serif', fontSize:21, fontWeight:400,
              lineHeight:1.62, color:theme.text, letterSpacing:0.1, maxWidth:760, textWrap:'pretty' }}>
              <span style={{ float:'left', fontFamily:'Fraunces, serif', fontSize:64, lineHeight:0.82,
                fontWeight:600, color:theme.accent, marginRight:12, marginTop:6 }}>{notes.charAt(0)}</span>
              {notes.slice(1)}
            </p>
          </div>
          )}

          {/* Galerie */}
          {isAdmin && (
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} style={{ display:'none' }}/>
          )}
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
            <div>
              <CLDKicker theme={theme}>Bildstrecke</CLDKicker>
              <h2 style={{ margin:'8px 0 0', fontFamily:'Fraunces, serif', fontSize:28, fontWeight:600, color:theme.text }}>{gallery.length} Aufnahmen</h2>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {isAdmin && (
              <button onClick={pickFiles} disabled={uploading} style={{
                appearance:'none', cursor: uploading?'default':'pointer', fontFamily:'inherit',
                padding:'10px 16px', borderRadius:10, background:theme.accent, border:'none', opacity: uploading?0.7:1,
                color:theme.bg, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                <CLDIcon name="camera" size={15} color={theme.bg}/> {uploadBtnLabel}
              </button>
              )}
              {gallery.length>0 && (
              <button onClick={()=>onCinema(0)} style={{
                appearance:'none', cursor:'pointer', fontFamily:'inherit',
                padding:'10px 16px', borderRadius:10, background:'transparent', border:`1px solid ${theme.lineHi}`,
                color:theme.text, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
                <CLDIcon name="slideshow" size={15} color={theme.accent}/> Als Diashow
              </button>
              )}
            </div>
          </div>

          {gallery.length === 0 ? (
            <div style={{ height:200, borderRadius:16, border:`1px dashed ${theme.lineHi}`, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:14, color:theme.textMute, fontSize:14 }}>
              Noch keine Fotos für diese Befahrung.
              {isAdmin && (
                <button onClick={pickFiles} disabled={uploading} style={{
                  appearance:'none', cursor: uploading?'default':'pointer', fontFamily:'inherit',
                  padding:'10px 18px', borderRadius:10, background:theme.accent, border:'none', opacity: uploading?0.7:1,
                  color:theme.bg, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                  <CLDIcon name="camera" size={15} color={theme.bg}/> {uploadBtnLabel}
                </button>
              )}
            </div>
          ) : (
          <>
          {/* Lead = aktuelles Titelbild */}
          <div onClick={()=>onCinema(0)} style={{ height:440, borderRadius:16, overflow:'hidden', cursor:'pointer',
            position:'relative', marginBottom:12, border:`1px solid ${theme.line}` }} className="cld-gal">
            <CLDPhoto photo={lead} theme={theme} grade={false} eager w={1600}/>
            {isAdmin && (
              <div style={{ position:'absolute', top:14, left:14, display:'flex', alignItems:'center', gap:6,
                padding:'6px 11px', borderRadius:999, background:theme.accent, color:theme.bg, fontSize:11, fontWeight:700, zIndex:2 }}>
                <CLDIcon name="check" size={13} color={theme.bg} strokeWidth={2.6}/> Titelbild
              </div>
            )}
            <PhotoCaption photo={lead} theme={theme}/>
          </div>

          {/* Rest-Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
            {gallery.slice(1).map((p,i)=>(
              <div key={i} onClick={()=>onCinema(i+1)} style={{ height:200, borderRadius:13, overflow:'hidden',
                cursor:'pointer', position:'relative', border:`1px solid ${theme.line}` }} className="cld-gal">
                <CLDPhoto photo={p} theme={theme} grade={false} w={700}/>
                <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg, transparent 55%, ${theme.bg}cc)` }}/>
                {isAdmin && (
                  <button onClick={(e)=>{ e.stopPropagation(); makeCover(p); }} disabled={coverBusy} style={{
                    position:'absolute', top:10, right:10, appearance:'none', cursor:'pointer', zIndex:2,
                    padding:'5px 10px', borderRadius:999, background:`${theme.bg}cc`, backdropFilter:'blur(6px)',
                    border:`1px solid ${theme.lineHi}`, color:theme.text, fontFamily:'inherit', fontSize:10.5, fontWeight:600 }}>
                    Als Titelbild
                  </button>
                )}
                <div style={{ position:'absolute', left:12, right:12, bottom:10 }}>
                  <div style={{ fontSize:11.5, color:theme.text, fontWeight:500, lineHeight:1.3,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.caption}</div>
                </div>
              </div>
            ))}
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
};

const Panel = ({ theme, accent, children }) => (
  <div style={{ background:theme.card, border:`1px solid ${accent==='danger'?theme.danger+'40':theme.line}`,
    borderRadius:16, padding:'18px 20px', position:'relative' }}>{children}</div>
);
const PanelTitle = ({ theme, color, children }) => (
  <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:color||theme.textMute }}>{children}</div>
);
const DataPair = ({ label, value, theme }) => (
  <div style={{ flex:1 }}>
    <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:theme.textDim, marginBottom:4 }}>{label}</div>
    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, color:theme.text, fontWeight:500 }}>{value}</div>
  </div>
);
// Caption ohne EXIF-Kameradaten (nicht in der DB) — nur Bildunterschrift.
const PhotoCaption = ({ photo, theme }) => (
  <>
    <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg, transparent 55%, ${theme.bg}e0)`, pointerEvents:'none' }}/>
    <div style={{ position:'absolute', left:20, right:20, bottom:16, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16 }}>
      <div style={{ fontSize:14, color:theme.text, fontWeight:500, maxWidth:'90%' }}>{photo.caption}</div>
    </div>
  </>
);

export default CLDDetail;
