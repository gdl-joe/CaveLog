// Leaflet + Mapy.cz Karte — wiederverwendbar für Map-Screen und New-Screen
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet Default-Icon-Bug-Fix für Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

// API-Key aus Vite .env oder window (PHP-injiziert)
const getApiKey = () =>
  import.meta.env.VITE_MAPY_API_KEY ||
  (typeof window !== 'undefined' && window.__MAPY_API_KEY) ||
  '';

/**
 * Props:
 *   center     [lat, lng]  Karten-Mittelpunkt
 *   zoom       number      Zoom-Level
 *   pins       [{id, lat, lng, label}]  Höhlen-Pins
 *   onPinClick (pin) => void
 *   onMapClick ({lat, lng}) => void  (für Koordinaten-Picker)
 *   pickedCoords  {lat, lng}  Ausgewählter Punkt (Picker-Marker)
 *   theme      CaveLog-Theme-Objekt
 *   height     string | number
 */
export default function CLMapyMap({
  center = [48.5, 11],
  zoom = 6,
  pins = [],
  onPinClick,
  onMapClick,
  pickedCoords,
  theme,
  height = '100%',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickMarkerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const apiKey = getApiKey();

  // Karte initialisieren
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center, zoom, zoomControl: false, attributionControl: true,
    });

    if (apiKey) {
      L.tileLayer(
        `https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${apiKey}`,
        {
          minZoom: 0, maxZoom: 19,
          attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
          crossOrigin: true,
        }
      ).addTo(map);
    } else {
      // Fallback: OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
    }

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    if (onMapClick) {
      map.on('click', (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }));
    }

    setReady(true);

    // Leaflet liest die Container-Größe beim Init — nach CSS-Layout-Berechnung
    // nochmal erzwingen, damit keine Verzerrung entsteht
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);

    // Bei jeder Größenänderung des Containers (Tab-Wechsel etc.) neu messen
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(containerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pins rendern
  useEffect(() => {
    if (!ready || !markersLayerRef.current) return;
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
  }, [ready, pins, theme.accent, theme.bgCard, onPinClick]);

  // Picker-Marker
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    if (pickMarkerRef.current) {
      mapRef.current.removeLayer(pickMarkerRef.current);
      pickMarkerRef.current = null;
    }

    if (pickedCoords) {
      const html = `
        <div style="position:relative;transform:translate(-50%,-50%);">
          <div style="width:18px;height:18px;border-radius:50%;background:${theme.accent};border:3px solid ${theme.bg};box-shadow:0 0 0 2px ${theme.accent},0 0 20px ${theme.accent};"></div>
        </div>`;
      const icon = L.divIcon({ html, className: 'cl-pick', iconSize: [18, 18], iconAnchor: [9, 9] });
      pickMarkerRef.current = L.marker([pickedCoords.lat, pickedCoords.lng], { icon }).addTo(mapRef.current);
      mapRef.current.setView([pickedCoords.lat, pickedCoords.lng], mapRef.current.getZoom());
    }
  }, [ready, pickedCoords, theme.accent, theme.bg]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 14, overflow: 'hidden', background: theme.bgElev }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: theme.textMute, fontSize: 12, background: theme.bgElev,
        }}>
          Karte lädt…
        </div>
      )}

      {!apiKey && ready && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 400,
          padding: '6px 10px', borderRadius: 8,
          background: 'rgba(232, 85, 58, 0.92)', color: '#fff',
          fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          ⚠ VITE_MAPY_API_KEY fehlt — .env setzen
        </div>
      )}
    </div>
  );
}
