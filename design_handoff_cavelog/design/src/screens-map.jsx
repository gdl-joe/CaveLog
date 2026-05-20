// screens-map.jsx — Echte Mapy.cz-Karte mit Höhlen-Pins + Klick-zum-Setzen

// Mapy.cz API-Key (wird in window.__MAPY_API_KEY gelesen, fallback auf Demo-Key)
const MAPY_API_KEY = (typeof window !== 'undefined' && window.__MAPY_API_KEY) || 'YOUR_MAPY_API_KEY';

// Lädt Leaflet einmalig (als Script + CSS) und returned Promise
let _leafletLoading = null;
function loadLeaflet() {
  if (typeof window !== 'undefined' && window.L) return Promise.resolve(window.L);
  if (_leafletLoading) return _leafletLoading;
  _leafletLoading = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => resolve(window.L);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return _leafletLoading;
}

// Reusable Mapy.cz-Karte
// Props: center [lat,lng], zoom, pins [{lat,lng,label,id}], onPinClick, onMapClick, pickedCoords, theme, height
const CLMapyMap = ({ center = [48.5, 11], zoom = 5, pins = [], onPinClick, onMapClick, pickedCoords, theme, height = '100%' }) => {
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersLayerRef = React.useRef(null);
  const pickMarkerRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        center, zoom, zoomControl: false, attributionControl: true,
      });
      // Mapy.cz Raster-Tiles (outdoor — passt zu Höhlenthema)
      L.tileLayer(
        `https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_API_KEY}`,
        {
          minZoom: 0, maxZoom: 19,
          attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">© Seznam.cz a.s. a další</a>',
          crossOrigin: true,
        }
      ).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      if (onMapClick) {
        map.on('click', (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }));
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line
  }, []);

  // Pins rendern
  React.useEffect(() => {
    if (!ready || !window.L || !markersLayerRef.current) return;
    const L = window.L;
    markersLayerRef.current.clearLayers();
    pins.forEach(p => {
      const html = `
        <div style="position:relative;transform:translate(-50%,-100%);">
          <svg viewBox="0 0 32 38" width="32" height="38" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6));">
            <path d="M 16 37 Q 16 30 22 22 Q 28 14 28 10 A 12 12 0 0 0 4 10 Q 4 14 10 22 Q 16 30 16 37 Z"
              fill="${theme.bgCard}" stroke="${theme.accent}" stroke-width="1.8"/>
            <text x="16" y="14" text-anchor="middle" font-size="10" font-weight="700"
              fill="${theme.accent}" font-family="Fraunces, serif">${p.label || ''}</text>
          </svg>
        </div>`;
      const icon = L.divIcon({ html, className: 'cl-pin', iconSize: [32, 38], iconAnchor: [16, 38] });
      const m = L.marker([p.lat, p.lng], { icon }).addTo(markersLayerRef.current);
      if (onPinClick) m.on('click', () => onPinClick(p));
    });
  }, [ready, pins, theme.accent, theme.bgCard]);

  // Pick-Marker
  React.useEffect(() => {
    if (!ready || !window.L) return;
    const L = window.L;
    if (pickMarkerRef.current) {
      mapRef.current.removeLayer(pickMarkerRef.current);
      pickMarkerRef.current = null;
    }
    if (pickedCoords) {
      const html = `
        <div style="position:relative;transform:translate(-50%,-50%);">
          <div style="width:18px;height:18px;border-radius:50%;background:${theme.accent};border:3px solid ${theme.bg};box-shadow:0 0 0 2px ${theme.accent}, 0 0 20px ${theme.accent};"></div>
        </div>`;
      const icon = L.divIcon({ html, className: 'cl-pick', iconSize: [18, 18], iconAnchor: [9, 9] });
      pickMarkerRef.current = L.marker([pickedCoords.lat, pickedCoords.lng], { icon }).addTo(mapRef.current);
    }
  }, [ready, pickedCoords, theme.accent, theme.bg]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 14, overflow: 'hidden', background: theme.bgElev }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}/>
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: theme.textMute, fontSize: 12, background: theme.bgElev,
        }}>Karte lädt…</div>
      )}
      {/* Branding / API-Key Hinweis */}
      {MAPY_API_KEY === 'YOUR_MAPY_API_KEY' && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 400,
          padding: '6px 10px', borderRadius: 8,
          background: 'rgba(232, 85, 58, 0.92)', color: '#fff',
          fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          ⚠ Mapy.cz API-Key fehlt — window.__MAPY_API_KEY setzen
        </div>
      )}
    </div>
  );
};

// Haupt-Karten-Screen
const CLMapScreen = ({ theme, tweaks, onOpenCave }) => {
  const [selected, setSelected] = React.useState(null);
  const pins = CL_CAVES.map(c => ({
    id: c.id, lat: c.lat, lng: c.lng,
    label: CL_TRIPS.filter(t => t.caveId === c.id).length,
  }));

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 700 }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <CLMapyMap
          center={[48.5, 11]} zoom={5}
          pins={pins} theme={theme}
          onPinClick={(p) => setSelected(p.id)}
        />
      </div>

      {/* Header overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 500, padding: '16px 18px' }}>
        <div style={{
          background: 'rgba(15,11,8,0.82)', backdropFilter: 'blur(12px)',
          borderRadius: 14, padding: '10px 14px',
          border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CLIcon name="search" size={16} color={theme.textMute}/>
          <input placeholder="Höhle, Region oder Koordinaten suchen…" style={{
            flex: 1, appearance: 'none', background: 'transparent', border: 'none',
            color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}/>
          <CLIcon name="filter" size={16} color={theme.accent}/>
        </div>
      </div>

      {/* Details panel bottom */}
      {selected && (() => {
        const c = CL_getCave(selected);
        const trips = CL_TRIPS.filter(t => t.caveId === selected);
        return (
          <div style={{
            position: 'absolute', left: 12, right: 12, bottom: 84, zIndex: 500,
            background: theme.bgCard, border: `1px solid ${theme.borderHi}`,
            borderRadius: 18, padding: 16,
            boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: theme.accent, textTransform: 'uppercase', marginBottom: 2 }}>
                  {c.country} · {c.region}
                </div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: theme.text, fontWeight: 500, lineHeight: 1.1 }}>
                  {c.name}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{
                appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
              }}>
                <CLIcon name="close" size={18} color={theme.textMute}/>
              </button>
            </div>
            <div style={{
              display: 'flex', gap: 16, marginTop: 12,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: theme.textMute,
            }}>
              <span><b style={{ color: theme.text, fontSize: 13 }}>−{c.depth}</b>m</span>
              <span><b style={{ color: theme.text, fontSize: 13 }}>{c.length > 1000 ? (c.length/1000).toFixed(1)+' km' : c.length+' m'}</b></span>
              <span><b style={{ color: theme.text, fontSize: 13 }}>{trips.length}</b> Befahrungen</span>
            </div>
            <button onClick={() => onOpenCave && onOpenCave(c.id)} style={{
              marginTop: 12, width: '100%', appearance: 'none', border: 'none',
              padding: '12px', borderRadius: 12,
              background: theme.accent, color: theme.bg,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit', letterSpacing: 0.3,
            }}>Höhle öffnen</button>
          </div>
        );
      })()}
    </div>
  );
};

window.CLMapScreen = CLMapScreen;
window.CLMapyMap = CLMapyMap;
