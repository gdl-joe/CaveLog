// Karten-Screen — Alle Höhlen auf Mapy.cz Leaflet-Karte
import { useState } from 'react';
import CLIcon from '../icons.jsx';
import CLMapyMap from '../components/MapyMap.jsx';

export default function MapScreen({ theme, caves = [], trips = [], onOpenCave }) {
  const [selected, setSelected] = useState(null);

  const pins = caves.map(c => ({
    id: c.id, lat: c.lat, lng: c.lng,
    label: trips.filter(t => t.caveId === c.id).length,
  }));

  return (
    <div style={{ position: 'relative', flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Vollbild-Karte */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <CLMapyMap
          center={[48.5, 11]} zoom={6}
          pins={pins} theme={theme}
          height="100%"
          onPinClick={(p) => setSelected(p.id)}
        />
      </div>

      {/* Such-Overlay oben */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 500, padding: '16px 18px' }}>
        <div style={{
          background: 'rgba(15,11,8,0.82)', backdropFilter: 'blur(12px)',
          borderRadius: 14, padding: '10px 14px',
          border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CLIcon name="search" size={16} color={theme.textMute} />
          <input placeholder="Höhle, Region oder Koordinaten suchen…" style={{
            flex: 1, appearance: 'none', background: 'transparent', border: 'none',
            color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }} />
          <CLIcon name="filter" size={16} color={theme.accent} />
        </div>
      </div>

      {/* Details-Panel unten */}
      {selected && (() => {
        const c = caves.find(x => x.id === selected);
        const caveTrips = trips.filter(t => t.caveId === selected);
        return (
          <div style={{
            position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 500,
            background: theme.bgCard, border: `1px solid ${theme.borderHi}`,
            borderRadius: 18, padding: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
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
                appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
              }}>
                <CLIcon name="close" size={18} color={theme.textMute} />
              </button>
            </div>
            <div style={{
              display: 'flex', gap: 16, marginTop: 12,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: theme.textMute,
            }}>
              <span><b style={{ color: theme.text, fontSize: 13 }}>−{c.depth}</b>m</span>
              <span><b style={{ color: theme.text, fontSize: 13 }}>
                {c.length > 1000 ? (c.length/1000).toFixed(1)+' km' : c.length+' m'}
              </b></span>
              <span><b style={{ color: theme.text, fontSize: 13 }}>{caveTrips.length}</b> Befahrungen</span>
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
}
