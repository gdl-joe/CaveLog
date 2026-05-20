// screens-detail.jsx — Detail-Ansicht einer Befahrung

const CLDetailScreen = ({ trip, theme, tweaks, onBack }) => {
  const cave = CL_getCave(trip.caveId);
  const diffMode = tweaks.diffMode || 'bars';
  const [tab, setTab] = React.useState('bericht');

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 240 }}>
        <CLCaveArt variant={trip.heroIcon} seed={7} theme={theme} height={240}/>
        {/* gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to bottom, transparent 30%, ${theme.bg} 100%)`,
        }}/>
        {/* Back button */}
        <button onClick={onBack} style={{
          position: 'absolute', top: 14, left: 14,
          appearance: 'none', border: 'none',
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(15,11,8,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <CLIcon name="back" size={18} color={theme.text}/>
        </button>
        {/* More */}
        <button style={{
          position: 'absolute', top: 14, right: 14,
          appearance: 'none', border: 'none',
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(15,11,8,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <CLIcon name="more" size={18} color={theme.text}/>
        </button>

        {/* Title overlay */}
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <CLIcon name="pin" size={12} color={theme.accent}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.accent, letterSpacing: 0.5 }}>
              {cave.name} · {cave.region}
            </span>
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: 'Fraunces, serif',
            fontSize: 26, fontWeight: 500, lineHeight: 1.1,
            color: theme.text, letterSpacing: -0.3,
          }}>{trip.title}</h1>
        </div>
      </div>

      {/* Meta row */}
      <div style={{
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <MetaCell icon="calendar" label="Datum" value={CLfmt.date(trip.date)} theme={theme}/>
        <MetaCell icon="clock" label="Dauer" value={CLfmt.duration(trip.duration)} theme={theme} middle/>
        <MetaCell icon="star-filled" label="Bewertung" value={trip.rating + '/5'} theme={theme} right/>
      </div>

      {/* Key stats — hero trio */}
      <div style={{ padding: '18px 16px 4px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <StatLarge icon="depth" label="Tiefe" value={trip.depth} unit="m" prefix="−" theme={theme} accent={theme.accent}/>
        <StatLarge icon="length" label="Strecke" value={trip.length < 1000 ? trip.length : (trip.length/1000).toFixed(1)}
                   unit={trip.length < 1000 ? 'm' : 'km'} theme={theme} accent={theme.accent}/>
        <StatLarge icon="clock" label="Start" value={trip.start.replace(':', '·')} unit="" theme={theme} accent={theme.accent} mono/>
      </div>

      {/* Chips row */}
      <div style={{ padding: '14px 20px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <CLChip icon="caves" label={trip.type} theme={theme}/>
        <CLChip icon="rope" label={trip.rope} theme={theme} color={theme.rope} bg={theme.rope + '18'}/>
        <CLChip icon="drop" label={trip.wet} theme={theme} color={theme.wet} bg={theme.wet + '18'}/>
        <CLChip icon="weather" label={trip.weather.split(',')[0]} theme={theme} color={theme.textMute} bg={theme.bgCard}/>
      </div>

      {/* Difficulty panel */}
      <div style={{ padding: '10px 20px 4px' }}>
        <div style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          padding: '14px 16px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2,
            color: theme.textMute, textTransform: 'uppercase', marginBottom: 12,
          }}>Schwierigkeit (T · K · P)</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CLDifficulty diff={trip.difficulty} mode={diffMode} theme={theme} size="md"/>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        marginTop: 18,
        padding: '0 20px',
        display: 'flex', gap: 18,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        {['bericht', 'fotos', 'team', 'gefahren'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            appearance: 'none', border: 'none', background: 'transparent',
            padding: '10px 0 12px',
            color: tab === t ? theme.accent : theme.textMute,
            fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
            textTransform: 'uppercase', cursor: 'pointer',
            borderBottom: `2px solid ${tab === t ? theme.accent : 'transparent'}`,
            marginBottom: -1, fontFamily: 'inherit',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 20px 20px' }}>
        {tab === 'bericht' && (
          <div style={{
            fontFamily: 'Fraunces, serif', fontSize: 15, lineHeight: 1.6,
            color: theme.text, fontWeight: 400,
          }}>
            <p style={{ margin: '0 0 14px' }}>
              <span style={{
                fontSize: 32, float: 'left', lineHeight: 0.9,
                marginRight: 6, marginTop: 4, color: theme.accent, fontWeight: 600,
              }}>
                {trip.notes.charAt(0)}
              </span>
              {trip.notes.slice(1)}
            </p>
            <div style={{
              marginTop: 18, padding: '12px 14px',
              background: theme.bgCard, borderRadius: 10,
              borderLeft: `3px solid ${theme.accent}`,
              fontFamily: 'Inter', fontSize: 12, color: theme.textMute,
            }}>
              <div style={{ fontWeight: 600, color: theme.text, marginBottom: 4, letterSpacing: 0.3 }}>
                Wetter & Bedingungen
              </div>
              {trip.weather}
            </div>
          </div>
        )}

        {tab === 'fotos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {Array.from({ length: trip.photos }).slice(0, 12).map((_, i) => (
              <div key={i} style={{
                aspectRatio: '1',
                background: theme.bgCard,
                borderRadius: 6,
                overflow: 'hidden',
                position: 'relative',
              }}>
                <CLCaveArt variant={['pit','tunnel','chamber','ice'][i%4]} seed={i+1} theme={theme} height={110}/>
              </div>
            ))}
            {trip.photos > 12 && (
              <div style={{
                aspectRatio: '1', background: theme.bgCard, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: theme.accent, fontWeight: 600, fontSize: 14,
              }}>+{trip.photos - 12}</div>
            )}
          </div>
        )}

        {tab === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trip.team.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: theme.bgCard, borderRadius: 12,
                border: `1px solid ${theme.border}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.rope})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: theme.bg, fontWeight: 700, fontSize: 13,
                  fontFamily: 'Fraunces, serif',
                }}>
                  {p.split(' ').map(x => x[0]).join('')}
                </div>
                <div style={{ fontSize: 14, color: theme.text, fontWeight: 500 }}>{p}</div>
              </div>
            ))}
            <div style={{
              marginTop: 10,
              fontSize: 10, fontWeight: 700, letterSpacing: 2,
              color: theme.textMute, textTransform: 'uppercase', marginBottom: 6,
            }}>Ausrüstung</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {trip.gear.map((g, i) => (
                <CLChip key={i} icon="gear" label={g} theme={theme} color={theme.textMute} bg={theme.bgCard}/>
              ))}
            </div>
          </div>
        )}

        {tab === 'gefahren' && (
          <div>
            {trip.hazards.length === 0 ? (
              <div style={{
                padding: 20, textAlign: 'center',
                color: theme.textMute, fontStyle: 'italic',
                fontFamily: 'Fraunces, serif', fontSize: 14,
              }}>
                Keine besonderen Vorkommnisse.
              </div>
            ) : trip.hazards.map((h, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '12px 14px', marginBottom: 8,
                background: theme.danger + '14', borderRadius: 10,
                border: `1px solid ${theme.danger}30`,
              }}>
                <CLIcon name="warning" size={16} color={theme.danger}/>
                <div style={{ flex: 1, fontSize: 13, color: theme.text, lineHeight: 1.4 }}>{h}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MetaCell = ({ icon, label, value, theme, middle, right }) => (
  <div style={{
    padding: '2px 8px',
    borderLeft: middle || right ? `1px solid ${theme.border}` : 'none',
    textAlign: right ? 'right' : middle ? 'center' : 'left',
  }}>
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
      color: theme.textMute, textTransform: 'uppercase', marginBottom: 4,
    }}>{label}</div>
    <div style={{ fontSize: 12, color: theme.text, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
      {value}
    </div>
  </div>
);

const StatLarge = ({ icon, label, value, unit, prefix, theme, accent, mono }) => (
  <div style={{
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    padding: '14px 10px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: -10, right: -10, opacity: 0.08,
    }}>
      <CLIcon name={icon} size={60} color={accent}/>
    </div>
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
      color: theme.textMute, textTransform: 'uppercase', marginBottom: 4,
    }}>{label}</div>
    <div style={{
      fontFamily: mono ? 'JetBrains Mono, monospace' : 'Fraunces, serif',
      fontSize: 22, fontWeight: 600, color: theme.text, lineHeight: 1,
    }}>
      {prefix}{value}
      {unit && <span style={{ fontSize: 11, color: theme.textMute, fontFamily: 'Inter', fontWeight: 500, marginLeft: 2 }}>{unit}</span>}
    </div>
  </div>
);

window.CLDetailScreen = CLDetailScreen;
