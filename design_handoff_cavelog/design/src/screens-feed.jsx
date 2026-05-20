// screens-feed.jsx — Feed/Liste aller Befahrungen

const CLFeedScreen = ({ trips, theme, tweaks, onOpenTrip, onNew }) => {
  const layout = tweaks.layout || 'cards';
  const diffMode = tweaks.diffMode || 'bars';

  const [filter, setFilter] = React.useState('alle');
  const filters = ['alle', 'vertikal', 'horizontal', 'nass', 'srt'];

  const filtered = trips.filter(t => {
    if (filter === 'alle') return true;
    if (filter === 'vertikal') return t.type === 'Vertikal';
    if (filter === 'horizontal') return t.type === 'Horizontal';
    if (filter === 'nass') return t.wet !== 'Trocken';
    if (filter === 'srt') return t.rope === 'SRT';
    return true;
  });

  // Gruppierung nach Monat für Timeline
  const byMonth = {};
  filtered.forEach(t => {
    const d = new Date(t.date);
    const key = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(t);
  });

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Hero / Header */}
      <div style={{
        padding: '20px 20px 16px',
        position: 'relative',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 3,
          color: theme.accent, textTransform: 'uppercase', marginBottom: 6,
        }}>
          Marco · Logbuch
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: 'Fraunces, serif',
          fontSize: 36,
          fontWeight: 500,
          lineHeight: 1.05,
          color: theme.text,
          letterSpacing: -0.5,
        }}>
          Ins Dunkel <span style={{ fontStyle: 'italic', color: theme.accent }}>gestiegen</span>
        </h1>
        <div style={{
          marginTop: 10,
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 12, color: theme.textMute,
        }}>
          <span><b style={{ color: theme.text, fontFamily: 'Fraunces', fontSize: 14 }}>{trips.length}</b> Befahrungen</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span><b style={{ color: theme.text, fontFamily: 'Fraunces', fontSize: 14 }}>{Math.round(trips.reduce((s,t)=>s+t.length,0)/1000*10)/10}</b> km</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span><b style={{ color: theme.text, fontFamily: 'Fraunces', fontSize: 14 }}>−{Math.max(...trips.map(t=>t.depth))}</b> m</span>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        padding: '2px 20px 14px',
        display: 'flex', gap: 6,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            appearance: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 14px',
            borderRadius: 999,
            fontSize: 12, fontWeight: 500,
            background: filter === f ? theme.accent : 'transparent',
            color: filter === f ? theme.bg : theme.textMute,
            border: `0.5px solid ${filter === f ? theme.accent : theme.border}`,
            whiteSpace: 'nowrap',
            textTransform: 'capitalize',
            fontFamily: 'inherit',
          }}>{f}</button>
        ))}
      </div>

      {/* Content */}
      {layout === 'cards' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((t, i) => (
            <TripCard key={t.id} trip={t} theme={theme} diffMode={diffMode} onClick={() => onOpenTrip(t.id)} index={i}/>
          ))}
        </div>
      )}

      {layout === 'compact' && (
        <div style={{ padding: '0 0 0 0' }}>
          {filtered.map(t => (
            <TripRowCompact key={t.id} trip={t} theme={theme} diffMode={diffMode} onClick={() => onOpenTrip(t.id)} />
          ))}
        </div>
      )}

      {layout === 'timeline' && (
        <div style={{ padding: '0 20px' }}>
          {Object.entries(byMonth).map(([month, items]) => (
            <div key={month}>
              <div style={{
                fontFamily: 'Fraunces, serif', fontSize: 14, fontStyle: 'italic',
                color: theme.textMute, padding: '10px 0 8px 28px',
                letterSpacing: 0.3,
              }}>{month}</div>
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                {/* rope line */}
                <div style={{
                  position: 'absolute', left: 9, top: 0, bottom: 0,
                  width: 1.5, background: `repeating-linear-gradient(to bottom, ${theme.rope} 0 3px, transparent 3px 6px)`,
                  opacity: 0.5,
                }}/>
                {items.map(t => (
                  <TripRowTimeline key={t.id} trip={t} theme={theme} diffMode={diffMode} onClick={() => onOpenTrip(t.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{
          padding: 40, textAlign: 'center', color: theme.textMute, fontSize: 13,
        }}>
          Keine Befahrungen passen zum Filter.
        </div>
      )}
    </div>
  );
};

// Trip-Card (vollbreite Karte mit Artwork)
const TripCard = ({ trip, theme, diffMode, onClick, index }) => {
  const cave = CL_getCave(trip.caveId);
  return (
    <div onClick={onClick} style={{
      background: theme.bgCard,
      border: `1px solid ${theme.border}`,
      borderRadius: 18,
      overflow: 'hidden',
      cursor: 'pointer',
      position: 'relative',
      transition: 'transform 0.12s',
    }}>
      {/* Artwork header */}
      <div style={{ position: 'relative' }}>
        <CLCaveArt variant={trip.heroIcon} seed={index + 1} theme={theme} height={120}/>
        {/* Rating badge top right */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(15, 11, 8, 0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: 999,
          padding: '4px 8px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <CLStars value={trip.rating} size={10} color={theme.accent}/>
        </div>
        {/* Date badge top left — stylized */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(15, 11, 8, 0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: 10,
          padding: '6px 10px',
          fontSize: 11,
          color: theme.text,
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 500,
          letterSpacing: 0.5,
        }}>
          {CLfmt.dateShort(trip.date)}
        </div>
        {/* photo badge bottom right */}
        {trip.photos > 0 && (
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(15, 11, 8, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999,
            padding: '4px 8px',
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, color: theme.text,
          }}>
            <CLIcon name="camera" size={11} color={theme.text}/>
            {trip.photos}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
          {cave.name.toUpperCase()}
        </div>
        <div style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 20,
          fontWeight: 500,
          color: theme.text,
          lineHeight: 1.15,
          marginBottom: 10,
        }}>
          {trip.title}
        </div>
        {/* Stats row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          paddingTop: 8, paddingBottom: 10,
          borderBottom: `1px solid ${theme.border}`,
          borderTop: `1px solid ${theme.border}`,
          margin: '0 0 10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CLIcon name="depth" size={12} color={theme.textMute}/>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: theme.text }}>
              −{trip.depth}m
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CLIcon name="length" size={12} color={theme.textMute}/>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: theme.text }}>
              {CLfmt.m(trip.length)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CLIcon name="clock" size={12} color={theme.textMute}/>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: theme.text }}>
              {CLfmt.duration(trip.duration)}
            </span>
          </div>
        </div>

        {/* Bottom — chips + difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <CLChip icon="rope" label={trip.rope} theme={theme} color={theme.rope} bg={theme.rope + '18'}/>
            <CLChip icon="drop" label={trip.wet} theme={theme}
              color={trip.wet === 'Nass' ? theme.wet : trip.wet === 'Trocken' ? theme.textMute : theme.wet}
              bg={(trip.wet === 'Nass' ? theme.wet : trip.wet === 'Trocken' ? theme.textMute : theme.wet) + '18'}/>
          </div>
          <CLDifficulty diff={trip.difficulty} mode={diffMode} theme={theme} size="sm"/>
        </div>
      </div>
    </div>
  );
};

// Kompakte Zeile
const TripRowCompact = ({ trip, theme, diffMode, onClick }) => {
  const cave = CL_getCave(trip.caveId);
  return (
    <div onClick={onClick} style={{
      padding: '14px 20px',
      borderBottom: `1px solid ${theme.border}`,
      cursor: 'pointer',
      display: 'flex', gap: 14, alignItems: 'center',
    }}>
      {/* Date block */}
      <div style={{
        width: 48, flexShrink: 0, textAlign: 'center',
        borderRight: `1px solid ${theme.border}`, paddingRight: 12,
      }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: theme.text, lineHeight: 1 }}>
          {new Date(trip.date).getDate()}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: theme.accent, textTransform: 'uppercase', marginTop: 2 }}>
          {new Date(trip.date).toLocaleDateString('de-DE', { month: 'short' }).replace('.', '')}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: theme.textMute, fontWeight: 600, letterSpacing: 0.4, marginBottom: 2 }}>
          {cave.name}
        </div>
        <div style={{
          fontFamily: 'Fraunces, serif', fontSize: 15, color: theme.text,
          fontWeight: 500, lineHeight: 1.2, marginBottom: 5,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {trip.title}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
          <span>−{trip.depth}m</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{CLfmt.m(trip.length)}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: theme.rope }}>{trip.rope}</span>
        </div>
      </div>
      <CLDifficulty diff={trip.difficulty} mode={diffMode} theme={theme} size="sm"/>
    </div>
  );
};

// Timeline-Zeile (mit Punkt)
const TripRowTimeline = ({ trip, theme, diffMode, onClick }) => {
  const cave = CL_getCave(trip.caveId);
  return (
    <div onClick={onClick} style={{
      position: 'relative',
      padding: '12px 0 18px 20px',
      cursor: 'pointer',
    }}>
      {/* node */}
      <div style={{
        position: 'absolute', left: -12 - 9, top: 18,
        width: 12, height: 12, borderRadius: '50%',
        background: theme.accent,
        boxShadow: `0 0 0 3px ${theme.bg}, 0 0 12px ${theme.accent}`,
      }}/>
      <div style={{
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.accent }}>
            {CLfmt.date(trip.date)}
          </div>
          <CLStars value={trip.rating} size={10} color={theme.accent}/>
        </div>
        <div style={{ fontSize: 11, color: theme.textMute, marginBottom: 3 }}>{cave.name}</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: theme.text, fontWeight: 500, lineHeight: 1.2, marginBottom: 10 }}>
          {trip.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: theme.textMute }}>
            <span>−{trip.depth}m</span>
            <span>{CLfmt.m(trip.length)}</span>
            <span>{CLfmt.duration(trip.duration)}</span>
          </div>
          <CLDifficulty diff={trip.difficulty} mode={diffMode} theme={theme} size="sm"/>
        </div>
      </div>
    </div>
  );
};

window.CLFeedScreen = CLFeedScreen;
