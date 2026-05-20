// Befahrung editieren — gleicher 4-Step-Flow wie NewScreen, prefilled
import { useState, useEffect, useRef } from 'react';
import { api } from '../api.js';
import CLIcon from '../icons.jsx';
import { CLPhoto } from '../atoms.jsx';

const HERO_ICON = { Vertikal: 'pit', Horizontal: 'tunnel', Labyrinth: 'maze', Mixed: 'chamber' };

export default function EditTripScreen({ trip, caves = [], theme, onBack, onSaved }) {
  const cave = caves.find(c => c.id === (trip.caveId ?? trip.cave_id));

  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [done,   setDone]   = useState(false);
  const [confirm,setConfirm]= useState(false);
  const [deleting,setDeleting]=useState(false);

  const [form, setForm] = useState({
    title:   trip.title   || '',
    date:    trip.date    || '',
    start:   trip.start   || trip.start_time || '',
    end:     trip.end     || trip.end_time   || '',
    type:    trip.type    || 'Horizontal',
    wet:     trip.wet     || 'Trocken',
    rope:    trip.rope    || 'Ohne',
    diff:    trip.difficulty || { t: trip.diff_t||1, k: trip.diff_k||1, p: trip.diff_p||1 },
    rating:  trip.rating  || 0,
    depth:   trip.depth   || trip.depth_m  || 0,
    length:  trip.length  || trip.length_m || 0,
    weather: trip.weather || '',
    notes:   trip.notes   || '',
    team:    trip.team    || [],
    gear:    trip.gear    || [],
    hazards: trip.hazards || [],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalSteps = 4;
  const stepTitles = ['Titel & Höhle', 'Wann & wie?', 'Wie schwer?', 'Notizen & Fotos'];

  const validate = () => {
    if (step === 1 && !form.title.trim()) return 'Titel darf nicht leer sein.';
    if (step === 2 && !form.date)        return 'Datum eingeben.';
    return '';
  };

  const handleNext = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    if (step < totalSteps) { setStep(step + 1); return; }
    await handleSave();
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await api.updateTrip(trip.id, {
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
        rating:     form.rating  || null,
        depth_m:    form.depth   || null,
        length_m:   form.length  || null,
        weather:    form.weather.trim() || null,
        notes:      form.notes.trim()   || null,
        hero_icon:  HERO_ICON[form.type] ?? 'tunnel',
        team:       form.team,
        gear:       form.gear,
        hazards:    form.hazards,
      });
      setDone(true);
      onSaved?.();
      setTimeout(onBack, 1200);
    } catch (err) {
      setError(err.message || 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteTrip(trip.id);
      onSaved?.();
      onBack();
    } catch (err) {
      setError(err.message || 'Fehler beim Löschen.');
      setDeleting(false); setConfirm(false);
    }
  };

  // ── Erfolgs-State ─────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: '100%', background: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: theme.success + '22', border: `2px solid ${theme.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CLIcon name="check" size={36} color={theme.success} strokeWidth={2.5} />
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 500, color: theme.text }}>Gespeichert!</div>
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: 120, background: theme.bg }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ appearance: 'none', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: theme.textMute, fontSize: 13, fontFamily: 'inherit' }}>
          <CLIcon name="close" size={18} color={theme.textMute} />
          <span>Abbrechen</span>
        </button>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase' }}>
          Schritt {step} / {totalSteps}
        </div>
        {/* Löschen-Button */}
        <button onClick={() => setConfirm(true)} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
          <CLIcon name="warning" size={18} color={theme.danger} />
        </button>
      </div>

      {/* Fortschritt */}
      <div style={{ padding: '0 20px 18px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4].map(n => (
            <div key={n} onClick={() => n < step && setStep(n)} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: n <= step ? theme.accent : theme.border,
              transition: 'background 0.3s',
              cursor: n < step ? 'pointer' : 'default',
            }} />
          ))}
        </div>
      </div>

      {/* Titel */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: theme.accent, textTransform: 'uppercase', marginBottom: 6 }}>
          Befahrung editieren
        </div>
        <h1 style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 500, color: theme.text, letterSpacing: -0.3 }}>
          {stepTitles[step - 1]}
        </h1>
      </div>

      {/* Fehler */}
      {error && (
        <div style={{ margin: '0 20px 16px', padding: '10px 12px', background: theme.danger + '14', border: `1px solid ${theme.danger}30`, borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <CLIcon name="warning" size={14} color={theme.danger} />
          <span style={{ fontSize: 12, color: theme.danger }}>{error}</span>
        </div>
      )}

      {/* Schritt-Inhalt */}
      <div style={{ padding: '0 20px' }}>
        {step === 1 && <StepTitleCave   form={form} set={set} theme={theme} cave={cave} trip={trip} />}
        {step === 2 && <StepConditions  form={form} set={set} theme={theme} />}
        {step === 3 && <StepDifficulty  form={form} set={set} theme={theme} />}
        {step === 4 && <StepNotesPhotos form={form} set={set} theme={theme} tripId={trip.id} />}
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        padding: '10px 16px 20px',
        background: `linear-gradient(to top, ${theme.bg} 70%, transparent)`,
        display: 'flex', gap: 8, zIndex: 10,
        maxWidth: 412, margin: '0 auto',
      }}>
        {step > 1 && (
          <button onClick={() => { setError(''); setStep(step - 1); }} disabled={saving} style={{
            flex: 1, appearance: 'none', padding: '14px', borderRadius: 14,
            background: 'transparent', border: `1px solid ${theme.border}`,
            color: theme.text, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}>Zurück</button>
        )}
        <button onClick={handleNext} disabled={saving} style={{
          flex: 2, appearance: 'none', border: 'none',
          padding: '14px', borderRadius: 14,
          background: saving ? theme.accentDim : theme.accent,
          color: theme.bg, fontWeight: 700, fontSize: 14,
          cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'inherit', transition: 'background 0.2s',
        }}>
          {saving ? 'Speichert…' : step < totalSteps
            ? <>Weiter <CLIcon name="chevron-right" size={16} color={theme.bg} strokeWidth={2.2} /></>
            : <>Speichern <CLIcon name="check" size={16} color={theme.bg} strokeWidth={2.2} /></>
          }
        </button>
      </div>

      {/* Lösch-Dialog */}
      {confirm && (
        <div onClick={() => setConfirm(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 412, margin: '0 auto', background: theme.bgElev, borderRadius: '20px 20px 0 0', padding: '24px 20px 32px' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 500, color: theme.text, marginBottom: 8 }}>Befahrung löschen?</div>
            <div style={{ fontSize: 13, color: theme.textMute, marginBottom: 24 }}>„{trip.title}" wird unwiderruflich gelöscht inkl. aller Fotos.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirm(false)} style={{ flex: 1, appearance: 'none', padding: '13px', borderRadius: 12, background: 'transparent', border: `1px solid ${theme.border}`, color: theme.text, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Abbrechen</button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, appearance: 'none', border: 'none', padding: '13px', borderRadius: 12, background: theme.danger, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                {deleting ? 'Löschen…' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Schritt 1 — Titel & Höhle ────────────────────────────
function StepTitleCave({ form, set, theme, cave, trip }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Höhle — nur Anzeige */}
      {cave && (
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <CLPhoto theme={theme} src={trip.cover_photo} height={80} radius={0} label="foto" />
          <div style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.accent, textTransform: 'uppercase', marginBottom: 2 }}>{cave.country} · {cave.region}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 500, color: theme.text }}>{cave.name}</div>
          </div>
        </div>
      )}
      <Label label="Tourbezeichnung" theme={theme} />
      <input
        type="text" value={form.title} onChange={e => set('title', e.target.value)}
        autoFocus
        style={inp(theme, { marginTop: -10, fontSize: 16, fontFamily: 'Inter, sans-serif', fontWeight: 500 })}
      />
    </div>
  );
}

// ── Schritt 2 — Wann & Bedingungen ────────────────────────
function StepConditions({ form, set, theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[['Datum','date','date'],['Start','start','time'],['Ende','end','time']].map(([l,k,t]) => (
          <TimeBox key={k} label={l} value={form[k]} type={t} onChange={v => set(k, v)} theme={theme} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <NumBox label="Tiefe" unit="m" value={form.depth}  onChange={v => set('depth', v)}  theme={theme} />
        <NumBox label="Strecke" unit="m" value={form.length} onChange={v => set('length', v)} theme={theme} />
      </div>
      <Label label="Höhlentyp" theme={theme} />
      <Seg options={['Horizontal','Vertikal','Labyrinth','Mixed']} value={form.type} onChange={v => set('type', v)} theme={theme} />
      <Label label="Wasser" theme={theme} />
      <Seg options={['Trocken','Teilweise','Nass']} value={form.wet} onChange={v => set('wet', v)} theme={theme} />
      <Label label="Seiltechnik" theme={theme} />
      <Seg options={['Ohne','Mit Seil','SRT']} value={form.rope} onChange={v => set('rope', v)} theme={theme} />
      <Label label="Wetter / Bedingungen" theme={theme} />
      <input value={form.weather} onChange={e => set('weather', e.target.value)}
        placeholder="z.B. Sonnig, 12°C" style={inp(theme, { marginTop: -10, fontSize: 13 })} />
    </div>
  );
}

// ── Schritt 3 — Schwierigkeit ─────────────────────────────
function StepDifficulty({ form, set, theme }) {
  const axes = [
    { key: 't', label: 'Technisch',  hint: 'Kletterstellen, SRT, Engstellen', color: theme.accent },
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
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 600, color: a.color, lineHeight: 1 }}>{form.diff[a.key]}</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => set('diff', { ...form.diff, [a.key]: n })} style={{
                flex: 1, height: 36, appearance: 'none', border: 'none', borderRadius: 8,
                background: n <= form.diff[a.key] ? a.color : theme.bgCard,
                cursor: 'pointer', color: n <= form.diff[a.key] ? theme.bg : theme.textMute,
                fontWeight: 700, fontSize: 13, fontFamily: 'inherit', transition: 'background 0.12s',
              }}>{n}</button>
            ))}
          </div>
        </div>
      ))}
      <div>
        <Label label="Persönliche Bewertung" theme={theme} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => set('rating', n)} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
              <CLIcon name={n <= form.rating ? 'star-filled' : 'star'} size={30} color={n <= form.rating ? theme.accent : theme.border} strokeWidth={1.4} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Schritt 4 — Notizen, Team, Gear, Gefahren, Fotos ─────
function StepNotesPhotos({ form, set, theme, tripId }) {
  const fileRef   = useRef(null);
  const [photos,  setPhotos]    = useState(null);
  const [uploading,setUploading]= useState(false);
  const [newGear,  setNewGear]  = useState('');
  const [newHazard,setNewHazard]= useState('');

  const allTeam = (() => {
    try { return JSON.parse(localStorage.getItem('cl_team_members') || '[]'); } catch { return []; }
  })();

  // Fotos laden
  useEffect(() => {
    api.getPhotos(tripId).then(setPhotos).catch(() => setPhotos([]));
  }, [tripId]);

  const uploadFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const f of files) {
      try { await api.uploadPhoto(tripId, f); } catch { /* weiter */ }
    }
    e.target.value = '';
    api.getPhotos(tripId).then(setPhotos).catch(() => {});
    setUploading(false);
  };

  const deletePhoto = async (id) => {
    try {
      await api.deletePhoto(id);
      setPhotos(p => p.filter(x => x.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Notizen */}
      <Label label="Bericht / Notizen" theme={theme} />
      <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={5}
        style={{ marginTop: -10, appearance: 'none', width: '100%', resize: 'vertical', padding: '14px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 14, lineHeight: 1.5, fontFamily: 'Inter, sans-serif', outline: 'none' }} />

      {/* Team */}
      <Label label="Begleiter" theme={theme} />
      <div style={{ marginTop: -10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {allTeam.length === 0 && (
          <div style={{ fontSize: 11, color: theme.textDim, fontStyle: 'italic' }}>Team-Mitglieder in Profil → Einstellungen anlegen.</div>
        )}
        {allTeam.map(p => {
          const active = form.team.includes(p);
          return (
            <button key={p} onClick={() => set('team', active ? form.team.filter(x => x !== p) : [...form.team, p])} style={{
              appearance: 'none', padding: '7px 12px', borderRadius: 999,
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

      {/* Ausrüstung */}
      <Label label="Ausrüstung" theme={theme} />
      <div style={{ marginTop: -10, display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {form.gear.map((g, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: theme.bgCard, border: `1px solid ${theme.border}`, fontSize: 12, color: theme.text }}>
            {g}
            <button onClick={() => set('gear', form.gear.filter((_,j) => j !== i))} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <CLIcon name="close" size={11} color={theme.textMute} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="z.B. SRT-Set" value={newGear} onChange={e => setNewGear(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newGear.trim()) { set('gear', [...form.gear, newGear.trim()]); setNewGear(''); }}}
          style={inp(theme, { flex: 1, fontSize: 13, marginTop: 0 })} />
        <button onClick={() => { if (newGear.trim()) { set('gear', [...form.gear, newGear.trim()]); setNewGear(''); }}} style={{ appearance: 'none', border: 'none', background: theme.accent, borderRadius: 10, padding: '9px 14px', color: theme.bg, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>+</button>
      </div>

      {/* Gefahren */}
      <Label label="Gefahren / Besonderheiten" theme={theme} />
      <div style={{ marginTop: -10, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
        {form.hazards.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: theme.danger + '0e', border: `1px solid ${theme.danger}22`, borderRadius: 10 }}>
            <CLIcon name="warning" size={13} color={theme.danger} />
            <span style={{ flex: 1, fontSize: 12, color: theme.text }}>{h}</span>
            <button onClick={() => set('hazards', form.hazards.filter((_,j) => j !== i))} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <CLIcon name="close" size={11} color={theme.textMute} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="z.B. Steinschlag" value={newHazard} onChange={e => setNewHazard(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newHazard.trim()) { set('hazards', [...form.hazards, newHazard.trim()]); setNewHazard(''); }}}
          style={inp(theme, { flex: 1, fontSize: 13, marginTop: 0 })} />
        <button onClick={() => { if (newHazard.trim()) { set('hazards', [...form.hazards, newHazard.trim()]); setNewHazard(''); }}} style={{ appearance: 'none', border: 'none', background: theme.danger + 'cc', borderRadius: 10, padding: '9px 14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>+</button>
      </div>

      {/* Fotos */}
      <Label label={`Fotos${photos ? ` (${photos.length})` : ''}`} theme={theme} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif" multiple style={{ display: 'none' }} onChange={uploadFiles} />
      <div style={{ marginTop: -10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {/* Upload-Button */}
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          aspectRatio: '1', appearance: 'none',
          border: `1.5px dashed ${theme.accent}`, borderRadius: 10,
          background: theme.accentSoft, color: theme.accent,
          cursor: uploading ? 'wait' : 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          <CLIcon name={uploading ? 'clock' : 'camera'} size={22} color={uploading ? theme.textMute : theme.accent} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{uploading ? 'LÄDT…' : 'FOTO'}</span>
        </button>

        {/* Vorhandene Fotos */}
        {photos === null ? (
          <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMute, fontSize: 11 }}>…</div>
        ) : photos.map(p => (
          <div key={p.id} style={{ position: 'relative', aspectRatio: '1' }}>
            <img src={p.thumb_path ?? p.path} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: `1px solid ${theme.border}`, display: 'block' }}
              loading="lazy" />
            <button onClick={() => deletePhoto(p.id)} style={{
              position: 'absolute', top: 4, right: 4,
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(0,0,0,0.75)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}>
              <CLIcon name="close" size={11} color="#fff" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hilfs-Komponenten ─────────────────────────────────────
function Label({ label, theme }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: theme.textMute, textTransform: 'uppercase' }}>{label}</div>;
}
function Seg({ options, value, onChange, theme }) {
  return (
    <div style={{ marginTop: -10, display: 'flex', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          flex: 1, appearance: 'none', border: 'none', padding: '8px 4px', borderRadius: 8,
          background: value === o ? theme.accent : 'transparent',
          color: value === o ? theme.bg : theme.textMute,
          fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>{o}</button>
      ))}
    </div>
  );
}
function TimeBox({ label, value, type, onChange, theme }) {
  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '10px' }}>
      <div style={{ fontSize: 9, letterSpacing: 1, fontWeight: 700, color: theme.textMute, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ appearance: 'none', border: 'none', background: 'transparent', outline: 'none', color: theme.text, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, width: '100%', padding: 0, colorScheme: 'dark' }} />
    </div>
  );
}
function NumBox({ label, unit, value, onChange, theme }) {
  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 9, letterSpacing: 1, fontWeight: 700, color: theme.textMute, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ appearance: 'none', border: 'none', background: 'transparent', color: theme.text, fontSize: 18, fontWeight: 600, fontFamily: 'Inter, sans-serif', width: '70%', outline: 'none', padding: 0 }} />
        <span style={{ color: theme.textMute, fontSize: 11 }}>{unit}</span>
      </div>
    </div>
  );
}
function inp(theme, overrides = {}) {
  return { appearance: 'none', border: `1px solid ${theme.border}`, outline: 'none', width: '100%', padding: '12px 14px', background: theme.bgCard, borderRadius: 12, color: theme.text, fontSize: 13, fontFamily: 'inherit', ...overrides };
}
