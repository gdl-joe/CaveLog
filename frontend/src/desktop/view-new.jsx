// view-new.jsx — Neue Befahrung / Bearbeiten (Desktop: zweispaltig, Mapy-Pin + Live-Vorschau)
// Schließt an die echte API an: neue Höhle (createCave) + createTrip, bzw. updateTrip bei Edit.
import { useState, useEffect } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDStars, CLDChip, CLDDifficulty } from './atoms.jsx';
import { CLDPhoto } from './photos.jsx';
import { adaptPhoto } from './adapt.js';
import { FORMAT_HINWEIS } from '../components/RichText.jsx';
import { api } from '../api.js';
import CLMapyMap from '../components/MapyMap.jsx';
import { EU_COUNTRIES } from './countries.js';

const HERO_ICON = { Vertikal:'pit', Horizontal:'tunnel', Labyrinth:'maze', Mixed:'chamber' };
const todayISO = () => new Date().toISOString().slice(0,10);

function fromTrip(t) {
  return {
    caveMode:'existing', caveId:t.caveId || t.cave_id,
    newName:'', newRegion:'', newCountry:'DE', newType:'Horizontal',
    title:t.title||'', date:t.date||todayISO(), start:t.start||'09:00', end:t.end||'14:00',
    type:t.type||'Horizontal', wet:t.wet||'Trocken', rope:t.rope||'Ohne',
    diff:{ ...(t.difficulty||{t:2,k:2,p:1}) }, rating:t.rating||0, depth:t.depth||0, length:t.length||0,
    weather:t.weather||'', team:t.team||[], notes:t.notes||'',
    gear:t.gear||[], hazards:t.hazards||[],
    pickedCoords:null, coords:'',
  };
}

// Höhlendaten in die Formularform bringen. Diese Felder gehören zur Höhle,
// nicht zur einzelnen Befahrung — Änderungen wirken auf alle ihre Einträge.
function fromCave(c) {
  return {
    name: c?.name || '', region: c?.region || '', country: c?.country || 'DE',
    type: c?.type || 'Horizontal',
    depth: c?.depth_m ?? c?.depth ?? '', length: c?.length_m ?? c?.length ?? '',
    year: c?.discovered_year || '', notes: c?.notes || '',
    lat: c?.lat != null ? Number(c.lat) : null,
    lng: c?.lng != null ? Number(c.lng) : null,
  };
}
const sameCave = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const CLDNew = ({ caves, theme, diffMode='bars', onClose, onSaved, editTrip=null, knownTeam=[], isAdmin=true, onPhotosChanged }) => {
  const [form, setForm] = useState(() => editTrip ? fromTrip(editTrip) : {
    caveMode:'new', caveId:null,
    newName:'', newRegion:'', newCountry:'DE', newType:'Horizontal',
    title:'', date:todayISO(), start:'09:00', end:'14:00',
    type:'Horizontal', wet:'Trocken', rope:'Ohne',
    diff:{t:2,k:2,p:1}, rating:0, depth:0, length:0,
    weather:'', team:[], notes:'',
    gear:[], hazards:[],
    pickedCoords:null, coords:'',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [teamAdd, setTeamAdd] = useState('');
  const [files, setFiles] = useState([]);       // neu ausgewählt, noch nicht hochgeladen
  const [upProg, setUpProg] = useState({ done:0, total:0 });
  const [cave, setCave] = useState(() => fromCave(null));      // Daten der gewählten Höhle
  const [caveBase, setCaveBase] = useState(() => fromCave(null)); // Ausgangsstand zum Vergleich
  const [gearAdd, setGearAdd] = useState('');
  const [hazAdd, setHazAdd] = useState('');
  const [existing, setExisting] = useState(null);   // bereits hochgeladene Fotos (null = lädt)
  const [askDelete, setAskDelete] = useState(null); // id, für die gerade nachgefragt wird
  const [busyDel, setBusyDel] = useState(null);
  const set = (k,v) => setForm(f=>({ ...f, [k]:v }));

  // Gewählte Höhle → Formularfelder. Damit lassen sich Name, Region, Lage usw.
  // auch nachträglich ändern; bisher ging das nur beim Anlegen einer neuen Höhle.
  useEffect(() => {
    if (form.caveMode === 'new') return;
    const c = caves.find(x => x.id === form.caveId);
    const next = fromCave(c);
    setCave(next);
    setCaveBase(next);
    // Karte und Koordinatenfeld auf die gespeicherte Lage setzen
    setForm(f => ({
      ...f,
      pickedCoords: (next.lat != null && next.lng != null) ? { lat: next.lat, lng: next.lng } : null,
      coords: (next.lat != null && next.lng != null) ? `${next.lat.toFixed(5)}, ${next.lng.toFixed(5)}` : '',
    }));
  }, [form.caveId, form.caveMode, caves]);

  // Beim Bearbeiten die vorhandenen Fotos nachladen — ohne sie sieht der
  // Fotobereich leer aus, obwohl längst welche zur Befahrung gehören.
  useEffect(() => {
    let alive = true;
    if (!editTrip?.id) { setExisting([]); return undefined; }
    setExisting(null);
    api.getPhotos(editTrip.id)
      .then(ps => { if (alive) setExisting(Array.isArray(ps) ? ps : []); })
      .catch(() => { if (alive) setExisting([]); });
    return () => { alive = false; };
  }, [editTrip]);

  // Foto endgültig entfernen — löscht auch die Dateien auf dem Server.
  const deleteExisting = async (id) => {
    setBusyDel(id);
    try {
      await api.deletePhoto(id);
      setExisting(list => (list || []).filter(p => p.id !== id));
      setAskDelete(null);
      if (onPhotosChanged) await onPhotosChanged();
    } catch (e) {
      setError(e?.message || 'Das Foto konnte nicht gelöscht werden.');
    } finally {
      setBusyDel(null);
    }
  };
  const isNew = form.caveMode==='new';
  const isEdit = !!editTrip;

  const mapTheme = { ...theme, bgCard: theme.card, bgElev: theme.bg2 };

  // Karten-Klick → Koordinaten
  const onMapClick = ({ lat, lng }) => {
    set('pickedCoords', { lat, lng });
    set('coords', `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    setCave(c => ({ ...c, lat, lng }));
  };
  // Manuelle Koordinaten-Eingabe parsen
  const onCoordsInput = (v) => {
    set('coords', v);
    const m = v.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
    if (m) {
      const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
      if (lat>=-90 && lat<=90 && lng>=-180 && lng<=180) {
        set('pickedCoords', { lat, lng });
        setCave(c => ({ ...c, lat, lng }));
      }
    }
  };

  // Vorschau soll die bearbeiteten Werte zeigen, nicht die gespeicherten
  const setCaveField = (k, v) => setCave(c => ({ ...c, [k]: v }));
  const addTo = (key, value, reset) => {
    const t = value.trim();
    if (t && !form[key].includes(t)) set(key, [...form[key], t]);
    reset('');
  };

  const caveName = isNew ? (form.newName || 'Neue Höhle') : (cave.name || 'Höhle wählen');
  const caveRegion = isNew ? form.newRegion : cave.region;
  const caveChanged = !isNew && !!form.caveId && !sameCave(cave, caveBase);

  // Team-Vorschläge: bekannte Namen (aus echten Daten) + aktuell gewählte
  const teamOptions = [...new Set([...knownTeam, ...form.team])];

  const addTeam = () => {
    const name = teamAdd.trim();
    if (name && !form.team.includes(name)) set('team', [...form.team, name]);
    setTeamAdd('');
  };

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []).map(file => ({ file, url: URL.createObjectURL(file) }));
    e.target.value = '';
    setFiles(f => [...f, ...picked]);
  };
  const removeFile = (i) => setFiles(f => { const url = f[i]?.url; if (url) URL.revokeObjectURL(url); return f.filter((_,k)=>k!==i); });

  const handleSave = async () => {
    setError('');
    if (!form.title.trim()) { setError('Bitte einen Titel angeben.'); return; }
    if (isNew && !form.newName.trim()) { setError('Bitte den Namen der neuen Höhle angeben.'); return; }
    if (!isNew && !form.caveId) { setError('Bitte eine Höhle auswählen.'); return; }
    setSaving(true);
    try {
      let caveId = form.caveId;
      if (isNew) {
        const created = await api.createCave({
          name: form.newName.trim(), region: form.newRegion.trim() || null, country: form.newCountry,
          type: form.newType, lat: form.pickedCoords?.lat ?? null, lng: form.pickedCoords?.lng ?? null,
        });
        caveId = created.id;
      } else if (caveId && caveChanged) {
        // Höhlendaten wurden im Formular geändert → mitspeichern.
        await api.updateCave(caveId, {
          name: cave.name.trim(), region: cave.region.trim() || null,
          country: cave.country || null, type: cave.type || null,
          depth_m: cave.depth === '' ? null : Number(cave.depth),
          length_m: cave.length === '' ? null : Number(cave.length),
          discovered_year: cave.year === '' ? null : Number(cave.year),
          notes: cave.notes.trim() || null,
          lat: cave.lat, lng: cave.lng,
        });
      }
      const payload = {
        cave_id: caveId, title: form.title.trim(), date: form.date,
        start_time: form.start, end_time: form.end,
        type: form.type, wet: form.wet, rope: form.rope,
        diff_t: form.diff.t, diff_k: form.diff.k, diff_p: form.diff.p,
        rating: form.rating || null, depth_m: Number(form.depth) || null, length_m: Number(form.length) || null,
        weather: form.weather.trim() || null, notes: form.notes.trim() || null,
        team: form.team, gear: form.gear, hazards: form.hazards,
        hero_icon: HERO_ICON[form.type] ?? 'tunnel', is_public: 0,
      };
      let targetId;
      if (isEdit) { await api.updateTrip(editTrip.id, payload); targetId = editTrip.id; }
      else { const saved = await api.createTrip(payload); targetId = saved.id; }
      // Fotos hochladen (sequenziell)
      if (files.length) {
        setUpProg({ done:0, total:files.length });
        for (let i=0; i<files.length; i++) {
          try { await api.uploadPhoto(targetId, files[i].file); } catch { /* einzelnes Foto darf scheitern */ }
          setUpProg({ done:i+1, total:files.length });
        }
      }
      if (onSaved) await onSaved();
      onClose();
    } catch (e) {
      setError(e?.message || 'Speichern fehlgeschlagen.');
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Sticky Top-Bar */}
      <div style={{ position:'sticky', top:0, zIndex:20, background:`${theme.bg}f2`, backdropFilter:'blur(12px)',
        borderBottom:`1px solid ${theme.line}`, padding:'16px 56px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onClose} style={{ appearance:'none', cursor:'pointer', fontFamily:'inherit',
          display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:10,
          background:'transparent', border:`1px solid ${theme.line}`, color:theme.textMute, fontSize:13.5, fontWeight:600 }}>
          <CLDIcon name="close" size={17} color={theme.textMute}/> Abbrechen
        </button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:theme.accent }}>{isEdit?'Bearbeiten':'Neuer Eintrag'}</div>
          <div style={{ fontFamily:'Fraunces, serif', fontSize:18, fontWeight:600, color:theme.text, marginTop:2 }}>{isEdit?'Befahrung bearbeiten':'Neue Befahrung'}</div>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ appearance:'none', cursor: saving?'default':'pointer', fontFamily:'inherit',
          display:'flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:11,
          background:theme.accent, border:'none', color:theme.bg, fontSize:13.5, fontWeight:700, opacity: saving?0.6:1,
          boxShadow:`0 6px 20px ${theme.accent}33` }}>
          <CLDIcon name="check" size={16} color={theme.bg} strokeWidth={2.4}/> {saving ? (upProg.total ? `Fotos ${upProg.done}/${upProg.total}…` : 'Speichert…') : 'Eintrag speichern'}
        </button>
      </div>

      {error && (
        <div style={{ margin:'16px 56px 0', padding:'12px 16px', borderRadius:11, background:theme.danger+'1a',
          border:`1px solid ${theme.danger}55`, color:theme.danger, fontSize:13.5, fontWeight:500 }}>{error}</div>
      )}

      {/* Zweispaltig */}
      <div style={{ display:'flex', gap:44, alignItems:'flex-start', padding:'34px 56px 72px' }}>
        {/* Formular */}
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:34 }}>
          {/* Höhle */}
          <Group theme={theme} n="01" title="Höhle">
            {!isEdit && (
            <div style={{ display:'flex', background:theme.card, border:`1px solid ${theme.line}`, borderRadius:12, padding:4, gap:3, marginBottom:16 }}>
              {[{k:'new',i:'plus',l:'Neue Höhle'},{k:'existing',i:'caves',l:'Bereits befahren'}].map(o=>(
                <button key={o.k} onClick={()=>set('caveMode',o.k)} style={{
                  flex:1, appearance:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
                  padding:'11px', borderRadius:9, fontSize:13, fontWeight:700,
                  background: form.caveMode===o.k?theme.accent:'transparent', color: form.caveMode===o.k?theme.bg:theme.textMute,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <CLDIcon name={o.i} size={15} color={form.caveMode===o.k?theme.bg:theme.textMute} strokeWidth={2}/> {o.l}
                </button>
              ))}
            </div>
            )}
            {isNew ? (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <Field theme={theme} label="Name der Höhle" value={form.newName} onChange={v=>set('newName',v)} placeholder="z. B. Blauhöhle" big/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <Field theme={theme} label="Region" value={form.newRegion} onChange={v=>set('newRegion',v)} placeholder="z. B. Schwäbische Alb"/>
                  <div>
                    <Lbl theme={theme}>Land</Lbl>
                    <select value={form.newCountry} onChange={e=>set('newCountry', e.target.value)} style={{
                      marginTop:8, width:'100%', appearance:'none', cursor:'pointer', padding:'12px 14px',
                      background:theme.card, border:`1px solid ${theme.line}`, borderRadius:11, color:theme.text,
                      fontSize:14, outline:'none', fontFamily:'inherit', colorScheme:'dark' }}>
                      {EU_COUNTRIES.map(c=>(
                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Seg theme={theme} label="Höhlentyp" options={['Horizontal','Vertikal','Labyrinth','Mixed']} value={form.newType} onChange={v=>set('newType',v)}/>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:340, overflowY:'auto' }} className="cld-strip">
                {caves.map(c=>(
                  <button key={c.id} onClick={()=>set('caveId',c.id)} style={{
                    appearance:'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                    padding:'13px 15px', borderRadius:11, display:'flex', alignItems:'center', gap:12,
                    background: form.caveId===c.id?theme.accentSoft:theme.card,
                    border:`1px solid ${form.caveId===c.id?theme.accent:theme.line}` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:form.caveId===c.id?theme.accent:'transparent', border:`1.5px solid ${form.caveId===c.id?theme.accent:theme.lineHi}` }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:theme.text }}>{c.name}</div>
                      <div style={{ fontSize:11.5, color:theme.textMute }}>{c.region} · {c.entries||0}× befahren</div>
                    </div>
                    <CLDIcon name="chevron-right" size={16} color={theme.textDim}/>
                  </button>
                ))}
              </div>
            )}

            {/* Daten der gewählten Höhle — auch nachträglich änderbar */}
            {!isNew && form.caveId && (
              <div style={{ marginTop:18, paddingTop:18, borderTop:`1px solid ${theme.line}` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.4, textTransform:'uppercase', color:theme.textMute }}>
                    Daten dieser Höhle
                  </span>
                  {caveChanged && (
                    <span style={{ fontSize:11, color:theme.accent, fontWeight:600 }}>wird mitgespeichert</span>
                  )}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <Field theme={theme} label="Name der Höhle" value={cave.name} onChange={v=>setCaveField('name',v)} placeholder="z. B. Blauhöhle" big/>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <Field theme={theme} label="Region" value={cave.region} onChange={v=>setCaveField('region',v)} placeholder="z. B. Schwäbische Alb"/>
                    <div>
                      <Lbl theme={theme}>Land</Lbl>
                      <select value={cave.country} onChange={e=>setCaveField('country', e.target.value)} style={{
                        marginTop:8, width:'100%', appearance:'none', cursor:'pointer', padding:'12px 14px',
                        background:theme.card, border:`1px solid ${theme.line}`, borderRadius:11, color:theme.text,
                        fontSize:14, outline:'none', fontFamily:'inherit', colorScheme:'dark' }}>
                        {EU_COUNTRIES.map(c=>(<option key={c.code} value={c.code}>{c.name} ({c.code})</option>))}
                      </select>
                    </div>
                  </div>
                  <Seg theme={theme} label="Höhlentyp" options={['Horizontal','Vertikal','Labyrinth','Mixed']} value={cave.type} onChange={v=>setCaveField('type',v)}/>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                    <Field theme={theme} label="Gesamttiefe (m)" value={cave.depth} onChange={v=>setCaveField('depth', v.replace(/[^0-9]/g,''))} placeholder="—"/>
                    <Field theme={theme} label="Gesamtlänge (m)" value={cave.length} onChange={v=>setCaveField('length', v.replace(/[^0-9]/g,''))} placeholder="—"/>
                    <Field theme={theme} label="Entdeckt (Jahr)" value={cave.year} onChange={v=>setCaveField('year', v.replace(/[^0-9]/g,'').slice(0,4))} placeholder="—"/>
                  </div>
                  <div>
                    <Lbl theme={theme}>Beschreibung der Höhle</Lbl>
                    <textarea value={cave.notes} onChange={e=>setCaveField('notes', e.target.value)} rows={6}
                      placeholder="Zustieg, Verlauf, Genehmigung, Besonderheiten…"
                      style={{ marginTop:8, width:'100%', resize:'vertical', appearance:'none', padding:'12px 14px',
                        background:theme.card, border:`1px solid ${theme.line}`, borderRadius:11, color:theme.text,
                        fontSize:13.5, lineHeight:1.5, outline:'none', fontFamily:'inherit' }}/>
                  </div>
                  <div style={{ fontSize:11.5, color:theme.textDim, lineHeight:1.5 }}>
                    In der Beschreibung: {FORMAT_HINWEIS}<br/>
                    Diese Angaben gehören zur Höhle, nicht zur einzelnen Befahrung — sie gelten
                    für alle Einträge zu {cave.name || 'dieser Höhle'}. Die Lage setzt du rechts auf der Karte.
                  </div>
                </div>
              </div>
            )}
          </Group>

          {/* Eckdaten */}
          <Group theme={theme} n="02" title="Eckdaten">
            <Field theme={theme} label="Titel der Tour" value={form.title} onChange={v=>set('title',v)} placeholder="z. B. Abstieg zum Schwarzen See" big/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:14 }}>
              <Field theme={theme} label="Datum" type="date" value={form.date} onChange={v=>set('date',v)} mono/>
              <Field theme={theme} label="Start" type="time" value={form.start} onChange={v=>set('start',v)} mono/>
              <Field theme={theme} label="Ende" type="time" value={form.end} onChange={v=>set('end',v)} mono/>
            </div>
            <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:14 }}>
              <Seg theme={theme} label="Typ" options={['Horizontal','Vertikal','Labyrinth','Mixed']} value={form.type} onChange={v=>set('type',v)}/>
              <Seg theme={theme} label="Wasser" options={['Trocken','Teilweise','Nass']} value={form.wet} onChange={v=>set('wet',v)}/>
              <Seg theme={theme} label="Seiltechnik" options={['Ohne','Mit Seil','SRT']} value={form.rope} onChange={v=>set('rope',v)}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16 }}>
              <Field theme={theme} label="Tiefe erreicht (m)" type="number" value={form.depth} onChange={v=>set('depth',v)} mono/>
              <Field theme={theme} label="Strecke (m)" type="number" value={form.length} onChange={v=>set('length',v)} mono/>
            </div>
          </Group>

          {/* Schwierigkeit */}
          <Group theme={theme} n="03" title="Schwierigkeit & Bewertung">
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {[{k:'t',l:'Technisch',h:'Kletterstellen, SRT, Engstellen',c:theme.accent},
                {k:'k',l:'Körperlich',h:'Dauer, Gewicht, Schwimmstrecken',c:theme.rope},
                {k:'p',l:'Psychisch',h:'Ausgesetztheit, Orientierung, Enge',c:theme.cool}].map(a=>(
                <div key={a.k}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
                    <div>
                      <span style={{ fontSize:14, fontWeight:600, color:theme.text }}>{a.l}</span>
                      <span style={{ fontSize:11.5, color:theme.textMute, marginLeft:10 }}>{a.h}</span>
                    </div>
                    <span style={{ fontFamily:'Fraunces, serif', fontSize:24, fontWeight:600, color:a.c, lineHeight:1 }}>{form.diff[a.k]}</span>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} onClick={()=>set('diff',{...form.diff,[a.k]:n})} style={{
                        flex:1, height:34, appearance:'none', border:'none', cursor:'pointer', borderRadius:8,
                        background: n<=form.diff[a.k]?a.c:theme.card, color: n<=form.diff[a.k]?theme.bg:theme.textDim,
                        fontFamily:'inherit', fontSize:13, fontWeight:700 }}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <Lbl theme={theme}>Persönliche Bewertung</Lbl>
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>set('rating', n===form.rating?0:n)} style={{ appearance:'none', border:'none', background:'transparent', cursor:'pointer', padding:2 }}>
                      <CLDIcon name={n<=form.rating?'star-filled':'star'} size={30} color={n<=form.rating?theme.star:theme.lineHi} strokeWidth={1.4}/>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Group>

          {/* Bericht */}
          <Group theme={theme} n="04" title="Bericht, Team, Ausrüstung & Gefahren">
            <Lbl theme={theme}>Tourbericht</Lbl>
            <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={5} placeholder="Erzähl, was du erlebt hast…"
              style={{ marginTop:8, width:'100%', resize:'vertical', appearance:'none', padding:'14px 16px',
                background:theme.card, border:`1px solid ${theme.line}`, borderRadius:12, color:theme.text,
                fontFamily:'Fraunces, serif', fontSize:15, lineHeight:1.55, outline:'none' }}/>
            <div style={{ marginTop:18 }}>
              <Field theme={theme} label="Wetter" value={form.weather} onChange={v=>set('weather',v)} placeholder="z. B. Schneefall, −4 °C"/>
            </div>
            <Lbl theme={theme} style={{ marginTop:18 }}>Begleiter</Lbl>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:8 }}>
              {teamOptions.map(p=>{
                const on = form.team.includes(p);
                return <button key={p} onClick={()=>set('team', on?form.team.filter(x=>x!==p):[...form.team,p])} style={{
                  appearance:'none', cursor:'pointer', fontFamily:'inherit', padding:'8px 13px', borderRadius:999, fontSize:12.5, fontWeight:600,
                  background: on?theme.accentSoft:theme.card, border:`1px solid ${on?theme.accent:theme.line}`, color:on?theme.accent:theme.text }}>
                  {on?'✓ ':''}{p}</button>;
              })}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <input value={teamAdd} onChange={e=>setTeamAdd(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addTeam(); } }}
                placeholder="Begleiter hinzufügen…" style={{ flex:1, appearance:'none', padding:'10px 13px', background:theme.card,
                border:`1px solid ${theme.line}`, borderRadius:10, color:theme.text, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
              <button onClick={addTeam} style={{ appearance:'none', cursor:'pointer', border:`1px solid ${theme.line}`, background:theme.card,
                borderRadius:10, padding:'0 16px', color:theme.accent, fontFamily:'inherit', fontSize:13, fontWeight:600 }}>Hinzufügen</button>
            </div>

            {/* Ausrüstung */}
            <Lbl theme={theme} style={{ marginTop:18 }}>Ausrüstung</Lbl>
            <ChipList theme={theme} items={form.gear} onRemove={g=>set('gear', form.gear.filter(x=>x!==g))}
              empty="Noch nichts erfasst."/>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <input value={gearAdd} onChange={e=>setGearAdd(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addTo('gear', gearAdd, setGearAdd); } }}
                placeholder="z. B. Einfachseil 60 m, Steigzeug…" style={{ flex:1, appearance:'none', padding:'10px 13px', background:theme.card,
                border:`1px solid ${theme.line}`, borderRadius:10, color:theme.text, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
              <button onClick={()=>addTo('gear', gearAdd, setGearAdd)} style={{ appearance:'none', cursor:'pointer', border:`1px solid ${theme.line}`,
                background:theme.card, borderRadius:10, padding:'0 16px', color:theme.accent, fontFamily:'inherit', fontSize:13, fontWeight:600 }}>Hinzufügen</button>
            </div>

            {/* Gefahren */}
            <Lbl theme={theme} style={{ marginTop:18 }}>Gefahren</Lbl>
            <ChipList theme={theme} items={form.hazards} tone="danger"
              onRemove={h=>set('hazards', form.hazards.filter(x=>x!==h))} empty="Noch nichts erfasst."/>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <input value={hazAdd} onChange={e=>setHazAdd(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addTo('hazards', hazAdd, setHazAdd); } }}
                placeholder="z. B. Steinschlag, Hochwassergefahr…" style={{ flex:1, appearance:'none', padding:'10px 13px', background:theme.card,
                border:`1px solid ${theme.line}`, borderRadius:10, color:theme.text, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
              <button onClick={()=>addTo('hazards', hazAdd, setHazAdd)} style={{ appearance:'none', cursor:'pointer', border:`1px solid ${theme.line}`,
                background:theme.card, borderRadius:10, padding:'0 16px', color:theme.accent, fontFamily:'inherit', fontSize:13, fontWeight:600 }}>Hinzufügen</button>
            </div>
          </Group>

          {/* Fotos */}
          <Group theme={theme} n="05" title="Fotos">
            {/* Bereits hochgeladene Fotos — nur beim Bearbeiten */}
            {isEdit && (
              existing === null ? (
                <div style={{ fontSize:12.5, color:theme.textMute, marginBottom:14 }}>Vorhandene Fotos werden geladen…</div>
              ) : existing.length > 0 ? (
                <div style={{ marginBottom:18 }}>
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:9 }}>
                    <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:theme.textMute }}>
                      Bereits hochgeladen · {existing.length}
                    </span>
                    {isAdmin && <span style={{ fontSize:11.5, color:theme.textDim }}>× entfernt ein Foto endgültig</span>}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:10 }}>
                    {existing.map(p => (
                      <div key={p.id} style={{ position:'relative', height:84, borderRadius:10, overflow:'hidden',
                        border:`1px solid ${askDelete===p.id ? theme.danger : theme.line}`,
                        opacity: busyDel===p.id ? 0.5 : 1, transition:'border-color 0.15s, opacity 0.15s' }}>
                        <CLDPhoto photo={adaptPhoto(p)} theme={theme} grade={false} w={110}/>

                        {isAdmin && askDelete !== p.id && (
                          <button onClick={()=>setAskDelete(p.id)} title="Foto löschen" style={{
                            position:'absolute', top:5, right:5, width:24, height:24, borderRadius:'50%',
                            appearance:'none', border:'none', cursor:'pointer', background:`${theme.bg}cc`,
                            backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <CLDIcon name="close" size={13} color={theme.text}/>
                          </button>
                        )}

                        {/* Sicherheitsabfrage direkt auf dem Bild */}
                        {askDelete === p.id && (
                          <div style={{ position:'absolute', inset:0, background:`${theme.bg}ee`, backdropFilter:'blur(3px)',
                            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:7, padding:6 }}>
                            <span style={{ fontSize:11, color:theme.text, fontWeight:600 }}>Wirklich löschen?</span>
                            <div style={{ display:'flex', gap:6 }}>
                              <button onClick={()=>deleteExisting(p.id)} disabled={busyDel===p.id} style={{
                                appearance:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
                                background:theme.danger, color:'#fff', borderRadius:6, padding:'5px 10px',
                                fontSize:11, fontWeight:700 }}>Ja</button>
                              <button onClick={()=>setAskDelete(null)} style={{
                                appearance:'none', cursor:'pointer', fontFamily:'inherit',
                                background:'transparent', border:`1px solid ${theme.lineHi}`, color:theme.textMute,
                                borderRadius:6, padding:'5px 10px', fontSize:11 }}>Nein</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize:12.5, color:theme.textDim, marginBottom:14 }}>
                  Zu dieser Befahrung gibt es noch keine Fotos.
                </div>
              )
            )}

            <input id="cld-new-files" type="file" accept="image/*" multiple onChange={onPickFiles} style={{ display:'none' }}/>
            <label htmlFor="cld-new-files" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10,
              height:140, borderRadius:14, border:`1px dashed ${theme.lineHi}`, background:theme.card, cursor:'pointer', color:theme.textMute }}>
              <CLDIcon name="camera" size={26} color={theme.accent}/>
              <span style={{ fontSize:13.5, fontWeight:600, color:theme.text }}>{isEdit ? 'Weitere Fotos hinzufügen' : 'Fotos auswählen'}</span>
              <span style={{ fontSize:11.5 }}>{files.length ? `${files.length} ausgewählt` : 'JPEG/PNG · werden beim Speichern hochgeladen'}</span>
            </label>
            {files.length>0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:10, marginTop:12 }}>
                {files.map((f,i)=>(
                  <div key={i} style={{ position:'relative', height:84, borderRadius:10, overflow:'hidden', border:`1px solid ${theme.line}` }}>
                    <img src={f.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                    <button onClick={()=>removeFile(i)} style={{ position:'absolute', top:5, right:5, width:24, height:24, borderRadius:'50%',
                      appearance:'none', border:'none', cursor:'pointer', background:`${theme.bg}cc`, backdropFilter:'blur(4px)',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <CLDIcon name="close" size={13} color={theme.text}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Group>
        </div>

        {/* Rechte Rail: Karte + Vorschau */}
        <aside style={{ width:380, flexShrink:0, position:'sticky', top:88, display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:theme.textMute }}>Eingang auf Karte setzen</span>
              <CLDIcon name="pin" size={15} color={theme.accent}/>
            </div>
            {/* Echter Mapy-Pin-Picker */}
            <div style={{ height:230, borderRadius:12, overflow:'hidden', border:`1px solid ${theme.line}` }}>
              <CLMapyMap center={[48.5,11]} zoom={6} theme={mapTheme} height="100%"
                onMapClick={onMapClick} pickedCoords={form.pickedCoords}/>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <input value={form.coords} onChange={e=>onCoordsInput(e.target.value)} placeholder="48.48500, 9.55300"
                style={{ flex:1, appearance:'none', padding:'10px 12px', background:theme.bg2, border:`1px solid ${theme.line}`, borderRadius:10, color:theme.text, fontFamily:'JetBrains Mono, monospace', fontSize:12, outline:'none' }}/>
            </div>
          </div>

          {/* Live-Vorschau */}
          <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px 0', fontSize:10.5, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:theme.textMute }}>Vorschau</div>
            <div style={{ height:150, margin:'12px 0 0', position:'relative' }}>
              <CLDPhoto photo={null} theme={theme} grade={false} w={600}/>
              <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg, transparent 40%, ${theme.card})` }}/>
              {form.rating>0 && <div style={{ position:'absolute', top:12, right:12, background:`${theme.bg}b0`, backdropFilter:'blur(6px)', borderRadius:999, padding:'4px 9px' }}><CLDStars value={form.rating} size={11} theme={theme}/></div>}
            </div>
            <div style={{ padding:'0 16px 16px', marginTop:-6, position:'relative' }}>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.6, color:theme.accent, marginBottom:5 }}>{(caveName||'').toUpperCase()}{caveRegion?` · ${caveRegion}`:''}</div>
              <div style={{ fontFamily:'Fraunces, serif', fontSize:19, fontWeight:600, color:theme.text, lineHeight:1.15, letterSpacing:-0.3, marginBottom:12 }}>{form.title || 'Titel der Tour'}</div>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:12 }}>
                <CLDChip label={form.type} theme={theme}/>
                <CLDChip label={form.wet} theme={theme} tone={form.wet!=='Trocken'?'cool':'neutral'}/>
                <CLDChip label={form.rope} theme={theme} tone={form.rope!=='Ohne'?'rope':'neutral'}/>
              </div>
              <div style={{ paddingTop:12, borderTop:`1px solid ${theme.line}` }}>
                <CLDDifficulty diff={form.diff} theme={theme} mode={diffMode}/>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Group = ({ theme, n, title, children }) => (
  <section>
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
      <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:theme.accent, fontWeight:600 }}>{n}</span>
      <h2 style={{ margin:0, fontFamily:'Fraunces, serif', fontSize:22, fontWeight:600, color:theme.text, letterSpacing:-0.3 }}>{title}</h2>
      <div style={{ flex:1, height:1, background:theme.line }}/>
    </div>
    {children}
  </section>
);
const Lbl = ({ theme, style, children }) => (
  <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.4, textTransform:'uppercase', color:theme.textMute, ...style }}>{children}</div>
);
const Field = ({ theme, label, value, onChange, placeholder, mono, big, type='text' }) => (
  <div>
    <Lbl theme={theme}>{label}</Lbl>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ marginTop:8, width:'100%', appearance:'none', padding:'12px 14px', background:theme.card, border:`1px solid ${theme.line}`, borderRadius:11,
        color:theme.text, outline:'none', colorScheme:'dark',
        fontFamily: mono?'JetBrains Mono, monospace':(big?'Fraunces, serif':'inherit'),
        fontSize: big?17:14, fontWeight: big?500:400 }}/>
  </div>
);
const Seg = ({ theme, label, options, value, onChange }) => (
  <div>
    <Lbl theme={theme}>{label}</Lbl>
    <div style={{ marginTop:8, display:'flex', background:theme.card, border:`1px solid ${theme.line}`, borderRadius:11, padding:3, gap:2 }}>
      {options.map(o=>(
        <button key={o} onClick={()=>onChange(o)} style={{
          flex:1, appearance:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:'10px 6px', borderRadius:8, fontSize:12.5, fontWeight:600,
          background: value===o?theme.accent:'transparent', color: value===o?theme.bg:theme.textMute }}>{o}</button>
      ))}
    </div>
  </div>
);

// Liste entfernbarer Einträge (Ausrüstung, Gefahren)
const ChipList = ({ theme, items, onRemove, tone='neutral', empty }) => {
  if (!items.length) return <div style={{ fontSize:12, color:theme.textDim, marginTop:8, fontStyle:'italic' }}>{empty}</div>;
  const col = tone === 'danger' ? theme.danger : theme.accent;
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:8 }}>
      {items.map(it=>(
        <span key={it} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 10px 8px 13px',
          borderRadius:999, fontSize:12.5, fontWeight:600, background:`${col}18`, border:`1px solid ${col}55`, color:theme.text }}>
          {it}
          <button onClick={()=>onRemove(it)} title="Entfernen" style={{ appearance:'none', border:'none', background:'transparent',
            cursor:'pointer', padding:0, display:'flex', alignItems:'center' }}>
            <CLDIcon name="close" size={12} color={col}/>
          </button>
        </span>
      ))}
    </div>
  );
};

export default CLDNew;
