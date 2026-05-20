// Neue Befahrung — 4-Schritt-Flow mit API-Speicherung
import { useState, useRef } from 'react';
import { api } from '../api.js';
import CLIcon from '../icons.jsx';
import CLMapyMap from '../components/MapyMap.jsx';

// Höhlentyp → Hero-Icon
const HERO_ICON = { Vertikal: 'pit', Horizontal: 'tunnel', Labyrinth: 'maze', Mixed: 'chamber' };

export default function NewScreen({ theme, prefs, caves = [], onClose, onSaved }) {
  const [step,        setStep]       = useState(1);
  const [saving,      setSaving]     = useState(false);
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
  const [error,       setError]      = useState('');
  const [done,        setDone]       = useState(false);
  const [files,       setFiles]      = useState([]); // ausgewählte File-Objekte

  const [form, setForm] = useState({
    caveMode:       'new',
    caveId:         null,
    newCaveName:    '',
    newCaveRegion:  '',
    newCaveCountry: 'DE',
    newCaveType:    'Horizontal',
    newCaveCoords:  '',
    pickedCoords:   null,
    title:          '',
    date:           new Date().toISOString().slice(0, 10),
    start:          '09:00',
    end:            '14:00',
    type:           'Horizontal',
    wet:            'Trocken',
    rope:           'Ohne',
    diff:           { t: 2, k: 2, p: 1 },
    rating:         0,
    depth:          0,
    length:         0,
    weather:        '',
    notes:          '',
    team:           [],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalSteps = 4;
  const stepTitles = ['Wo war\'s?', 'Wann & wie?', 'Wie schwer war\'s?', 'Erzähl davon.'];

  // ── Schritt-Validierung ──────────────────────────────────
  const validate = () => {
    if (step === 1) {
      if (form.caveMode === 'new' && !form.newCaveName.trim())
        return 'Bitte Namen der Höhle eingeben.';
      if (form.caveMode === 'existing' && !form.caveId)
        return 'Bitte eine Höhle aus der Liste wählen.';
      if (!form.title.trim())
        return 'Bitte Tourbezeichnung eingeben.';
    }
    if (step === 2 && !form.date)
      return 'Bitte Datum eingeben.';
    return '';
  };

  const handleNext = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    if (step < totalSteps) { setStep(step + 1); return; }
    await handleSave();
  };

  // ── Speichern ────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // 1. Neue Höhle anlegen (falls gewählt)
      let caveId = form.caveId;
      if (form.caveMode === 'new') {
        const cave = await api.createCave({
          name:           form.newCaveName.trim(),
          region:         form.newCaveRegion.trim() || null,
          country:        form.newCaveCountry,
          type:           form.newCaveType,
          lat:            form.pickedCoords?.lat ?? null,
          lng:            form.pickedCoords?.lng ?? null,
        });
        caveId = cave.id;
      }

      // 2. Trip anlegen
      const heroIcon = HERO_ICON[form.type] ?? 'tunnel';
      const savedTrip = await api.createTrip({
        cave_id:    caveId,
        title:      form.title.trim(),
        date:       form.date,
        start_time: form.start,
        end_time:   form.end,
        type:       form.type,
        wet:        form.wet,
        rope:       form.rope,
        diff_t:     form.diff.t,
        diff_k:     form.diff.k,
        diff_p:     form.diff.p,
        rating:     form.rating || null,
        depth_m:    form.depth  || null,
        length_m:   form.length || null,
        weather:    form.weather.trim() || null,
        notes:      form.notes.trim()   || null,
        team:       form.team,
        hero_icon:  heroIcon,
        is_public:  0,
      });

      // Fotos hochladen (nacheinander, um den Server nicht zu überlasten)
      if (files.length > 0) {
        setUploadCount({ done: 0, total: files.length });
        for (let i = 0; i < files.length; i++) {
          try {
            await api.uploadPhoto(savedTrip.id, files[i]);
          } catch { /* ein fehlgeschlagenes Foto stoppt nicht den Rest */ }
          setUploadCount({ done: i + 1, total: files.length });
        }
      }

      setDone(true);
      onSaved?.();
      setTimeout(onClose, 1400);

    } catch (err) {
      setError(err.message || 'Fehler beim Speichern. Bitte prüfen ob die DB verbunden ist.');
    } finally {
      setSaving(false);
    }
  };

  // ── Erfolgs-State ────────────────────────────────────────
  if (done) return (
    <div style={{
      minHeight: '100%', background: theme.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: theme.success + '22',
        border: `2px solid ${theme.success}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CLIcon name="check" size={36} color={theme.success} strokeWidth={2.5} />
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 500, color: theme.text }}>
        Eingetragen!
      </div>
      <div style={{ fontSize: 12, color: theme.textMute }}>
        {files.length > 0
          ? `Befahrung + ${uploadCount.done} von ${files.length} Foto(s) gespeichert.`
          : 'Die Befahrung wurde gespeichert.'}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: 120, background: theme.bg }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{
          appearance: 'none', border: 'none', background: 'transparent',
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
          color: theme.textMute, fontSize: 13, fontFamily: 'inherit',
        }}>
          <CLIcon name="close" size={18} color={theme.textMute} />
          <span>Abbrechen</span>
        </button>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase' }}>
          Schritt {step} / {totalSteps}
        </div>
      </div>

      {/* Fortschritts-Balken */}
      <div style={{ padding: '0 20px 18px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(n => (
            <div key={n} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: n <= step ? theme.accent : theme.border,
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Titel */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: theme.accent, textTransform: 'uppercase', marginBottom: 6 }}>
          Neue Befahrung
        </div>
        <h1 style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 500, color: theme.text, letterSpacing: -0.3 }}>
          {stepTitles[step - 1]}
        </h1>
      </div>

      {/* Fehler-Banner */}
      {error && (
        <div style={{
          margin: '0 20px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px',
          background: theme.danger + '14',
          border: `1px solid ${theme.danger}30`,
          borderRadius: 10,
        }}>
          <CLIcon name="warning" size={14} color={theme.danger} />
          <span style={{ fontSize: 12, color: theme.danger }}>{error}</span>
        </div>
      )}

      {/* Schritt-Inhalt */}
      <div style={{ padding: '0 20px' }}>
        {step === 1 && <StepLocation form={form} set={set} theme={theme} caves={caves} />}
        {step === 2 && <StepConditions form={form} set={set} theme={theme} />}
        {step === 3 && <StepDifficulty form={form} set={set} theme={theme} />}
        {step === 4 && <StepNotes form={form} set={set} theme={theme} files={files} setFiles={setFiles} />}
      </div>

      {/* Footer-Buttons */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        padding: '10px 16px 20px',
        background: `linear-gradient(to top, ${theme.bg} 70%, transparent)`,
        display: 'flex', gap: 8, zIndex: 10,
        maxWidth: 412, margin: '0 auto',
      }}>
        {step > 1 && (
          <button onClick={() => { setError(''); setStep(step - 1); }} disabled={saving} style={{
            flex: 1, appearance: 'none',
            padding: '14px', borderRadius: 14,
            background: 'transparent', border: `1px solid ${theme.border}`,
            color: theme.text, fontWeight: 600, fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>Zurück</button>
        )}
        <button onClick={handleNext} disabled={saving} style={{
          flex: 2, appearance: 'none', border: 'none',
          padding: '14px', borderRadius: 14,
          background: saving ? theme.accentDim : theme.accent,
          color: theme.bg, fontWeight: 700, fontSize: 14,
          cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'inherit', letterSpacing: 0.3,
          transition: 'background 0.2s',
        }}>
          {saving ? (
            <><Spinner color={theme.bg} />
              {uploadCount.total > 0
                ? `Fotos ${uploadCount.done}/${uploadCount.total}…`
                : 'Speichert…'}
            </>
          ) : step < totalSteps ? (
            <>Weiter <CLIcon name="chevron-right" size={16} color={theme.bg} strokeWidth={2.2} /></>
          ) : (
            <>Eintrag speichern <CLIcon name="check" size={16} color={theme.bg} strokeWidth={2.2} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Schritt 1 — Höhle + Titel ────────────────────────────
function StepLocation({ form, set, theme, caves }) {
  const isNew = form.caveMode === 'new';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Modus */}
      <div style={{ display: 'flex', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 3, gap: 2 }}>
        <ModeBtn label="Neue Höhle"      icon="plus"  active={isNew}  onClick={() => set('caveMode', 'new')}      theme={theme} />
        <ModeBtn label="Bereits befahren" icon="caves" active={!isNew} onClick={() => set('caveMode', 'existing')} theme={theme} />
      </div>

      {isNew ? (
        <>
          <FormLabel label="Name der Höhle" theme={theme} />
          <input
            type="text" placeholder="z.B. Blauhöhle" autoFocus
            value={form.newCaveName} onChange={e => set('newCaveName', e.target.value)}
            style={inp(theme, { marginTop: -10, fontSize: 16, fontFamily: 'Inter, sans-serif', fontWeight: 500 })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <div>
              <FormLabel label="Region" theme={theme} />
              <input type="text" placeholder="z.B. Schwäbische Alb"
                value={form.newCaveRegion} onChange={e => set('newCaveRegion', e.target.value)}
                style={inp(theme, { marginTop: 6, fontSize: 13 })} />
            </div>
            <div>
              <FormLabel label="Land" theme={theme} />
              <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                {['DE','AT','CH'].map(c => (
                  <button key={c} onClick={() => set('newCaveCountry', c)} style={{
                    flex: 1, appearance: 'none', cursor: 'pointer', padding: '12px 4px', borderRadius: 10,
                    background: form.newCaveCountry === c ? theme.accentSoft : theme.bgCard,
                    border: `1px solid ${form.newCaveCountry === c ? theme.accent : theme.border}`,
                    color: form.newCaveCountry === c ? theme.accent : theme.text,
                    fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  }}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          <FormLabel label="Eingang auf Karte wählen" theme={theme} />
          <div style={{ marginTop: -10 }}>
            <div style={{ height: 200, borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.border}`, position: 'relative' }}>
              <CLMapyMap
                center={form.pickedCoords ? [form.pickedCoords.lat, form.pickedCoords.lng] : [48.5, 11]}
                zoom={form.pickedCoords ? 13 : 6}
                pickedCoords={form.pickedCoords} theme={theme} height="100%"
                onMapClick={(c) => { set('pickedCoords', c); set('newCaveCoords', `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`); }}
              />
              <div style={{
                position: 'absolute', bottom: 8, left: 8, zIndex: 500,
                padding: '5px 10px', borderRadius: 8, background: 'rgba(15,11,8,0.82)', backdropFilter: 'blur(8px)',
                color: theme.textMute, fontSize: 10, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'none',
              }}>
                <CLIcon name="pin" size={10} color={theme.accent} />
                Auf Karte tippen, um Eingang zu setzen
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input type="text" placeholder="48.4850, 9.5530"
                value={form.newCaveCoords}
                onChange={e => {
                  set('newCaveCoords', e.target.value);
                  const m = e.target.value.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
                  if (m) set('pickedCoords', { lat: parseFloat(m[1]), lng: parseFloat(m[2]) });
                }}
                style={inp(theme, { flex: 1, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' })} />
              <button onClick={() => {
                navigator.geolocation?.getCurrentPosition(pos => {
                  const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  set('pickedCoords', c);
                  set('newCaveCoords', `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
                });
              }} style={{
                appearance: 'none', border: `1px solid ${theme.border}`, background: theme.bgCard,
                borderRadius: 10, padding: '0 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                color: theme.accent, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              }}>
                <CLIcon name="pin" size={13} color={theme.accent} /> Hier
              </button>
            </div>
          </div>

          <FormLabel label="Höhlentyp" theme={theme} />
          <Segmented options={['Horizontal','Vertikal','Labyrinth','Mixed']}
            value={form.newCaveType} onChange={v => set('newCaveType', v)} theme={theme} />
        </>
      ) : (
        <>
          <FormLabel label="Aus Verzeichnis wählen" theme={theme} />
          <div style={{ marginTop: -10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(caves.length ? caves : []).slice(0, 6).map(c => (
              <button key={c.id} onClick={() => set('caveId', c.id)} style={{
                appearance: 'none', textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                background: form.caveId === c.id ? theme.accentSoft : theme.bgCard,
                border: `1px solid ${form.caveId === c.id ? theme.accent : theme.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: form.caveId === c.id ? theme.accent : 'transparent',
                  border: `1.5px solid ${form.caveId === c.id ? theme.accent : theme.border}`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: theme.textMute, fontSize: 11 }}>{c.region} · {c.entries ?? 0}× befahren</div>
                </div>
                <CLIcon name="chevron-right" size={14} color={theme.textMute} />
              </button>
            ))}
            {caves.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', color: theme.textMute, fontSize: 12 }}>
                Noch keine Höhlen — erst eine neue anlegen.
              </div>
            )}
          </div>
        </>
      )}

      <FormLabel label="Titel / Tourbezeichnung" theme={theme} />
      <input type="text" placeholder="z.B. Abstieg zum Schwarzen See"
        value={form.title} onChange={e => set('title', e.target.value)}
        style={inp(theme, { marginTop: -10, fontSize: 15, fontFamily: 'Inter, sans-serif', fontWeight: 500 })} />
    </div>
  );
}

// ── Schritt 2 — Datum / Zeit / Bedingungen ───────────────
function StepConditions({ form, set, theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <TimeField label="Datum" value={form.date} onChange={v => set('date', v)} type="date" theme={theme} icon="calendar" />
        <TimeField label="Start" value={form.start} onChange={v => set('start', v)} type="time" theme={theme} icon="clock" />
        <TimeField label="Ende"  value={form.end}   onChange={v => set('end', v)}   type="time" theme={theme} icon="clock" />
      </div>
      <FormLabel label="Höhlentyp" theme={theme} />
      <Segmented options={['Horizontal','Vertikal','Labyrinth','Mixed']} value={form.type} onChange={v => set('type', v)} theme={theme} />
      <FormLabel label="Wasser" theme={theme} />
      <Segmented options={['Trocken','Teilweise','Nass']} value={form.wet} onChange={v => set('wet', v)} theme={theme} />
      <FormLabel label="Seiltechnik" theme={theme} />
      <Segmented options={['Ohne','Mit Seil','SRT']} value={form.rope} onChange={v => set('rope', v)} theme={theme} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
        <NumField label="Tiefe erreicht" unit="m"  value={form.depth}  onChange={v => set('depth', v)}  theme={theme} icon="depth" />
        <NumField label="Strecke"        unit="m"  value={form.length} onChange={v => set('length', v)} theme={theme} icon="length" />
      </div>
    </div>
  );
}

// ── Schritt 3 — Schwierigkeit ────────────────────────────
function StepDifficulty({ form, set, theme }) {
  const axes = [
    { key: 't', label: 'Technisch',  hint: 'Kletterstellen, SRT-Passagen', color: theme.accent },
    { key: 'k', label: 'Körperlich', hint: 'Dauer, Gewicht, Schwimmstrecken', color: theme.rope },
    { key: 'p', label: 'Psychisch',  hint: 'Ausgesetztheit, Enge, Orientierung', color: theme.wet },
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
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 600, color: a.color, lineHeight: 1 }}>
              {form.diff[a.key]}
            </div>
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
        <FormLabel label="Persönliche Bewertung" theme={theme} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => set('rating', n)} style={{
              appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
            }}>
              <CLIcon name={n <= form.rating ? 'star-filled' : 'star'} size={30}
                color={n <= form.rating ? theme.accent : theme.border} strokeWidth={1.4} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Schritt 4 — Notizen + Team + Fotos ──────────────────
function StepNotes({ form, set, theme, files, setFiles }) {
  const fileRef = useRef(null);
  const allTeam = (() => {
    try { return JSON.parse(localStorage.getItem('cl_team_members') || '[]'); } catch { return []; }
  })();

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles(prev => {
      // Duplikate (gleicher Name+Größe) herausfiltern
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...picked.filter(f => !existing.has(f.name + f.size))];
    });
    e.target.value = ''; // Reset damit dieselbe Datei nochmal gewählt werden kann
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <FormLabel label="Bericht / Notizen" theme={theme} />
      <textarea placeholder="Erzähl, was du erlebt hast…"
        value={form.notes} onChange={e => set('notes', e.target.value)} rows={6}
        style={{
          marginTop: -10, appearance: 'none', width: '100%', resize: 'vertical',
          padding: '14px', background: theme.bgCard,
          border: `1px solid ${theme.border}`, borderRadius: 12,
          color: theme.text, fontSize: 14, lineHeight: 1.5,
          fontFamily: 'Inter, sans-serif', outline: 'none',
        }} />

      <FormLabel label="Wetter / Bedingungen" theme={theme} />
      <input type="text" placeholder="z.B. Sonnig, 12°C"
        value={form.weather} onChange={e => set('weather', e.target.value)}
        style={inp(theme, { marginTop: -10, fontSize: 13 })} />

      <FormLabel label="Begleiter" theme={theme} />
      <div style={{ marginTop: -10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {allTeam.map(p => {
          const active = form.team.includes(p);
          return (
            <button key={p} onClick={() => set('team', active ? form.team.filter(x => x !== p) : [...form.team, p])} style={{
              appearance: 'none', padding: '8px 12px', borderRadius: 999,
              background: active ? theme.accentSoft : theme.bgCard,
              border: `1px solid ${active ? theme.accent : theme.border}`,
              color: active ? theme.accent : theme.text,
              fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {active && '✓ '}{p}
            </button>
          );
        })}
      </div>

      {/* Fotos */}
      <FormLabel label={`Fotos${files.length ? ` (${files.length})` : ''}`} theme={theme} />
      {/* Versteckter File-Input */}
      <input
        ref={fileRef} type="file"
        accept="image/jpeg,image/png,image/heic,image/heif"
        multiple style={{ display: 'none' }}
        onChange={addFiles}
      />
      <div style={{ marginTop: -10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {/* Hinzufügen-Button */}
        <button onClick={() => fileRef.current?.click()} style={{
          aspectRatio: '1', appearance: 'none',
          border: `1.5px dashed ${theme.accent}`, borderRadius: 10,
          background: theme.accentSoft, color: theme.accent,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 4,
        }}>
          <CLIcon name="camera" size={20} color={theme.accent} />
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5 }}>FOTO</span>
        </button>

        {/* Vorschau ausgewählter Dateien */}
        {files.map((f, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '1' }}>
            <img
              src={URL.createObjectURL(f)}
              alt={f.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                borderRadius: 10, border: `1px solid ${theme.border}`,
              }}
            />
            {/* Entfernen-Button */}
            <button onClick={() => removeFile(i)} style={{
              position: 'absolute', top: 3, right: 3,
              width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(0,0,0,0.65)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}>
              <CLIcon name="close" size={10} color="#fff" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
      {files.length > 0 && (
        <div style={{ fontSize: 11, color: theme.textMute, marginTop: -10 }}>
          {files.length} Foto{files.length > 1 ? 's' : ''} ausgewählt · werden beim Speichern hochgeladen
        </div>
      )}
    </div>
  );
}

// ── Hilfs-Komponenten ────────────────────────────────────
function FormLabel({ label, theme }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase' }}>{label}</div>;
}

function ModeBtn({ label, icon, active, onClick, theme }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, appearance: 'none', border: 'none', cursor: 'pointer',
      padding: '10px 8px', borderRadius: 9,
      background: active ? theme.accent : 'transparent',
      color: active ? theme.bg : theme.textMute,
      fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <CLIcon name={icon} size={13} color={active ? theme.bg : theme.textMute} strokeWidth={2.2} />
      {label}
    </button>
  );
}

function Segmented({ options, value, onChange, theme }) {
  return (
    <div style={{ marginTop: -10, display: 'flex', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          flex: 1, appearance: 'none', border: 'none',
          padding: '8px 8px', borderRadius: 8,
          background: value === o ? theme.accent : 'transparent',
          color: value === o ? theme.bg : theme.textMute,
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>{o}</button>
      ))}
    </div>
  );
}

function TimeField({ label, value, onChange, type, theme, icon }) {
  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <CLIcon name={icon} size={11} color={theme.textMute} />
        <span style={{ fontSize: 9, letterSpacing: 1, fontWeight: 700, color: theme.textMute, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{
        appearance: 'none', border: 'none', background: 'transparent', outline: 'none',
        color: theme.text, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
        width: '100%', padding: 0, colorScheme: 'dark',
      }} />
    </div>
  );
}

function NumField({ label, unit, value, onChange, theme, icon }) {
  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <CLIcon name={icon} size={11} color={theme.textMute} />
        <span style={{ fontSize: 9, letterSpacing: 1, fontWeight: 700, color: theme.textMute, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} style={{
          appearance: 'none', border: 'none', background: 'transparent',
          color: theme.text, fontSize: 18, fontWeight: 600,
          fontFamily: 'Inter, sans-serif', width: '70%', outline: 'none', padding: 0,
        }} />
        <span style={{ color: theme.textMute, fontSize: 11 }}>{unit}</span>
      </div>
    </div>
  );
}

function Spinner({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="2" strokeDasharray="20 18" strokeLinecap="round" />
    </svg>
  );
}

// Inline-Style-Helfer
function inp(theme, overrides = {}) {
  return {
    appearance: 'none', border: `1px solid ${theme.border}`, outline: 'none',
    width: '100%', padding: '12px 14px',
    background: theme.bgCard, borderRadius: 12,
    color: theme.text, fontSize: 13, fontFamily: 'inherit',
    ...overrides,
  };
}
