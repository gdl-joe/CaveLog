// photos.jsx — Foto-Komponente für die Desktop-Views.
// In Produktion ist jedes Foto ein echtes <img> aus der DB. Fehlt ein Bild
// (0 Fotos / Ladefehler), kommt ein dezenter Platzhalter in denselben Slot.
import { useState } from 'react';
import { CLDIcon } from './icons.jsx';

// Ab dieser Fensterbreite lohnt sich das unverkleinerte Original im Vollbild.
// Darunter reicht die 2048er-Ableitung und lädt spürbar schneller.
export const ORIGINAL_FROM_WIDTH = 1440;

// Kantengrenzen der Ableitungen — müssen zu lib/Images.php passen.
const VARIANT_MAX = { thumb: 400, large: 1200, full: 2048 };

/**
 * Passende Bildquelle für die gewünschte Darstellungsbreite.
 *
 * Zwei Dinge, die man leicht übersieht:
 *
 * 1. Die Grenzen der Ableitungen gelten für die LÄNGERE Kante. Bei den hier
 *    üblichen Panoramen (bis 2,2:1) ist ein Hochformat-Thumbnail deshalb nur
 *    185 px breit, nicht 400 — in einer 400-px-Kachel sichtbar weich. Darum
 *    rechnen wir die tatsächliche Breite aus dem Seitenverhältnis aus.
 * 2. Auf Retina-Bildschirmen stecken hinter einem CSS-Pixel zwei echte.
 *
 * `w` ist die Darstellungsbreite in CSS-Pixeln.
 */
export function pickSource(photo, w) {
  if (!photo) return null;

  const dpr  = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const need = w * dpr;

  // Seitenverhältnis aus den DB-Maßen; ohne Angabe vorsichtig mit 1:1 rechnen.
  const ratio = (photo.width > 0 && photo.height > 0) ? photo.width / photo.height : 1;
  const widthOf = (max) => (ratio >= 1 ? max : Math.round(max * ratio));

  // Kleinste Fassung nehmen, die breit genug ist. Zehn Prozent Nachsicht:
  // knapp zu kleine Bilder sind nicht zu unterscheiden, die nächste Stufe
  // kostet aber schnell das Vielfache an Daten.
  const enough = need * 0.9;
  const chain = [
    [photo.thumb, VARIANT_MAX.thumb],
    [photo.url,   VARIANT_MAX.large],
    [photo.full,  VARIANT_MAX.full],
  ];
  for (const [url, max] of chain) {
    if (url && widthOf(max) >= enough) return url;
  }

  // Keine Ableitung reicht. Auf großen Fenstern lohnt das unverkleinerte
  // Original; darunter bleiben wir bei der 2048er-Fassung und sparen Ladezeit.
  const wide = typeof window !== 'undefined' && window.innerWidth >= ORIGINAL_FROM_WIDTH;
  if (!wide && photo.full) return photo.full;
  return photo.original || photo.full || photo.url || photo.thumb;
}

// Dezenter Platzhalter (Fels-Dunkel + Höhlen-Icon) — gleiche Geometrie wie ein Foto
function PhotoPlaceholder({ theme }) {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden',
      background:`radial-gradient(120% 90% at 50% -10%, ${theme.cardHi} 0%, ${theme.bg2} 40%, ${theme.bg} 82%)`,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(120% 100% at 50% 42%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.5) 100%)' }}/>
      <CLDIcon name="caves" size={46} color={theme.lineHi} strokeWidth={1.3}/>
    </div>
  );
}

/**
 * Haupt-Foto-Komponente. `photo` = adaptiertes Objekt aus adapt.js.
 * `w` beschreibt, wie breit das Bild dargestellt wird — daraus ergibt sich die Quelle.
 * `fit`: 'cover' füllt den Slot (Kacheln, Karten), 'contain' zeigt das ganze
 * Bild (Vollbild). Bei den hier üblichen Panoramen schneidet 'cover' viel weg,
 * deshalb nutzt die Diashow bewusst 'contain'.
 */
export function CLDPhoto({ photo, theme, radius = 0, w = 1600, fit = 'cover',
                           grade = true, eager = false, style, onLoad }) {
  const [failed, setFailed] = useState(false);
  const url = pickSource(photo, w);
  const ok  = url && !failed;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      borderRadius: radius, background: theme.bg2, ...style }}>
      {ok ? (
        <img
          src={url}
          alt={photo.caption || ''}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          onLoad={onLoad}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: fit, objectPosition: (photo && photo.focal) || 'center',
            display: 'block' }}
        />
      ) : (
        <PhotoPlaceholder theme={theme} />
      )}
      {grade && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(180deg, ${theme.bg}00 55%, ${theme.bg}22 100%)`,
          boxShadow: `inset 0 0 120px ${theme.bg}55` }} />
      )}
    </div>
  );
}

export default CLDPhoto;
