// Detail-Screen — CaveLog Calm: Sticky Topbar, Section-Layout, kein Hero
import { useState, useEffect } from 'react';
import { api } from '../api.js';
import CLIcon from '../icons.jsx';
import { CLStars, CLChip, CLDifficulty, CLPhoto, CLSection, CLfmt } from '../atoms.jsx';
import PhotoLightbox from '../components/PhotoLightbox.jsx';

export default function DetailScreen({ trip, caves = [], theme, prefs, user, onBack, onEdit }) {
  const cave     = caves.find(c => c.id === (trip.caveId ?? trip.cave_id));
  const diffMode = prefs.diffMode || 'bars';
  const isAdmin  = user?.role === 'admin';

  const [photos,      setPhotos]      = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [menuOpen,    setMenuOpen]    = useState(false);

  useEffect(() => {
    api.getPhotos(trip.id).then(setPhotos).catch(() => setPhotos([]));
  }, [trip.id]);

  const wetTone   = trip.wet === 'Nass' || trip.wet === 'Wasserführend' ? 'wet' : 'neutral';
  const ropeTone  = trip.rope && trip.rope !== 'Ohne' ? 'rope' : 'neutral';

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Sticky Top-Bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: theme.bg,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <button onClick={onBack} style={{
          appearance: 'none', border: `1px solid ${theme.border}`, background: theme.bgCard,
          width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CLIcon name="back" size={18} color={theme.text} />
        </button>
        <div style={{ fontSize: 11, color: theme.warm, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
          {CLfmt.date(trip.date)}
        </div>
        {isAdmin ? (
          <button onClick={() => setMenuOpen(true)} style={{
            appearance: 'none', border: `1px solid ${theme.border}`, background: theme.bgCard,
            width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CLIcon name="more" size={18} color={theme.text} />
          </button>
        ) : (
          <div style={{ width: 34 }} />
        )}
      </div>

      {/* Title Block */}
      <div style={{ padding: '20px 18px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 14, height: 2, background: theme.accent, borderRadius: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {cave?.name} · {cave?.region}
          </div>
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: 1.18, color: theme.text, letterSpacing: -0.4 }}>
          {trip.title}
        </h1>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {trip.type    && <CLChip icon label={trip.type}    theme={theme} tone="neutral" />}
          {trip.wet     && <CLChip icon label={trip.wet}     theme={theme} tone={wetTone} />}
          {trip.rope && trip.rope !== 'Ohne' && <CLChip icon label={trip.rope} theme={theme} tone="rope" />}
          {trip.weather && <CLChip label={trip.weather.split(',')[0]} theme={theme} tone="neutral" />}
        </div>
      </div>

      {/* Kennzahlen */}
      <CLSection title="Kennzahlen" theme={theme}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <MiniStat label="Start"     value={trip.start || '—'}                  theme={theme} mono />
          <MiniStat label="Ende"      value={trip.end   || '—'}                  theme={theme} mono />
          <MiniStat label="Dauer"     value={CLfmt.duration(trip.duration || 0)} theme={theme} />
          <MiniStat label="Tiefe"     value={trip.depth  ? `−${trip.depth} m`  : '—'} theme={theme} mono />
          <MiniStat label="Länge"     value={trip.length ? CLfmt.m(trip.length) : '—'} theme={theme} mono />
          <MiniStat label="Bewertung" value={trip.rating ? `${trip.rating}/5`   : '—'} theme={theme} />
        </div>
      </CLSection>

      {/* Schwierigkeit */}
      <CLSection title="Schwierigkeit" theme={theme}>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        }}>
          <CLDifficulty diff={trip.difficulty || { t:1,k:1,p:1 }} mode={diffMode} theme={theme} size="md" />
        </div>
      </CLSection>

      {/* Team */}
      {trip.team?.length > 0 && (
        <CLSection title={`Team · ${trip.team.length}`} theme={theme}>
          <div style={{
            background: theme.bgCard, border: `1px solid ${theme.border}`,
            borderRadius: 10, padding: 12,
            display: 'flex', flexDirection: 'column',
          }}>
            {trip.team.map((m, i) => (
              <div key={m} style={{
                padding: '8px 4px',
                borderBottom: i < trip.team.length - 1 ? `1px solid ${theme.border}` : 'none',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: theme.bgSubtle, border: `1px solid ${theme.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, color: theme.text, letterSpacing: 0.3, flexShrink: 0,
                }}>
                  {m.split(' ').map(p => p[0]).join('').slice(0,2)}
                </div>
                <div style={{ fontSize: 13, color: theme.text }}>{m}</div>
              </div>
            ))}
          </div>
        </CLSection>
      )}

      {/* Ausrüstung */}
      {trip.gear?.length > 0 && (
        <CLSection title="Ausrüstung" theme={theme}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {trip.gear.map(g => (
              <div key={g} style={{
                padding: '6px 10px',
                background: theme.bgCard, border: `1px solid ${theme.border}`,
                borderRadius: 6, fontSize: 12, color: theme.text,
              }}>{g}</div>
            ))}
          </div>
        </CLSection>
      )}

      {/* Gefahren */}
      {trip.hazards?.length > 0 && (
        <CLSection title="Gefahren" theme={theme}>
          <div style={{
            background: theme.bgCard, border: `1px solid ${theme.border}`,
            borderLeft: `2px solid ${theme.danger}`,
            borderRadius: 8, padding: '10px 14px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {trip.hazards.map(h => (
              <div key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: theme.text, lineHeight: 1.4 }}>
                <span style={{ color: theme.danger, marginTop: 1 }}>•</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </CLSection>
      )}

      {/* Notizen */}
      {trip.notes && (
        <CLSection title="Notizen" theme={theme}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: theme.text }}>{trip.notes}</div>
        </CLSection>
      )}

      {/* Fotos */}
      <CLSection title={`Fotos${photos ? ` · ${photos.length}` : ''}`} theme={theme}
        action={isAdmin && (
          <div style={{ fontSize: 11, color: theme.textMute }}>
            Bearbeiten zum Upload
          </div>
        )}
      >
        {photos && photos.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {photos.map((p, i) => (
                <div key={p.id ?? i} onClick={() => setLightboxIdx(i)}
                  className="cl-tap" style={{ cursor: 'pointer', aspectRatio: '1' }}>
                  <CLPhoto theme={theme} src={p.thumb_path ?? p.path} height="100%" radius={6} />
                </div>
              ))}
            </div>
          </>
        ) : trip.photos > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {Array.from({ length: Math.min(trip.photos, 3) }).map((_, i) => (
              <CLPhoto key={i} theme={theme} height={92} radius={6} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px 0', textAlign: 'center', color: theme.textDim, fontSize: 13 }}>
            Noch keine Fotos.
          </div>
        )}
      </CLSection>

      {/* Foto-Lightbox */}
      {lightboxIdx !== null && photos?.length > 0 && (
        <PhotoLightbox photos={photos} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      {/* Aktions-Menü */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 412, margin: '0 auto', background: theme.bgElev, borderRadius: '20px 20px 0 0', padding: '20px 16px 32px' }}>
            <div style={{ fontSize: 13, color: theme.textMute, marginBottom: 14, paddingLeft: 4 }}>{trip.title}</div>
            <button onClick={() => { setMenuOpen(false); onEdit?.(); }} style={{
              width: '100%', appearance: 'none', border: `1px solid ${theme.border}`,
              padding: '14px 16px', borderRadius: 10, marginBottom: 8,
              background: theme.bgCard, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: theme.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CLIcon name="edit" size={16} color={theme.accent} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 500, color: theme.text }}>Befahrung editieren</span>
            </button>
            <button onClick={() => setMenuOpen(false)} style={{ width: '100%', appearance: 'none', border: `1px solid ${theme.border}`, padding: '13px', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: theme.textMute, fontFamily: 'inherit' }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, theme, mono }) {
  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, color: theme.textMute, textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, lineHeight: 1.1, fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter' }}>
        {value}
      </div>
    </div>
  );
}
