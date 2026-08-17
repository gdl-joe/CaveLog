// view-feed.jsx — Cinematisches Logbuch (Hero + editoriales Raster)
import { useState } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDfmt, CLDKicker, CLDStars, CLDChip } from './atoms.jsx';
import { CLDPhoto } from './photos.jsx';
import { tripCover, tripCaveLabel } from './adapt.js';
import { btnPrimary, btnGhost } from './ui.js';

const CLDFeed = ({ trips, caves, theme, onOpenTrip, onCinema, layout='grid', onLayout, user, featuredPhotos=[] }) => {
  const [hoverId, setHoverId] = useState(null);

  if (!trips || !trips.length) {
    return (
      <div style={{ padding:'120px 56px', textAlign:'center', color:theme.textMute }}>
        <CLDIcon name="caves" size={44} color={theme.lineHi}/>
        <h2 style={{ fontFamily:'Fraunces, serif', fontSize:28, color:theme.text, marginTop:20 }}>Noch keine Befahrungen</h2>
        <p style={{ fontSize:14 }}>Lege die erste Befahrung an, um Dein Logbuch zu füllen.</p>
      </div>
    );
  }

  const featured = trips[0];
  const rest = trips.slice(1);
  const fcave = tripCaveLabel(featured, caves);

  const seasonKm = (trips.reduce((s,t)=>s+(t.length||0),0)/1000).toFixed(1);
  const seasonH = Math.round(trips.reduce((s,t)=>s+(t.duration||0),0)/60);
  const strip = featuredPhotos.slice(1,5);
  const stripMore = featured.photos - 5;

  return (
    <div>
      {/* ── Hero ───────────────────────────────────── */}
      <div style={{ position:'relative', height:'62vh', minHeight:520, overflow:'hidden' }}>
        <CLDPhoto photo={tripCover(featured)} theme={theme} grade={false} eager w={2200}/>
        <div style={{ position:'absolute', inset:0, background:theme.heroGrade }}/>
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg, ${theme.bg}cc 0%, ${theme.bg}40 38%, transparent 65%)` }}/>

        {/* Inhalt */}
        <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 56px 52px',
          display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:40 }}>
          <div style={{ maxWidth:760 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
              <CLDChip label="Jüngste Befahrung" theme={theme} tone="accent"/>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12.5, color:theme.textMute }}>{CLDfmt.dateShort(featured.date)}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:12 }}>
              <CLDIcon name="pin" size={15} color={theme.accent}/>
              <span style={{ fontSize:13, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:theme.accent }}>{fcave.name}{fcave.region?` · ${fcave.region}`:''}</span>
            </div>
            <h1 style={{ margin:0, fontFamily:'Fraunces, serif', fontSize:'clamp(40px, 5vw, 76px)', fontWeight:600,
              lineHeight:1.0, letterSpacing:-1.5, color:theme.text, textWrap:'balance' }}>{featured.title}</h1>

            <div style={{ display:'flex', alignItems:'center', gap:30, marginTop:26 }}>
              <HeroStat icon="depth" value={`−${featured.depth}`} unit="m" theme={theme}/>
              <HeroStat icon="length" value={CLDfmt.m(featured.length)} theme={theme}/>
              <HeroStat icon="clock" value={CLDfmt.durationShort(featured.duration)} theme={theme}/>
              <div style={{ width:1, height:34, background:theme.lineHi }}/>
              <CLDStars value={featured.rating} size={17} theme={theme}/>
            </div>

            <div style={{ display:'flex', gap:12, marginTop:30 }}>
              <button onClick={()=>onCinema(featured.id)} style={btnPrimary(theme)}>
                <CLDIcon name="play" size={16} color={theme.bg}/> Diashow ansehen
              </button>
              <button onClick={()=>onOpenTrip(featured.id)} style={btnGhost(theme)}>
                Befahrung öffnen <CLDIcon name="arrow-right" size={16} color={theme.text}/>
              </button>
            </div>
          </div>

          {/* Foto-Filmstreifen */}
          {strip.length > 0 && (
          <div style={{ display:'flex', gap:8, paddingBottom:6 }}>
            {strip.map((p,i)=>(
              <div key={i} onClick={()=>onCinema(featured.id)} style={{
                width:84, height:108, borderRadius:10, overflow:'hidden', cursor:'pointer',
                border:`1px solid ${theme.lineHi}`, position:'relative', flexShrink:0,
                boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
                <CLDPhoto photo={p} theme={theme} grade={false} w={300}/>
              </div>
            ))}
            {stripMore > 0 && (
            <div onClick={()=>onCinema(featured.id)} style={{
              width:84, height:108, borderRadius:10, cursor:'pointer', flexShrink:0,
              border:`1px solid ${theme.lineHi}`, background:theme.card,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
              <CLDIcon name="camera" size={18} color={theme.accent}/>
              <span style={{ fontSize:11, fontWeight:700, color:theme.text }}>+{stripMore}</span>
            </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* ── Saison-Leiste ──────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:0, padding:'0 56px',
        borderBottom:`1px solid ${theme.line}`, background:theme.bg2 }}>
        {[
          { l:'Befahrungen', v:trips.length },
          { l:'Strecke gesamt', v:seasonKm, u:'km' },
          { l:'Stunden unter Tage', v:seasonH, u:'h' },
          { l:'Tiefster Punkt', v:`−${Math.max(...trips.map(t=>t.depth||0))}`, u:'m' },
          { l:'Fotos im Archiv', v:user.totalPhotos },
        ].map((s,i)=>(
          <div key={i} style={{ padding:'20px 36px 20px 0', marginRight:36,
            borderRight: i<4?`1px solid ${theme.line}`:'none' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:theme.textDim, marginBottom:6 }}>{s.l}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
              <span style={{ fontFamily:'Fraunces, serif', fontSize:26, fontWeight:600, color:theme.text, lineHeight:1 }}>{s.v}</span>
              {s.u && <span style={{ fontSize:12, color:theme.textMute }}>{s.u}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Raster / Liste ─────────────────────────── */}
      <div style={{ padding:'40px 56px 64px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:26 }}>
          <div>
            <CLDKicker theme={theme}>Das Archiv</CLDKicker>
            <h2 style={{ margin:'8px 0 0', fontFamily:'Fraunces, serif', fontSize:32, fontWeight:600, color:theme.text, letterSpacing:-0.5 }}>Alle Befahrungen</h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, color:theme.textMute }}>{trips.length} Einträge</span>
            {onLayout && (
              <div style={{ display:'flex', gap:2, padding:3, borderRadius:10, background:theme.card, border:`1px solid ${theme.line}` }}>
                {[{k:'grid',i:'grid'},{k:'list',i:'feed'}].map(o=>(
                  <button key={o.k} onClick={()=>onLayout(o.k)} style={{
                    appearance:'none', border:'none', cursor:'pointer', width:34, height:30, borderRadius:7,
                    background: layout===o.k?theme.accentSoft:'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <CLDIcon name={o.i} size={16} color={layout===o.k?theme.accent:theme.textMute}/>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {layout==='list' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {trips.map(t=> <TripRow key={t.id} trip={t} caves={caves} theme={theme} onOpen={()=>onOpenTrip(t.id)} onCinema={()=>onCinema(t.id)}/>)}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(380px, 1fr))', gap:24 }}>
            {rest.map(t=>(
              <TripCard key={t.id} trip={t} caves={caves} theme={theme}
                hover={hoverId===t.id} onHover={()=>setHoverId(t.id)} onLeave={()=>setHoverId(null)}
                onOpen={()=>onOpenTrip(t.id)} onCinema={()=>onCinema(t.id)}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HeroStat = ({ icon, value, unit, theme }) => (
  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
    <CLDIcon name={icon} size={18} color={theme.textMute}/>
    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:18, fontWeight:600, color:theme.text }}>{value}<span style={{ fontSize:13, color:theme.textMute, marginLeft:2 }}>{unit}</span></span>
  </div>
);

const TripCard = ({ trip, caves, theme, hover, onHover, onLeave, onOpen, onCinema }) => {
  const cave = tripCaveLabel(trip, caves);
  return (
    <div onMouseEnter={onHover} onMouseLeave={onLeave} onClick={onOpen} style={{
      borderRadius:18, overflow:'hidden', cursor:'pointer', background:theme.card,
      border:`1px solid ${hover?theme.lineHi:theme.line}`,
      transform: hover?'translateY(-4px)':'translateY(0)',
      boxShadow: hover?`0 22px 50px rgba(0,0,0,0.45)`:'0 2px 10px rgba(0,0,0,0.2)',
      transition:'all 0.2s cubic-bezier(.2,.7,.3,1)' }}>
      {/* Bild */}
      <div style={{ position:'relative', height:230, overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, transform:hover?'scale(1.05)':'scale(1)', transition:'transform 0.4s ease' }}>
          <CLDPhoto photo={tripCover(trip)} theme={theme} grade={false} w={900}/>
        </div>
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg, transparent 40%, ${theme.card}f0 100%)` }}/>
        {/* Datum */}
        <div style={{ position:'absolute', top:14, left:14, textAlign:'center',
          background:`${theme.bg}b0`, backdropFilter:'blur(8px)', borderRadius:10, padding:'7px 10px',
          border:`1px solid ${theme.lineHi}` }}>
          <div style={{ fontFamily:'Fraunces, serif', fontSize:20, fontWeight:600, color:theme.text, lineHeight:1 }}>{CLDfmt.day(trip.date)}</div>
          <div style={{ fontSize:8.5, fontWeight:700, letterSpacing:1, color:theme.accent, marginTop:2 }}>{CLDfmt.mon(trip.date)}</div>
        </div>
        {/* Cinema-Button bei Hover */}
        <button onClick={(e)=>{e.stopPropagation(); onCinema();}} style={{
          position:'absolute', top:14, right:14, width:38, height:38, borderRadius:'50%',
          appearance:'none', border:`1px solid ${theme.lineHi}`, cursor:'pointer',
          background:`${theme.bg}b0`, backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          opacity:hover?1:0, transform:hover?'scale(1)':'scale(0.8)', transition:'all 0.2s' }}>
          <CLDIcon name="play" size={15} color={theme.accent}/>
        </button>
        {/* Foto-Count */}
        <div style={{ position:'absolute', bottom:12, right:14, display:'flex', alignItems:'center', gap:5,
          fontSize:11, fontWeight:600, color:theme.text }}>
          <CLDIcon name="camera" size={13} color={theme.textMute}/> {trip.photos}
        </div>
      </div>
      {/* Body */}
      <div style={{ padding:'16px 18px 18px' }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.6, color:theme.accent, marginBottom:6 }}>{(cave.name||'').toUpperCase()}</div>
        <div style={{ fontFamily:'Fraunces, serif', fontSize:21, fontWeight:600, color:theme.text, lineHeight:1.15, marginBottom:10, letterSpacing:-0.3 }}>{trip.title}</div>
        {trip.rating > 0 && (
          <div style={{ marginBottom:12 }}><CLDStars value={trip.rating} size={13} theme={theme}/></div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:16, paddingTop:13, borderTop:`1px solid ${theme.line}` }}>
          <MiniMetric icon="depth" value={`−${trip.depth}m`} theme={theme}/>
          <MiniMetric icon="length" value={CLDfmt.m(trip.length)} theme={theme}/>
          <div style={{ flex:1 }}/>
          <CLDChip label={trip.rope} theme={theme} tone={trip.rope==='SRT'?'rope':'neutral'}/>
        </div>
      </div>
    </div>
  );
};

const MiniMetric = ({ icon, value, theme }) => (
  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
    <CLDIcon name={icon} size={13} color={theme.textDim}/>
    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12.5, color:theme.textMute, fontWeight:500 }}>{value}</span>
  </div>
);

const TripRow = ({ trip, caves, theme, onOpen, onCinema }) => {
  const cave = tripCaveLabel(trip, caves);
  const [hv, setHv] = useState(false);
  return (
    <div onClick={onOpen} onMouseEnter={()=>setHv(true)} onMouseLeave={()=>setHv(false)} style={{
      display:'flex', gap:22, alignItems:'center', cursor:'pointer',
      background:theme.card, border:`1px solid ${hv?theme.lineHi:theme.line}`, borderRadius:16,
      padding:14, transition:'border 0.15s' }}>
      <div style={{ width:180, height:118, borderRadius:11, overflow:'hidden', flexShrink:0, position:'relative' }}>
        <CLDPhoto photo={tripCover(trip)} theme={theme} grade={false} w={500}/>
      </div>
      <div style={{ width:62, textAlign:'center', flexShrink:0 }}>
        <div style={{ fontFamily:'Fraunces, serif', fontSize:30, fontWeight:600, color:theme.text, lineHeight:1 }}>{CLDfmt.day(trip.date)}</div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:theme.accent, marginTop:3 }}>{CLDfmt.mon(trip.date)}</div>
        <div style={{ fontSize:11, color:theme.textDim, marginTop:2 }}>{new Date(trip.date).getFullYear()}</div>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.6, color:theme.accent, marginBottom:5 }}>{(cave.name||'').toUpperCase()}{cave.region?` · ${cave.region}`:''}</div>
        <div style={{ fontFamily:'Fraunces, serif', fontSize:23, fontWeight:600, color:theme.text, lineHeight:1.1, marginBottom:10, letterSpacing:-0.3 }}>{trip.title}</div>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <MiniMetric icon="depth" value={`−${trip.depth}m`} theme={theme}/>
          <MiniMetric icon="length" value={CLDfmt.m(trip.length)} theme={theme}/>
          <MiniMetric icon="clock" value={CLDfmt.durationShort(trip.duration)} theme={theme}/>
          <CLDChip label={trip.type} theme={theme}/>
          <CLDChip label={trip.wet} theme={theme} tone={trip.wet!=='Trocken'?'cool':'neutral'}/>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12, paddingRight:8 }}>
        <CLDStars value={trip.rating} size={14} theme={theme}/>
        <button onClick={(e)=>{e.stopPropagation(); onCinema();}} style={{
          appearance:'none', border:`1px solid ${theme.lineHi}`, cursor:'pointer',
          background:'transparent', borderRadius:9, padding:'8px 14px',
          display:'flex', alignItems:'center', gap:7, color:theme.text, fontFamily:'inherit', fontSize:12.5, fontWeight:600 }}>
          <CLDIcon name="play" size={13} color={theme.accent}/> Diashow
        </button>
      </div>
    </div>
  );
};

export default CLDFeed;
