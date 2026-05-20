// screens-new.jsx — 4-Schritt-Flow, ruhig

const CLNewScreen = ({ theme, tweaks, onClose }) => {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    caveMode: 'existing', caveId: 'falkensteiner',
    newCave: { name: '', region: '', country: 'DE', depth: '', length: '', type: 'Horizontal', year: '', lat: '', lng: '' },
    date: '2026-04-25', start: '09:00', end: '14:00',
    type: 'Horizontal', wet: 'Trocken', rope: 'Ohne',
    team: [], gear: [], hazards: '',
    notes: '',
  });

  const next = () => setStep(s => Math.min(s + 1, 3));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onClose} style={{
          appearance: 'none', border: 'none', background: 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 6,
        }}>
          <CLIcon name="close" size={20} color={theme.text}/>
        </button>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Neue Befahrung</div>
        <div style={{ width: 32 }}/>
      </div>

      {/* Stepper */}
      <div style={{ padding: '14px 16px 8px', display: 'flex', gap: 6 }}>
        {['Höhle','Zeit','Team','Notiz'].map((l, i) => (
          <div key={l} style={{ flex: 1 }}>
            <div style={{
              height: 3, borderRadius: 2,
              background: i <= step ? theme.text : theme.border,
              marginBottom: 6,
            }}/>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: i === step ? theme.text : theme.textMute,
            }}>
              {String(i+1).padStart(2,'0')} · {l}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="cl-scroll" style={{ flex: 1, overflow: 'auto', padding: '8px 16px 80px' }}>
        {step === 0 && <Step1Cave form={form} set={set} theme={theme}/>}
        {step === 1 && <Step2Time form={form} set={set} theme={theme}/>}
        {step === 2 && <Step3Team form={form} set={set} theme={theme}/>}
        {step === 3 && <Step4Notes form={form} set={set} theme={theme}/>}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${theme.border}`,
        background: theme.bg,
        display: 'flex', gap: 8,
      }}>
        {step > 0 && (
          <button onClick={prev} style={{
            flex: 1, padding: '12px 14px', appearance: 'none', cursor: 'pointer',
            background: 'transparent', color: theme.text,
            border: `1px solid ${theme.border}`, borderRadius: 8,
            fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
          }}>Zurück</button>
        )}
        <button onClick={step < 3 ? next : onClose} style={{
          flex: 2, padding: '12px 14px', appearance: 'none', cursor: 'pointer',
          background: theme.text, color: theme.bg,
          border: `1px solid ${theme.text}`, borderRadius: 8,
          fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        }}>
          {step < 3 ? 'Weiter' : 'Speichern'}
        </button>
      </div>
    </div>
  );
};

const FieldLabel = ({ children, theme }) => (
  <div style={{
    fontSize: 10, fontWeight: 600, letterSpacing: 0.8,
    textTransform: 'uppercase', color: theme.textMute, marginBottom: 6,
  }}>{children}</div>
);

const Input = ({ value, onChange, placeholder, theme, mono = false, type = 'text' }) => (
  <input value={value || ''} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} type={type}
    style={{
      width: '100%', padding: '10px 12px',
      border: `1px solid ${theme.border}`,
      background: theme.bgCard, color: theme.text,
      borderRadius: 8, fontSize: 14,
      fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter',
      outline: 'none', boxSizing: 'border-box',
    }}/>
);

const SegOptions = ({ value, options, onChange, theme }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {options.map(o => (
      <button key={o} onClick={() => onChange(o)} style={{
        appearance: 'none', cursor: 'pointer', padding: '7px 12px',
        background: value === o ? theme.text : 'transparent',
        color: value === o ? theme.bg : theme.text,
        border: `1px solid ${value === o ? theme.text : theme.border}`,
        borderRadius: 6, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
      }}>{o}</button>
    ))}
  </div>
);

const Step1Cave = ({ form, set, theme }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div>
      <FieldLabel theme={theme}>Quelle</FieldLabel>
      <SegOptions value={form.caveMode} options={['existing','new']}
        onChange={v => set('caveMode', v)} theme={theme}/>
    </div>

    {form.caveMode === 'existing' ? (
      <div>
        <FieldLabel theme={theme}>Höhle wählen</FieldLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CL_CAVES.map(c => (
            <button key={c.id} onClick={() => set('caveId', c.id)} style={{
              appearance: 'none', cursor: 'pointer',
              padding: '10px 12px', textAlign: 'left',
              background: form.caveId === c.id ? theme.bgCardHi : theme.bgCard,
              border: `1px solid ${form.caveId === c.id ? theme.borderHi : theme.border}`,
              borderRadius: 8, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: theme.textMute, marginTop: 1 }}>{c.region}</div>
              </div>
              <div style={{ fontSize: 11, color: theme.textMute, fontFamily: 'JetBrains Mono, monospace' }}>
                −{c.depth}m
              </div>
            </button>
          ))}
        </div>
      </div>
    ) : (
      <>
        <div>
          <FieldLabel theme={theme}>Name</FieldLabel>
          <Input theme={theme} value={form.newCave.name}
            onChange={v => set('newCave', { ...form.newCave, name: v })}
            placeholder="z.B. Eishöhle am Hang"/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
          <div>
            <FieldLabel theme={theme}>Region</FieldLabel>
            <Input theme={theme} value={form.newCave.region}
              onChange={v => set('newCave', { ...form.newCave, region: v })}/>
          </div>
          <div>
            <FieldLabel theme={theme}>Land</FieldLabel>
            <Input theme={theme} value={form.newCave.country}
              onChange={v => set('newCave', { ...form.newCave, country: v })}/>
          </div>
        </div>
        <div>
          <FieldLabel theme={theme}>Karte (Mapy.cz)</FieldLabel>
          <div style={{
            height: 180, background: theme.bgSubtle,
            border: `1px solid ${theme.border}`, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: theme.textDim, fontFamily: 'JetBrains Mono, monospace',
            position: 'relative',
          }}>
            <span>Karte · Tap zum Pin setzen</span>
            <button style={{
              position: 'absolute', top: 8, right: 8,
              appearance: 'none', cursor: 'pointer',
              background: theme.bgCard, color: theme.text,
              border: `1px solid ${theme.border}`,
              padding: '5px 10px', borderRadius: 6,
              fontSize: 11, fontFamily: 'inherit',
            }}>Hier</button>
          </div>
        </div>
        <div>
          <FieldLabel theme={theme}>Koordinaten</FieldLabel>
          <Input theme={theme} mono placeholder="48.48500, 9.55300"
            value={form.newCave.lat ? `${form.newCave.lat}, ${form.newCave.lng}` : ''}
            onChange={v => {}}/>
        </div>
      </>
    )}
  </div>
);

const Step2Time = ({ form, set, theme }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div>
      <FieldLabel theme={theme}>Datum</FieldLabel>
      <Input theme={theme} mono value={form.date} onChange={v => set('date', v)}/>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div>
        <FieldLabel theme={theme}>Start</FieldLabel>
        <Input theme={theme} mono value={form.start} onChange={v => set('start', v)}/>
      </div>
      <div>
        <FieldLabel theme={theme}>Ende</FieldLabel>
        <Input theme={theme} mono value={form.end} onChange={v => set('end', v)}/>
      </div>
    </div>
    <div>
      <FieldLabel theme={theme}>Typ</FieldLabel>
      <SegOptions value={form.type} options={['Horizontal','Vertikal','Mixed','Labyrinth']}
        onChange={v => set('type', v)} theme={theme}/>
    </div>
    <div>
      <FieldLabel theme={theme}>Nass</FieldLabel>
      <SegOptions value={form.wet} options={['Trocken','Teilweise','Nass']}
        onChange={v => set('wet', v)} theme={theme}/>
    </div>
    <div>
      <FieldLabel theme={theme}>Seil</FieldLabel>
      <SegOptions value={form.rope} options={['Ohne','Mit Seil','SRT']}
        onChange={v => set('rope', v)} theme={theme}/>
    </div>
  </div>
);

const Step3Team = ({ form, set, theme }) => {
  const candidates = ['Marco K.','Lena R.','Tobi F.','Anna S.','Ilse B.'];
  const gearCandidates = ['SRT-Set','Neopren 5mm','Schlafsack','Helm+Lampe','Abseilachter','Foto'];
  const tg = (list, key, val) => set(key, list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <FieldLabel theme={theme}>Team</FieldLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {candidates.map(c => (
            <button key={c} onClick={() => tg(form.team, 'team', c)} style={{
              appearance: 'none', cursor: 'pointer', padding: '6px 11px',
              background: form.team.includes(c) ? theme.text : 'transparent',
              color: form.team.includes(c) ? theme.bg : theme.text,
              border: `1px solid ${form.team.includes(c) ? theme.text : theme.border}`,
              borderRadius: 6, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
            }}>{c}</button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel theme={theme}>Ausrüstung</FieldLabel>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {gearCandidates.map(c => (
            <button key={c} onClick={() => tg(form.gear, 'gear', c)} style={{
              appearance: 'none', cursor: 'pointer', padding: '6px 11px',
              background: form.gear.includes(c) ? theme.text : 'transparent',
              color: form.gear.includes(c) ? theme.bg : theme.text,
              border: `1px solid ${form.gear.includes(c) ? theme.text : theme.border}`,
              borderRadius: 6, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
            }}>{c}</button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel theme={theme}>Gefahren (Kommagetrennt)</FieldLabel>
        <Input theme={theme} value={form.hazards} onChange={v => set('hazards', v)}
          placeholder="Steinschlag, CO₂, …"/>
      </div>
    </div>
  );
};

const Step4Notes = ({ form, set, theme }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div>
      <FieldLabel theme={theme}>Notizen</FieldLabel>
      <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
        placeholder="Verlauf der Befahrung, Beobachtungen, Vermessung …"
        rows={8} style={{
          width: '100%', padding: '12px',
          border: `1px solid ${theme.border}`,
          background: theme.bgCard, color: theme.text,
          borderRadius: 8, fontSize: 14, lineHeight: 1.5,
          fontFamily: 'Inter', outline: 'none', resize: 'vertical',
          boxSizing: 'border-box',
        }}/>
    </div>
    <div>
      <FieldLabel theme={theme}>Fotos</FieldLabel>
      <div style={{
        border: `1px dashed ${theme.borderHi}`, borderRadius: 8,
        padding: '24px 16px', textAlign: 'center',
        background: theme.bgCard,
      }}>
        <CLIcon name="upload" size={20} color={theme.textMute}/>
        <div style={{ fontSize: 12, color: theme.text, marginTop: 6 }}>Fotos hinzufügen</div>
        <div style={{ fontSize: 11, color: theme.textMute, marginTop: 2 }}>JPEG/PNG/HEIC · max 10 MB</div>
      </div>
    </div>
  </div>
);

window.CLNewScreen = CLNewScreen;
