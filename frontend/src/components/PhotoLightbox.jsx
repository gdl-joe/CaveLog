// Vollbild-Foto-Viewer mit Blättern (Touch-Swipe + Pfeile)
import { useState, useEffect, useRef } from 'react';
import CLIcon from '../icons.jsx';

export default function PhotoLightbox({ photos, startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const touchX = useRef(null);
  const photo   = photos[idx];

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(photos.length - 1, i + 1));

  // Tastatur-Navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!photo) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.97)',
        display: 'flex', flexDirection: 'column',
        touchAction: 'pan-y',
      }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const diff = touchX.current - e.changedTouches[0].clientX;
        if (diff >  60) next();
        if (diff < -60) prev();
        touchX.current = null;
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          appearance: 'none', border: 'none', background: 'rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CLIcon name="close" size={20} color="#fff" />
        </button>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>
          {idx + 1} / {photos.length}
        </span>
        {/* Platzhalter für symmetrisches Layout */}
        <div style={{ width: 40 }} />
      </div>

      {/* Foto */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img
          key={photo.id ?? idx}
          src={photo.large_path ?? photo.path}
          alt={photo.caption || `Foto ${idx + 1}`}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none' }}
          draggable={false}
        />

        {/* Zurück-Pfeil */}
        {idx > 0 && (
          <button onClick={prev} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            appearance: 'none', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.15)', borderRadius: '50%',
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CLIcon name="back" size={22} color="#fff" />
          </button>
        )}

        {/* Vor-Pfeil */}
        {idx < photos.length - 1 && (
          <button onClick={next} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            appearance: 'none', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.15)', borderRadius: '50%',
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CLIcon name="chevron-right" size={22} color="#fff" />
          </button>
        )}
      </div>

      {/* Caption + Punkt-Navigation */}
      <div style={{ padding: '12px 20px 28px', flexShrink: 0, textAlign: 'center' }}>
        {photo.caption && (
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 12 }}>
            {photo.caption}
          </div>
        )}
        {/* Punkte */}
        {photos.length > 1 && photos.length <= 20 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
            {photos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                appearance: 'none', border: 'none', cursor: 'pointer', padding: 0,
                width: i === idx ? 18 : 6, height: 6, borderRadius: 3,
                background: i === idx ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.2s',
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
