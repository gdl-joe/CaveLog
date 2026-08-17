// adapt.js — Adapterschicht: API-Daten → Desktop-Komponenten-Form.
// Die Trips kommen bereits von App.jsx normalisiert (normalizeTrips) — hier
// ergänzen wir Foto-Objekte (Cover) und adaptieren die per getPhotos geladenen
// Alben. Foto-Pfade werden roh genutzt (wie in der Mobile-App).

// Ein DB-Foto → Foto-Objekt für CLDPhoto / Cinema.
export function adaptPhoto(p) {
  return {
    id:      p.id,
    // Vier Stufen für vier Zwecke — die Anzeige wählt je nach Platzbedarf:
    // thumb (400) · url/large (1200) · full (2048) · original (unverkleinert)
    url:      p.large_path || p.path,
    thumb:    p.thumb_path || p.path,
    full:     p.full_path || p.large_path || p.path,
    original: p.path,
    width:    p.width  ? Number(p.width)  : null,
    height:   p.height ? Number(p.height) : null,
    caption: p.caption || '',
    date:    p.taken_at || null,
    gps:     (p.gps_lat != null && p.gps_lng != null) ? { lat: Number(p.gps_lat), lng: Number(p.gps_lng) } : null,
    focal:   'center',
  };
}

export function adaptPhotos(arr) {
  return Array.isArray(arr) ? arr.map(adaptPhoto) : [];
}

// Cover-Foto eines Trips als Foto-Objekt (für Feed-Hero, Grid, Karten).
// Nutzt cover_large (Hero-Auflösung) bzw. cover_photo (Thumbnail).
export function tripCover(trip) {
  if (!trip) return null;
  const large = trip.cover_large || trip.coverLarge;
  const thumb = trip.cover_photo || trip.coverPhoto;
  if (!large && !thumb) return null;
  return { url: large || thumb, thumb: thumb || large, caption: trip.title || '', focal: 'center' };
}

// Titelbild einer Höhle als Foto-Objekt (vom Admin gewählt/hochgeladen).
// Fällt auf null zurück, wenn nichts gesetzt ist (Aufrufer nutzt dann ein
// Befahrungsfoto als Fallback).
export function caveCover(cave) {
  if (!cave) return null;
  const large = cave.cover_path;
  const thumb = cave.cover_thumb;
  if (!large && !thumb) return null;
  return { url: large || thumb, thumb: thumb || large, caption: cave.name || '', focal: 'center' };
}

// Höhlenname/Region eines Trips (von der API als cave_name/cave_region geliefert).
export function tripCaveLabel(trip, caves) {
  if (trip.cave_name) return { name: trip.cave_name, region: trip.cave_region, country: trip.cave_country };
  const c = (caves || []).find(x => x.id === (trip.caveId || trip.cave_id));
  return c ? { name: c.name, region: c.region, country: c.country } : { name: '', region: '', country: '' };
}

// Desktop-Profil-KPIs aus echten Daten.
export function buildDesktopUser(user, trips, caves) {
  const t = trips || [];
  const initials = (user?.name || user?.handle || '?').split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return {
    name:        user?.name || 'Unbekannt',
    handle:      user?.handle ? (user.handle.startsWith('@') ? user.handle : '@' + user.handle) : '',
    role:        user?.role || 'viewer',
    since:       user?.created_at ? new Date(user.created_at).getFullYear() : '—',
    initials,
    trips:       t.length,
    caves:       new Set(t.map(x => x.caveId || x.cave_id)).size,
    maxDepth:    t.length ? Math.max(...t.map(x => x.depth || 0)) : 0,
    totalLength: t.reduce((s, x) => s + (x.length || 0), 0),
    totalHours:  Math.round(t.reduce((s, x) => s + (x.duration || 0), 0) / 60),
    totalPhotos: t.reduce((s, x) => s + (typeof x.photos === 'number' ? x.photos : 0), 0),
  };
}
