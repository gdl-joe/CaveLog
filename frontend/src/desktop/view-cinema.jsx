// view-cinema.jsx — Vollbild-Diashow (Cinema-Modus)
// Autoplay mit Timer + Fortschrittsbalken, manuelle Navigation (Pfeile/Tastatur/Filmstreifen),
// Caption + Datum/GPS, Crossfade. Tasten: ← → (blättern), Leertaste (Play/Pause), Esc (schließen).
// EXIF-Kameradaten gibt es in der DB nicht — die Meta-Zeile zeigt nur Vorhandenes.
import { useState, useRef, useEffect } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDfmt } from './atoms.jsx';
import { CLDPhoto } from './photos.jsx';

// Aufnahmezeit eines Fotos: taken_at falls vorhanden, sonst Befahrungsdatum.
function photoWhen(photo, fallbackDate) {
  const raw = photo && photo.date;
  if (raw) {
    const d = new Date(String(raw).replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      const hasTime = String(raw).includes(':');
      const time = hasTime ? d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : null;
      return CLDfmt.dateShort(String(raw).slice(0, 10)) + (time ? ` · ${time}` : '');
    }
  }
  return fallbackDate ? CLDfmt.dateShort(fallbackDate) : '';
}

const CLDCinema = ({ photos=[], title='', subtitle='', gps=null, fallbackDate, startIndex=0, theme, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const DURATION = 5200; // ms pro Bild
  const elapsed = useRef(0);

  const n = photos.length;
  const go = (k) => { if (n) setIdx(((k % n) + n) % n); };
  const next = () => go(idx+1);
  const prev = () => go(idx-1);

  // reset Timer bei Bildwechsel
  useEffect(() => { elapsed.current = 0; setProgress(0); }, [idx]);

  // Autoplay
  useEffect(() => {
    if (!playing || n < 2) return;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = now - last; last = now;
      elapsed.current += dt;
      const p = Math.min(1, elapsed.current / DURATION);
      setProgress(p);
      if (p >= 1) { setIdx(i => (i+1) % n); }
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, idx, n]);

  // Tastatur
  useEffect(() => {
    const onKey = (e) => {
      if (e.key==='ArrowRight') { next(); }
      else if (e.key==='ArrowLeft') { prev(); }
      else if (e.key===' ') { e.preventDefault(); setPlaying(p=>!p); }
      else if (e.key==='Escape') { onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, n, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!n) return null;
  const photo = photos[idx] || photos[0];
  const photoGps = (photo && photo.gps) || gps;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'#05070a',
      display:'flex', flexDirection:'column', userSelect:'none' }}>

      {/* Fortschritts-Segmente */}
      <div style={{ position:'absolute', top:0, left:0, right:0, display:'flex', gap:4, padding:'14px 20px', zIndex:5 }}>
        {photos.map((_,i)=>(
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background:'rgba(255,255,255,0.18)', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:2, background:theme.accent,
              width: i<idx?'100%':i===idx?`${progress*100}%`:'0%',
              transition: i===idx?'none':'width 0.3s' }}/>
          </div>
        ))}
      </div>

      {/* Klick-Zonen */}
      <button onClick={prev} aria-label="Zurück" style={navZone('left')}/>
      <button onClick={next} aria-label="Weiter" style={navZone('right')}/>

      {/* Pfeile */}
      <button onClick={prev} style={arrowBtn('left')}>
        <CLDIcon name="chevron-left" size={26} color="#fff"/>
      </button>
      <button onClick={next} style={arrowBtn('right')}>
        <CLDIcon name="chevron-right" size={26} color="#fff"/>
      </button>

      {/* Header */}
      <div style={{ position:'relative', zIndex:6, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'26px 26px 0' }}>
        <button onClick={onClose} style={ctrlBtn()}>
          <CLDIcon name="close" size={18} color="#fff"/>
          <span style={{ fontSize:13, fontWeight:600 }}>Schließen</span>
        </button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:theme.accent, marginBottom:3 }}>{subtitle}</div>
          <div style={{ fontFamily:'Fraunces, serif', fontSize:16, fontWeight:600, color:'#fff' }}>{title}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, color:'rgba(255,255,255,0.6)' }}>{String(idx+1).padStart(2,'0')} / {String(n).padStart(2,'0')}</span>
          <button onClick={()=>setPlaying(p=>!p)} style={{ ...ctrlBtn(), width:42, height:42, padding:0, justifyContent:'center', borderRadius:'50%' }}>
            <CLDIcon name={playing?'pause':'play'} size={17} color="#fff"/>
          </button>
        </div>
      </div>

      {/* Bildfläche — nimmt den Raum zwischen Kopf- und Fußzeile ein.
          `contain` statt `cover`: Die Fotos sind Panoramen bis 2,2:1; formatfüllend
          bliebe von einem Hochformat nur rund ein Viertel übrig. Weil der Bereich
          im Fluss liegt, überdecken Kopfzeile und Bildunterschrift nichts vom Motiv. */}
      <div style={{ flex:1, minHeight:0, position:'relative' }}>
        {photos.map((p,i)=>(
          <div key={i} style={{ position:'absolute', inset:0,
            opacity: i===idx?1:0, transition:'opacity 0.7s ease',
            pointerEvents:'none' }}>
            {Math.abs(i-idx)<=1 && <CLDPhoto photo={p} theme={theme} grade={false} eager w={2400} fit="contain"/>}
          </div>
        ))}
        {/* dezente Vignette — dunkelt vor allem die freien Flächen neben dem Bild ab */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:'radial-gradient(130% 100% at 50% 45%, transparent 64%, rgba(0,0,0,0.38) 100%)' }}/>
      </div>

      {/* Caption + Meta + Filmstreifen */}
      <div style={{ position:'relative', zIndex:6, flexShrink:0, padding:'18px 26px 22px' }}>
        <div style={{ maxWidth:920, marginBottom:18 }}>
          <div style={{ fontFamily:'Fraunces, serif', fontSize:'clamp(20px,2vw,30px)', fontWeight:500, color:'#fff', lineHeight:1.25, letterSpacing:-0.3, textWrap:'pretty' }}>
            {photo.caption}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:22, marginTop:14, flexWrap:'wrap',
            fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'rgba(255,255,255,0.62)' }}>
            <Meta icon="clock" text={photoWhen(photo, fallbackDate)}/>
            {photoGps && <Meta icon="pin" text={CLDfmt.gps(photoGps.lat, photoGps.lng)}/>}
          </div>
        </div>

        {/* Filmstreifen */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }} className="cld-strip">
          {photos.map((p,i)=>(
            <button key={i} onClick={()=>setIdx(i)} style={{
              flexShrink:0, width: i===idx?96:64, height:60, borderRadius:8, overflow:'hidden',
              appearance:'none', cursor:'pointer', padding:0, position:'relative',
              border: i===idx?`2px solid ${theme.accent}`:'2px solid rgba(255,255,255,0.12)',
              transition:'width 0.25s, border 0.2s', opacity: i===idx?1:0.62 }}>
              <CLDPhoto photo={p} theme={theme} grade={false} w={96}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Meta = ({ icon, text }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
    <CLDIcon name={icon} size={13} color="rgba(255,255,255,0.5)"/> {text}
  </span>
);

function navZone(side){ return { position:'absolute', top:96, bottom:190, [side]:0, width:'30%', zIndex:4,
  appearance:'none', border:'none', background:'transparent', cursor:'pointer' }; }
function arrowBtn(side){ return { position:'absolute', top:'46%', [side]:22, zIndex:5,
  width:52, height:52, borderRadius:'50%', appearance:'none', cursor:'pointer',
  background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)', backdropFilter:'blur(8px)',
  display:'flex', alignItems:'center', justifyContent:'center' }; }
function ctrlBtn(){ return { appearance:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8,
  padding:'9px 14px', borderRadius:11, background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)',
  backdropFilter:'blur(8px)', color:'#fff', fontFamily:'inherit' }; }

export default CLDCinema;
