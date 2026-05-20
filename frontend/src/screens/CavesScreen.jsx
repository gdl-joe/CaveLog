// Höhlen-Verzeichnis — CaveLog Calm: einfache Listenzeilen
import { useState } from 'react';
import CLIcon from '../icons.jsx';
import { CLfmt } from '../atoms.jsx';

export default function CavesScreen({ theme, caves = [], trips = [], onOpenCave, loading }) {
  const [sort,    setSort]    = useState('Name');
  const [country, setCountry] = useState('alle');
  const [query,   setQuery]   = useState('');

  const sorts     = ['Name','Tiefe','Länge','Zuletzt'];
  const countries = ['alle','DE','AT','CH'];

  const typeIcon = (type) => {
    if (type === 'Vertikal')   return 'pit';
    if (type === 'Labyrinth')  return 'maze';
    if (type === 'Mixed')      return 'chamber';
    return 'tunnel';
  };

  const entriesFor = (id) => trips.filter(t => t.caveId === id).length || 0;

  let list = [...caves];
  if (country !== 'alle') list = list.filter(c => c.country === country);
  if (query.trim())        list = list.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.region ?? '').toLowerCase().includes(query.toLowerCase())
  );
  list.sort((a, b) => {
    if (sort === 'Name')    return a.name.localeCompare(b.name, 'de');
    if (sort === 'Tiefe')   return (b.depth  || 0) - (a.depth  || 0);
    if (sort === 'Länge')   return (b.length || 0) - (a.length || 0);
    return (b.entries || entriesFor(b.id)) - (a.entries || entriesFor(a.id));
  });

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '18px 18px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 4 }}>
          Verzeichnis
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: 1.1, color: theme.text, letterSpacing: -0.6 }}>
          Höhlen
        </h1>
        <div style={{ marginTop: 6, fontSize: 12, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
          {caves.length} Höhlen
        </div>
      </div>

      {/* Suche */}
      <div style={{ padding: '0 18px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px',
          background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 8,
        }}>
          <CLIcon name="search" size={15} color={theme.textMute} />
          <input placeholder="Suchen…" value={query} onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        </div>
      </div>

      {/* Filter */}
      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {countries.map(c => (
          <button key={c} onClick={() => setCountry(c)} style={{
            appearance: 'none', cursor: 'pointer', padding: '6px 12px',
            background: country === c ? theme.accent : 'transparent',
            color:      country === c ? theme.bg     : theme.text,
            border: `1px solid ${country === c ? theme.accent : theme.border}`,
            borderRadius: 999, fontSize: 11, fontWeight: 500, fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>{c}</button>
        ))}
        <div style={{ width: 1, background: theme.border, margin: '4px' }} />
        {sorts.map(s => (
          <button key={s} onClick={() => setSort(s)} style={{
            appearance: 'none', cursor: 'pointer', padding: '5px 11px',
            background: sort === s ? theme.bgCardHi : 'transparent',
            color:      sort === s ? theme.text     : theme.textMute,
            border: `1px solid ${sort === s ? theme.borderHi : theme.border}`,
            borderRadius: 6, fontSize: 11, fontWeight: 500, fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>{s}</button>
        ))}
      </div>

      {/* Liste */}
      {loading && !caves.length ? (
        <div style={{ padding: 40, textAlign: 'center', color: theme.textMute, fontSize: 13 }}>Lade…</div>
      ) : (
        <div style={{ borderTop: `1px solid ${theme.border}` }}>
          {list.map(c => {
            const count = c.entries || entriesFor(c.id);
            return (
              <div key={c.id} onClick={() => onOpenCave && onOpenCave(c.id)} className="cl-tap" style={{
                padding: '18px 20px', borderBottom: `1px solid ${theme.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                {/* Typ-Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: theme.bgSubtle, border: `1px solid ${theme.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CLIcon name={typeIcon(c.type)} size={18} color={theme.textMute} strokeWidth={1.4} />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMute, marginTop: 2 }}>
                    {c.region} · {c.country}
                  </div>
                </div>
                {/* Maße */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: theme.text, fontFamily: 'JetBrains Mono, monospace' }}>
                    −{c.depth || c.depth_m || 0}m
                  </div>
                  <div style={{ fontSize: 10, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
                    {CLfmt.m(c.length || c.length_m || 0)}
                  </div>
                </div>
                {/* Einträge-Badge */}
                <div style={{
                  padding: '3px 8px', borderRadius: 999,
                  background: theme.accentSoft, border: `1px solid ${theme.accent}33`,
                  fontSize: 10, color: theme.accent, fontFamily: 'JetBrains Mono, monospace',
                  flexShrink: 0, fontWeight: 600,
                }}>
                  {count}
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: theme.textMute, fontSize: 13 }}>
              Keine Höhlen gefunden.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
