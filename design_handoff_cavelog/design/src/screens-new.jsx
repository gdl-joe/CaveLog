// screens-new.jsx — Neue Befahrung anlegen (Formular, mehrstufig)

const CLNewScreen = ({ theme, tweaks, onClose }) => {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    caveMode: 'new',       // 'new' | 'existing' — Standard: neue Höhle
    caveId: null,          // bei existing
    newCaveName: '',       // bei new
    newCaveRegion: '',
    newCaveCountry: 'DE',
    newCaveType: 'Horizontal',
    newCaveCoords: '',
    title: '',
    date: '2026-04-23',
    start: '09:00',
    end: '14:00',
    type: 'Horizontal',
    wet: 'Trocken',
    rope: 'Ohne',
    diff: { t: 2, k: 2, p: 1 },
    rating: 0,
    depth: 0,
    length: 0,
    notes: '',
    team: [],
    photos: [],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalSteps = 4;
  return (
    <div style={{ paddingBottom: 110 }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          appearance: 'none', border: 'none', background: 'transparent',
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
          color: theme.textMute, fontSize: 13, fontFamily: 'inherit',
        }}>
          <CLIcon name="close" size={18} color={theme.textMute}/>
          <span>Abbrechen</span>
        </button>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
          color: theme.textMute, textTransform: 'uppercase',
        }}>
          Schritt {step} / {totalSteps}
        </div>
      </div>

      {/* Progress rope */}
      <div style={{ padding: '0 20px 18px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(n => (
            <div key={n} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: n <= step ? theme.accent : theme.border,
              transition: 'background 0.3s',
            }}/>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: theme.accent, textTransform: 'uppercase', marginBottom: 6 }}>
          Neue Befahrung
        </div>
        <h1 style={{
          margin: 0, fontFamily: 'Fraunces, serif',
          fontSize: 28, fontWeight: 500, color: theme.text, letterSpacing: -0.3,
        }}>
          {step === 1 && <>Wo war's?</>}
          {step === 2 && <>Wann & wie?</>}
          {step === 3 && <>Wie schwer war's?</>}
          {step === 4 && <>Erzähl davon.</>}
        </h1>
      </div>

      <div style={{ padding: '0 20px' }}>
        {step === 1 && <StepLocation form={form} set={set} theme={theme}/>}
        {step === 2 && <StepConditions form={form} set={set} theme={theme}/>}
        {step === 3 && <StepDifficulty form={form} set={set} theme={theme} diffMode={tweaks.diffMode}/>}
        {step === 4 && <StepNotes form={form} set={set} theme={theme}/>}
      </div>

      {/* Footer actions */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 64,
        padding: '10px 16px',
        background: `linear-gradient(to top, ${theme.bg} 70%, transparent)`,
        display: 'flex', gap: 8,
      }}>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} style={{
            flex: 1, appearance: 'none',
            padding: '14px', borderRadius: 14,
            background: 'transparent', border: `1px solid ${theme.border}`,
            color: theme.text, fontWeight: 600, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Zurück</button>
        )}
        <button onClick={() => step < totalSteps ? setStep(step+1) : onClose()} style={{
          flex: 2, appearance: 'none', border: 'none',
          padding: '14px', borderRadius: 14,
          background: theme.accent, color: theme.bg,
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: 'inherit', letterSpacing: 0.3,
        }}>
          {step < totalSteps ? 'Weiter' : 'Eintrag speichern'}
          <CLIcon name={step < totalSteps ? 'chevron-right' : 'check'} size={16} color={theme.bg} strokeWidth={2.2}/>
        </button>
      </div>
    </div>
  );
};

// Step 1 — Cave + Title (Standard: NEUE Höhle, optional existierende wählen)
const StepLocation = ({ form, set, theme }) => {
  const isNew = form.caveMode === 'new';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Mode switch */}
      <div style={{
        display: 'flex', background: theme.bgCard,
        border: `1px solid ${theme.border}`, borderRadius: 12,
        padding: 3, gap: 2,
      }}>
        <button onClick={() => set('caveMode', 'new')} style={{
          flex: 1, appearance: 'none', border: 'none', cursor: 'pointer',
          padding: '10px 8px', borderRadius: 9,
          background: isNew ? theme.accent : 'transparent',
          color: isNew ? theme.bg : theme.textMute,
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          letterSpacing: 0.3,
        }}>
          <CLIcon name="plus" size={13} color={isNew ? theme.bg : theme.textMute} strokeWidth={2.2}/>
          Neue Höhle
        </button>
        <button onClick={() => set('caveMode', 'existing')} style={{
          flex: 1, appearance: 'none', border: 'none', cursor: 'pointer',
          padding: '10px 8px', borderRadius: 9,
          background: !isNew ? theme.accent : 'transparent',
          color: !isNew ? theme.bg : theme.textMute,
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          letterSpacing: 0.3,
        }}>
          <CLIcon name="caves" size={13} color={!isNew ? theme.bg : theme.textMute} strokeWidth={2}/>
          Bereits befahren
        </button>
      </div>

      {isNew ? (
        <>
          <FormLabel label="Name der Höhle" theme={theme}/>
          <input
            type="text" placeholder="z.B. Blauhöhle"
            value={form.newCaveName} onChange={e => set('newCaveName', e.target.value)}
            autoFocus
            style={{
              marginTop: -10, appearance: 'none', width: '100%',
              padding: '14px 14px', background: theme.bgCard,
              border: `1px solid ${theme.border}`, borderRadius: 12,
              color: theme.text, fontSize: 16,
              fontFamily: 'Fraunces, serif', fontWeight: 500, outline: 'none',
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <div>
              <FormLabel label="Region" theme={theme}/>
              <input
                type="text" placeholder="z.B. Schwäbische Alb"
                value={form.newCaveRegion} onChange={e => set('newCaveRegion', e.target.value)}
                style={{
                  marginTop: 6, appearance: 'none', width: '100%',
                  padding: '12px 14px', background: theme.bgCard,
                  border: `1px solid ${theme.border}`, borderRadius: 12,
                  color: theme.text, fontSize: 13,
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
            <div>
              <FormLabel label="Land" theme={theme}/>
              <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                {['DE', 'AT', 'CH'].map(c => (
                  <button key={c} onClick={() => set('newCaveCountry', c)} style={{
                    flex: 1, appearance: 'none', cursor: 'pointer',
                    padding: '12px 4px', borderRadius: 10,
                    background: form.newCaveCountry === c ? theme.accentSoft : theme.bgCard,
                    border: `1px solid ${form.newCaveCountry === c ? theme.accent : theme.border}`,
                    color: form.newCaveCountry === c ? theme.accent : theme.text,
                    fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  }}>{c}</button>
                ))}
              </div>
            </div>
          </div>
          <FormLabel label="Eingang auf Karte wählen" theme={theme}/>
          <div style={{ marginTop: -10 }}>
            <div style={{ height: 220, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, position: 'relative' }}>
              <CLMapyMap
                center={form.pickedCoords ? [form.pickedCoords.lat, form.pickedCoords.lng] : [48.5, 11]}
                zoom={form.pickedCoords ? 13 : 6}
                pickedCoords={form.pickedCoords}
                theme={theme}
                onMapClick={(c) => {
                  set('pickedCoords', c);
                  set('newCaveCoords', `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
                }}
              />
              <div style={{
                position: 'absolute', bottom: 8, left: 8, zIndex: 500,
                padding: '5px 10px', borderRadius: 8,
                background: 'rgba(15,11,8,0.82)', backdropFilter: 'blur(8px)',
                color: theme.textMute, fontSize: 10, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 4,
                pointerEvents: 'none',
              }}>
                <CLIcon name="pin" size={10} color={theme.accent}/>
                Auf Karte tippen, um Eingang zu setzen
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input
                type="text" placeholder="48.4850, 9.5530"
                value={form.newCaveCoords}
                onChange={e => {
                  set('newCaveCoords', e.target.value);
                  const m = e.target.value.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
                  if (m) set('pickedCoords', { lat: parseFloat(m[1]), lng: parseFloat(m[2]) });
                }}
                style={{
                  flex: 1, appearance: 'none',
                  padding: '10px 12px', background: theme.bgCard,
                  border: `1px solid ${theme.border}`, borderRadius: 10,
                  color: theme.text, fontSize: 12,
                  fontFamily: 'JetBrains Mono, monospace', outline: 'none',
                }}
              />
              <button onClick={() => {
                if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    set('pickedCoords', c);
                    set('newCaveCoords', `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
                  },
                  () => {}
                );
              }} style={{
                appearance: 'none', border: `1px solid ${theme.border}`,
                background: theme.bgCard, borderRadius: 10, padding: '0 14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                color: theme.accent, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              }}>
                <CLIcon name="pin" size={13} color={theme.accent}/>
                Hier
              </button>
            </div>
          </div>
          <FormLabel label="Höhlentyp" theme={theme}/>
          <Segmented options={['Horizontal', 'Vertikal', 'Labyrinth', 'Mixed']}
            value={form.newCaveType} onChange={v => set('newCaveType', v)} theme={theme}/>
        </>
      ) : (
        <>
          <FormLabel label="Aus Verzeichnis wählen" theme={theme}/>
          <div style={{ marginTop: -10, display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', background: theme.bgCard,
            border: `1px solid ${theme.border}`, borderRadius: 12,
          }}>
            <CLIcon name="search" size={14} color={theme.textMute}/>
            <input placeholder="Höhle suchen…" style={{
              flex: 1, appearance: 'none', background: 'transparent', border: 'none',
              color: theme.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
            }}/>
          </div>
          <div style={{ marginTop: -10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CL_CAVES.slice(0, 4).map(c => (
              <button key={c.id} onClick={() => set('caveId', c.id)} style={{
                appearance: 'none', textAlign: 'left',
                padding: '12px 14px', borderRadius: 12,
                background: form.caveId === c.id ? theme.accentSoft : theme.bgCard,
                border: `1px solid ${form.caveId === c.id ? theme.accent : theme.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'inherit',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: form.caveId === c.id ? theme.accent : 'transparent',
                  border: `1.5px solid ${form.caveId === c.id ? theme.accent : theme.border}`,
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: theme.textMute, fontSize: 11 }}>{c.region} · {c.entries}× befahren</div>
                </div>
                <CLIcon name="chevron-right" size={14} color={theme.textMute}/>
              </button>
            ))}
          </div>
        </>
      )}

      <FormLabel label="Titel / Tourbezeichnung" theme={theme}/>
      <input
        type="text" placeholder="z.B. Abstieg zum Schwarzen See"
        value={form.title} onChange={e => set('title', e.target.value)}
        style={{
          marginTop: -10,
          appearance: 'none', width: '100%',
          padding: '14px 14px',
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          color: theme.text, fontSize: 15,
          fontFamily: 'Fraunces, serif', fontWeight: 500,
          outline: 'none',
        }}
      />
    </div>
  );
};

// Step 2
const StepConditions = ({ form, set, theme }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      <TimeField label="Datum" value={form.date} theme={theme} icon="calendar"/>
      <TimeField label="Start" value={form.start} theme={theme} icon="clock"/>
      <TimeField label="Ende" value={form.end} theme={theme} icon="clock"/>
    </div>
    <FormLabel label="Höhlentyp" theme={theme}/>
    <Segmented options={['Horizontal', 'Vertikal', 'Labyrinth', 'Mixed']} value={form.type} onChange={v => set('type', v)} theme={theme}/>
    <FormLabel label="Wasser" theme={theme}/>
    <Segmented options={['Trocken', 'Teilweise', 'Nass']} value={form.wet} onChange={v => set('wet', v)} theme={theme}/>
    <FormLabel label="Seiltechnik" theme={theme}/>
    <Segmented options={['Ohne', 'Mit Seil', 'SRT']} value={form.rope} onChange={v => set('rope', v)} theme={theme}/>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
      <NumField label="Tiefe erreicht" unit="m" value={form.depth} onChange={v => set('depth', v)} theme={theme} icon="depth"/>
      <NumField label="Strecke" unit="m" value={form.length} onChange={v => set('length', v)} theme={theme} icon="length"/>
    </div>
  </div>
);

// Step 3 — Difficulty sliders
const StepDifficulty = ({ form, set, theme, diffMode }) => {
  const axes = [
    { key: 't', label: 'Technisch', hint: 'Kletterstellen, SRT-Passagen, Engstellen', color: theme.accent },
    { key: 'k', label: 'Körperlich', hint: 'Dauer, Gewicht, Schwimmstrecken', color: theme.rope },
    { key: 'p', label: 'Psychisch', hint: 'Ausgesetztheit, Orientierung, Enge', color: theme.wet },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {axes.map(a => (
        <div key={a.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div>
              <div style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{a.label}</div>
              <div style={{ color: theme.textMute, fontSize: 11, marginTop: 2 }}>{a.hint}</div>
            </div>
            <div style={{
              fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600,
              color: a.color, lineHeight: 1,
            }}>{form.diff[a.key]}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => set('diff', { ...form.diff, [a.key]: n })} style={{
                flex: 1, height: 36, appearance: 'none', border: 'none',
                background: n <= form.diff[a.key] ? a.color : theme.bgCard,
                borderRadius: 8, cursor: 'pointer',
                color: n <= form.diff[a.key] ? theme.bg : theme.textMute,
                fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                transition: 'background 0.12s',
              }}>{n}</button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <FormLabel label="Persönliche Bewertung" theme={theme}/>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => set('rating', n)} style={{
              appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
              padding: 4,
            }}>
              <CLIcon name={n <= form.rating ? 'star-filled' : 'star'} size={30}
                color={n <= form.rating ? theme.accent : theme.border} strokeWidth={1.4}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Step 4
const StepNotes = ({ form, set, theme }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <FormLabel label="Bericht / Notizen" theme={theme}/>
    <textarea
      placeholder="Erzähl, was du erlebt hast…"
      value={form.notes} onChange={e => set('notes', e.target.value)}
      rows={6}
      style={{
        marginTop: -10,
        appearance: 'none', width: '100%', resize: 'vertical',
        padding: '14px', background: theme.bgCard,
        border: `1px solid ${theme.border}`, borderRadius: 12,
        color: theme.text, fontSize: 14, lineHeight: 1.5,
        fontFamily: 'Fraunces, serif', outline: 'none',
      }}
    />
    <FormLabel label="Begleiter" theme={theme}/>
    <div style={{ marginTop: -10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {['Lena R.', 'Marco K.', 'Tobi F.', 'Anna S.', 'Ilse B.'].map(p => {
        const active = form.team.includes(p);
        return (
          <button key={p} onClick={() => set('team', active ? form.team.filter(x => x !== p) : [...form.team, p])} style={{
            appearance: 'none', padding: '8px 12px', borderRadius: 999,
            background: active ? theme.accentSoft : theme.bgCard,
            border: `1px solid ${active ? theme.accent : theme.border}`,
            color: active ? theme.accent : theme.text,
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            {active && '✓ '}{p}
          </button>
        );
      })}
    </div>
    <FormLabel label="Fotos" theme={theme}/>
    <div style={{ marginTop: -10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
      <button style={{
        aspectRatio: '1', appearance: 'none',
        border: `1.5px dashed ${theme.border}`, borderRadius: 10,
        background: 'transparent', color: theme.accent,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CLIcon name="camera" size={22} color={theme.accent}/>
      </button>
      {[0,1,2].map(i => (
        <div key={i} style={{
          aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
          background: theme.bgCard, border: `1px solid ${theme.border}`,
        }}>
          <CLCaveArt variant={['tunnel','chamber','pit'][i]} seed={i+3} theme={theme} height={80}/>
        </div>
      ))}
    </div>
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', background: theme.bgCard,
      border: `1px solid ${theme.border}`, borderRadius: 12,
      cursor: 'pointer',
    }}>
      <CLIcon name="globe" size={16} color={theme.textMute}/>
      <div style={{ flex: 1 }}>
        <div style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>Öffentlich freigeben</div>
        <div style={{ color: theme.textMute, fontSize: 11 }}>Für andere Betrachter sichtbar</div>
      </div>
      <div style={{
        width: 36, height: 20, borderRadius: 10,
        background: theme.border, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: 2,
          width: 16, height: 16, borderRadius: '50%', background: theme.text,
        }}/>
      </div>
    </label>
  </div>
);

const FormLabel = ({ label, theme }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: 2,
    color: theme.textMute, textTransform: 'uppercase',
  }}>{label}</div>
);

const Segmented = ({ options, value, onChange, theme }) => (
  <div style={{ marginTop: -10, display: 'flex', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
    {options.map(o => (
      <button key={o} onClick={() => onChange(o)} style={{
        flex: 1, appearance: 'none', border: 'none',
        padding: '8px 8px', borderRadius: 8,
        background: value === o ? theme.accent : 'transparent',
        color: value === o ? theme.bg : theme.textMute,
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'inherit',
      }}>{o}</button>
    ))}
  </div>
);

const TimeField = ({ label, value, theme, icon }) => (
  <div style={{
    background: theme.bgCard, border: `1px solid ${theme.border}`,
    borderRadius: 12, padding: '10px 10px 10px 10px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
      <CLIcon name={icon} size={11} color={theme.textMute}/>
      <span style={{ fontSize: 9, letterSpacing: 1, fontWeight: 700, color: theme.textMute, textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', color: theme.text, fontSize: 13, fontWeight: 600 }}>
      {value}
    </div>
  </div>
);

const NumField = ({ label, unit, value, onChange, theme, icon }) => (
  <div style={{
    background: theme.bgCard, border: `1px solid ${theme.border}`,
    borderRadius: 12, padding: '10px 12px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
      <CLIcon name={icon} size={11} color={theme.textMute}/>
      <span style={{ fontSize: 9, letterSpacing: 1, fontWeight: 700, color: theme.textMute, textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <input
        type="number" value={value} onChange={e => onChange(Number(e.target.value))}
        style={{
          appearance: 'none', border: 'none', background: 'transparent',
          color: theme.text, fontSize: 18, fontWeight: 600,
          fontFamily: 'Fraunces, serif', width: '70%', outline: 'none', padding: 0,
        }}
      />
      <span style={{ color: theme.textMute, fontSize: 11 }}>{unit}</span>
    </div>
  </div>
);

window.CLNewScreen = CLNewScreen;
