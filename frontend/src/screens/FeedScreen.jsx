// Feed-Screen — CaveLog Calm: kompakte Karten, kein Cave-Art Hero
import { useState } from 'react';
import CLIcon from '../icons.jsx';
import { CLStars, CLChip, CLDifficulty, CLPhoto, CLfmt } from '../atoms.jsx';

export default function FeedScreen({ trips, caves = [], theme, prefs, onOpenTrip, loading }) {
  const layout   = prefs.layout   || 'cards';
  const diffMode = prefs.diffMode || 'bars';

  const [filter, setFilter] = useState('alle');
  const filters = [
    { k: 'alle',       l: 'Alle' },
    { k: 'vertikal',   l: 'Vertikal' },
    { k: 'horizontal', l: 'Horizontal' },
    { k: 'nass',       l: 'Nass' },
    { k: 'srt',        l: 'SRT' },
  ];

  const getCave = (id) => caves.find(c => c.id === id);

  const filtered = trips.filter(t => {
    if (filter === 'alle')       return true;
    if (filter === 'vertikal')   return t.type === 'Vertikal';
    if (filter === 'horizontal') return t.type === 'Horizontal';
    if (filter === 'nass')       return t.wet !== 'Trocken';
    if (filter === 'srt')        return t.rope === 'SRT';
    return true;
  });

  const byMonth = {};
  filtered.forEach(t => {
    const d   = new Date(t.date);
    const key = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(t);
  });

  const totalKm  = Math.round(trips.reduce((s, t) => s + (t.length || 0), 0) / 1000 * 10) / 10;
  const maxDepth = trips.length ? Math.max(...trips.map(t => t.depth || 0)) : 0;

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '18px 18px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: theme.textMute, textTransform: 'uppercase', marginBottom: 4 }}>
          Logbuch
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: 1.1, color: theme.text, letterSpacing: -0.6 }}>
          Befahrungen
        </h1>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, fontSize: 12, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
          <span>{trips.length} Eintr.</span>
          {totalKm  > 0 && <><span style={{ opacity: 0.4 }}>·</span><span>{totalKm} km</span></>}
          {maxDepth > 0 && <><span style={{ opacity: 0.4 }}>·</span><span>−{maxDepth} m max.</span></>}
        </div>
      </div>

      {/* Filter-Pills */}
      <div style={{ padding: '0 18px 10px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {filters.map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{
            appearance: 'none', cursor: 'pointer',
            padding: '6px 14px', borderRadius: 999,
            fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
            background: filter === f.k ? theme.accent : 'transparent',
            color:      filter === f.k ? theme.bg     : theme.textMute,
            border: `1px solid ${filter === f.k ? theme.accent : theme.border}`,
            whiteSpace: 'nowrap',
          }}>{f.l}</button>
        ))}
      </div>

      {loading && !trips.length && (
        <div style={{ padding: 40, textAlign: 'center', color: theme.textMute, fontSize: 13 }}>Lade…</div>
      )}

      {/* Cards */}
      {layout === 'cards' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(t => (
            <TripCard key={t.id} trip={t} cave={getCave(t.caveId)} theme={theme} diffMode={diffMode} onClick={() => onOpenTrip(t.id)} />
          ))}
        </div>
      )}

      {/* Compact */}
      {layout === 'compact' && (
        <div style={{ borderTop: `1px solid ${theme.border}` }}>
          {filtered.map(t => (
            <TripRowCompact key={t.id} trip={t} cave={getCave(t.caveId)} theme={theme} diffMode={diffMode} onClick={() => onOpenTrip(t.id)} />
          ))}
        </div>
      )}

      {/* Timeline */}
      {layout === 'timeline' && (
        <div style={{ padding: '0 18px' }}>
          {Object.entries(byMonth).map(([month, items]) => (
            <div key={month} style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: theme.textMute, padding: '12px 0 8px 26px', textTransform: 'uppercase' }}>
                {month}
              </div>
              <div style={{ position: 'relative', paddingLeft: 26 }}>
                <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1, background: theme.border }} />
                {items.map(t => (
                  <TripRowTimeline key={t.id} trip={t} cave={getCave(t.caveId)} theme={theme} diffMode={diffMode} onClick={() => onOpenTrip(t.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ padding: 40, textAlign: 'center', color: theme.textMute, fontSize: 13 }}>
          Keine Befahrungen passen zum Filter.
        </div>
      )}
    </div>
  );
}

// Kompakte Karte: 72×72 Foto links, Inhalt rechts
function TripCard({ trip, cave, theme, diffMode, onClick }) {
  return (
    <div onClick={onClick} className="cl-tap" style={{
      background: theme.bgCard, border: `1px solid ${theme.border}`,
      borderRadius: 12, cursor: 'pointer', padding: 16,
      display: 'flex', gap: 14,
    }}>
      <CLPhoto theme={theme} src={trip.cover_photo} width={72} height={72} radius={8} label="foto" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 11, color: theme.accent, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: 0.3 }}>
            {CLfmt.dateShort(trip.date)}
          </div>
          <CLStars value={trip.rating || 0} size={10} theme={theme} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {trip.title}
        </div>
        <div style={{ fontSize: 12, color: theme.textMute, lineHeight: 1.3 }}>
          {cave?.name} · <span style={{ color: theme.textDim }}>{cave?.region}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>−{trip.depth || 0}m</span>
            <span>{CLfmt.m(trip.length || 0)}</span>
            <span>{CLfmt.duration(trip.duration || 0)}</span>
          </div>
          <CLDifficulty diff={trip.difficulty || { t:1,k:1,p:1 }} mode={diffMode} theme={theme} size="sm" />
        </div>
      </div>
    </div>
  );
}

// Dichte Tabellenzeile
function TripRowCompact({ trip, cave, theme, diffMode, onClick }) {
  return (
    <div onClick={onClick} className="cl-tap" style={{
      padding: '18px 20px', borderBottom: `1px solid ${theme.border}`,
      cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center',
    }}>
      <div style={{ width: 44, flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: theme.text, lineHeight: 1 }}>
          {new Date(trip.date).getDate()}
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, color: theme.accent, textTransform: 'uppercase', marginTop: 3 }}>
          {new Date(trip.date).toLocaleDateString('de-DE', { month: 'short' }).replace('.', '')} · {String(new Date(trip.date).getFullYear()).slice(2)}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: theme.text, fontWeight: 600, lineHeight: 1.2, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {trip.title}
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
          <span style={{ fontFamily: 'Inter' }}>{cave?.name}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>−{trip.depth || 0}m</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{CLfmt.m(trip.length || 0)}</span>
        </div>
      </div>
      <CLDifficulty diff={trip.difficulty || { t:1,k:1,p:1 }} mode={diffMode} theme={theme} size="sm" />
    </div>
  );
}

// Timeline-Karte mit Punkt
function TripRowTimeline({ trip, cave, theme, diffMode, onClick }) {
  return (
    <div onClick={onClick} className="cl-tap" style={{ position: 'relative', padding: '8px 0 14px 18px', cursor: 'pointer' }}>
      <div style={{
        position: 'absolute', left: -19, top: 14,
        width: 9, height: 9, borderRadius: '50%',
        background: theme.bg, border: `1.5px solid ${theme.accent}`,
      }} />
      <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: theme.accent, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {CLfmt.date(trip.date)}
          </div>
          <CLStars value={trip.rating || 0} size={10} theme={theme} />
        </div>
        <div style={{ fontSize: 14, color: theme.text, fontWeight: 600, lineHeight: 1.2, marginBottom: 2 }}>{trip.title}</div>
        <div style={{ fontSize: 11, color: theme.textMute, marginBottom: 8 }}>{cave?.name}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: theme.textMute }}>
            <span>−{trip.depth || 0}m</span>
            <span>{CLfmt.m(trip.length || 0)}</span>
          </div>
          <CLDifficulty diff={trip.difficulty || { t:1,k:1,p:1 }} mode={diffMode} theme={theme} size="sm" />
        </div>
      </div>
    </div>
  );
}
