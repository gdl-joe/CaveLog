// DesktopShell.jsx — Desktop-Welt ab 900px: Sidebar + Router-Outlet + Cinema-Overlay.
// Nutzt die bestehende Daten-/Auth-/Prefs-Logik aus App.jsx; lädt Fotos lazy
// per getPhotos und verdrahtet Navigation, Cinema und Rollen-Gating.
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { buildTheme } from './theme.js';
import { adaptPhotos, buildDesktopUser } from './adapt.js';
import { api } from '../api.js';

import CLDSidebar from './sidebar.jsx';
import CLDFeed    from './view-feed.jsx';
import CLDDetail  from './view-detail.jsx';
import CLDCinema  from './view-cinema.jsx';
import CLDCaves   from './view-caves.jsx';
import CLDCave    from './view-cave.jsx';
import CLDMap     from './view-map.jsx';
import CLDStats   from './view-stats.jsx';
import CLDNew     from './view-new.jsx';
import CLDProfile from './view-profile.jsx';
import CLDAdmin   from './view-admin.jsx';

export default function DesktopShell({ user, trips, caves, prefs, updatePref, onLogout, reload }) {
  const palette = prefs.desktopPalette || 'carbide';
  const theme = buildTheme(palette, prefs.desktopAccent || '');
  const isAdmin = user.role === 'admin';
  const diffMode = prefs.diffMode || 'bars';
  const feedLayout = prefs.feedLayout || 'grid';

  const [view, setView]     = useState('feed');   // feed|detail|new|caves|cave|map|stats|profile|admin
  const [tripId, setTripId] = useState(null);
  const [caveId, setCaveId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [cinema, setCinema] = useState(null);      // { photos, title, subtitle, gps, fallbackDate, index }
  const scrollRef = useRef(null);

  // Foto-Cache: tripId → adaptierte Fotos
  const photoCache = useRef(new Map());
  const [detailPhotos, setDetailPhotos]     = useState([]);
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [caveAlbum, setCaveAlbum]           = useState([]);

  const trip = trips.find(t => t.id === tripId) || null;
  const cave = caves.find(c => c.id === caveId);
  const desktopUser = useMemo(() => buildDesktopUser(user, trips, caves), [user, trips, caves]);
  const knownTeam = useMemo(() => [...new Set(trips.flatMap(t => t.team || []))], [trips]);

  const loadPhotos = useCallback(async (id) => {
    if (!id) return [];
    if (photoCache.current.has(id)) return photoCache.current.get(id);
    try {
      const ad = adaptPhotos(await api.getPhotos(id));
      photoCache.current.set(id, ad);
      return ad;
    } catch { return []; }
  }, []);

  // Nach Foto-Upload/Änderung: Cache verwerfen, neu laden, Listen (photo_count/cover) auffrischen
  const refreshTripPhotos = useCallback(async (id) => {
    photoCache.current.delete(id);
    const p = await loadPhotos(id);
    setDetailPhotos(prev => (id === tripId ? p : prev));
    if (reload) await reload();
    return p;
  }, [loadPhotos, tripId, reload]);

  // Scroll-Reset bei View/Trip/Cave-Wechsel
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTo(0, 0); }, [view, tripId, caveId]);

  // Feed: Fotos der jüngsten Befahrung (Filmstreifen)
  useEffect(() => {
    let alive = true;
    if (view === 'feed' && trips[0]) loadPhotos(trips[0].id).then(p => { if (alive) setFeaturedPhotos(p); });
    return () => { alive = false; };
  }, [view, trips, loadPhotos]);

  // Detail: Fotos laden
  useEffect(() => {
    let alive = true;
    setDetailPhotos([]);
    if (view === 'detail' && tripId) loadPhotos(tripId).then(p => { if (alive) setDetailPhotos(p); });
    return () => { alive = false; };
  }, [view, tripId, loadPhotos]);

  // Cave: Album über alle Befahrungen der Höhle
  useEffect(() => {
    let alive = true;
    setCaveAlbum([]);
    if (view === 'cave' && caveId) {
      const visits = trips.filter(t => (t.caveId || t.cave_id) === caveId).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      Promise.all(visits.map(v => loadPhotos(v.id).then(ps => ps.map(p => ({ ...p, date: v.date, tripId: v.id })))))
        .then(arrs => { if (alive) setCaveAlbum(arrs.flat()); });
    }
    return () => { alive = false; };
  }, [view, caveId, trips, loadPhotos]);

  // Navigation
  const nav      = (v) => { setEditing(false); setView(v); };
  const openTrip = (id) => { setTripId(id); setEditing(false); setView('detail'); };
  const openCave = (id) => { setCaveId(id); setView('cave'); };
  const openNew  = () => { if (!isAdmin) return; setEditing(false); setView('new'); };
  const openEdit = () => { if (!isAdmin) return; setEditing(true); setView('new'); };
  const logout   = () => { setCinema(null); setView('feed'); onLogout(); };

  // Cinema für einen Trip (lädt Fotos bei Bedarf)
  const openCinema = async (id, index = 0) => {
    const ps = await loadPhotos(id);
    if (!ps.length) return;
    const t = trips.find(x => x.id === id);
    const c = caves.find(x => x.id === (t?.caveId || t?.cave_id));
    setCinema({
      photos: ps, title: t?.title || '', subtitle: c?.name || t?.cave_name || '',
      gps: (c && c.lat != null) ? { lat: Number(c.lat), lng: Number(c.lng) } : null,
      fallbackDate: t?.date, index,
    });
  };
  // Cinema für ein Album (Galerie-Wand einer Höhle)
  const openCinemaAlbum = (album, index = 0, c) => {
    if (!album.length) return;
    setCinema({
      photos: album, title: `${c.name} · Galerie-Wand`, subtitle: c.name,
      gps: (c.lat != null) ? { lat: Number(c.lat), lng: Number(c.lng) } : null,
      fallbackDate: album[index]?.date, index,
    });
  };

  const isFull = view === 'map';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: theme.bg, color: theme.text, overflow: 'hidden' }}>
      <CLDSidebar theme={theme} view={view} user={desktopUser} isAdmin={isAdmin} onNav={nav} onNew={openNew} />

      <div ref={scrollRef} className="cld-scroll" style={{ flex: 1, height: '100vh',
        overflowY: isFull ? 'hidden' : 'auto', overflowX: 'hidden', position: 'relative' }}>
        {view === 'feed' && (
          <CLDFeed trips={trips} caves={caves} theme={theme} user={desktopUser}
            layout={feedLayout} onLayout={(v) => updatePref('feedLayout', v)}
            featuredPhotos={featuredPhotos}
            onOpenTrip={openTrip} onCinema={(id) => openCinema(id, 0)} />
        )}
        {view === 'detail' && trip && (
          <CLDDetail trip={trip} caves={caves} photos={detailPhotos} theme={theme} diffMode={diffMode}
            isAdmin={isAdmin} onBack={() => nav('feed')}
            onCinema={(index) => openCinema(trip.id, index)} onEdit={openEdit}
            onPhotosChanged={() => refreshTripPhotos(trip.id)} />
        )}
        {view === 'new' && (
          <CLDNew caves={caves} theme={theme} diffMode={diffMode} onClose={() => nav(editing ? 'detail' : 'feed')}
            onSaved={reload} editTrip={editing ? trip : null} knownTeam={knownTeam}
            isAdmin={isAdmin}
            onPhotosChanged={() => (editing && trip) ? refreshTripPhotos(trip.id) : reload()} />
        )}
        {view === 'caves' && (
          <CLDCaves caves={caves} trips={trips} theme={theme} onOpenCave={openCave} />
        )}
        {view === 'cave' && cave && (
          <CLDCave cave={cave} trips={trips} album={caveAlbum} theme={theme} isAdmin={isAdmin}
            onBack={() => nav('caves')} onOpenTrip={openTrip} onCinemaAlbum={openCinemaAlbum} onNew={openNew}
            onCoverChanged={reload} />
        )}
        {view === 'map' && (
          <div style={{ height: '100vh' }}>
            <CLDMap caves={caves} trips={trips} theme={theme} onOpenCave={openCave} />
          </div>
        )}
        {view === 'stats' && (
          <CLDStats trips={trips} caves={caves} theme={theme} user={desktopUser} />
        )}
        {view === 'profile' && (
          <CLDProfile theme={theme} user={desktopUser} isAdmin={isAdmin}
            palette={palette} onChangePalette={(v) => updatePref('desktopPalette', v)}
            onLogout={logout} cavesCount={caves.length}
            onManageUsers={() => nav('admin')} />
        )}
        {view === 'admin' && isAdmin && (
          <CLDAdmin theme={theme} meId={user.id} onBack={() => nav('feed')} />
        )}
      </div>

      {cinema && (
        <CLDCinema photos={cinema.photos} title={cinema.title} subtitle={cinema.subtitle}
          gps={cinema.gps} fallbackDate={cinema.fallbackDate} startIndex={cinema.index}
          theme={theme} onClose={() => setCinema(null)} />
      )}
    </div>
  );
}
