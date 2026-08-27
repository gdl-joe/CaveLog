// view-plans.jsx — Pläne einer Höhle: Grundrisse, Schnitte, Kartenausschnitte.
//
// Bewusst getrennt von den Fotos: Pläne gehören zur Höhle und gelten für alle
// Befahrungen. Bilder öffnen sich im Vollbild mit Zoom, PDFs im Betrachter des
// Geräts (neuer Tab) — dort gibt es Suche, Drucken und Weitergeben umsonst.
import { useState, useEffect, useCallback, useRef } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDPhoto } from './photos.jsx';
import { api } from '../api.js';
import { safeUrl } from '../safe-url.js';

export const PLAN_KINDS = [
  { k: 'grundriss', l: 'Grundriss', i: 'layers' },
  { k: 'schnitt',   l: 'Schnitt',   i: 'depth'  },
  { k: 'karte',     l: 'Karte',     i: 'map'    },
  { k: 'sonstiges', l: 'Sonstiges', i: 'expand' },
];
const kindLabel = (k) => PLAN_KINDS.find(x => x.k === k)?.l || 'Sonstiges';
const kindIcon  = (k) => PLAN_KINDS.find(x => x.k === k)?.i || 'expand';

export const fmtBytes = (b) => {
  if (!b) return '';
  return b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
};

/** Ein Plan als Foto-Objekt für CLDPhoto (nur Bilder haben eine Vorschau). */
const asPhoto = (p) => ({
  url: p.url, thumb: p.thumb || p.url, full: p.url, original: p.url,
  width: p.width, height: p.height, caption: p.title,
});

// ══════════════════════════════════════════════════════════
export default function CLDPlans({ caveId, caveName, theme, isAdmin = false, compact = false }) {
  const [plans, setPlans]   = useState(null);
  const [error, setError]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [viewer, setViewer] = useState(null);   // Bild im Vollbild
  const [askDel, setAskDel] = useState(null);
  const [rename, setRename] = useState(null);   // { id, title }
  const fileRef = useRef(null);
  const [kind, setKind] = useState('grundriss');

  const load = useCallback(async () => {
    if (!caveId) return;
    setError('');
    try { setPlans(await api.getPlans(caveId)); }
    catch (e) {
      // Vor der Migration gibt es die Tabelle noch nicht — das ist kein Drama,
      // der Bereich bleibt dann einfach leer.
      setPlans([]);
      if (e?.status !== 409) setError(e?.message || 'Die Pläne konnten nicht geladen werden.');
    }
  }, [caveId]);

  useEffect(() => { load(); }, [load]);

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true); setError('');
    for (const f of files) {
      try { await api.uploadPlan(caveId, f, { kind }); }
      catch (e) { setError(e?.message || `„${f.name}" wurde nicht angenommen.`); }
    }
    await load();
    setBusy(false);
  };

  const remove = async (id) => {
    setBusy(true);
    try { await api.deletePlan(id); setPlans(l => l.filter(p => p.id !== id)); setAskDel(null); }
    catch (e) { setError(e?.message || 'Der Plan konnte nicht gelöscht werden.'); }
    finally { setBusy(false); }
  };

  const saveTitle = async () => {
    if (!rename?.title.trim()) { setRename(null); return; }
    setBusy(true);
    try {
      const u = await api.updatePlan(rename.id, { title: rename.title.trim() });
      setPlans(l => l.map(p => p.id === u.id ? u : p));
      setRename(null);
    } catch (e) { setError(e?.message || 'Die Bezeichnung wurde nicht übernommen.'); }
    finally { setBusy(false); }
  };

  const open = (p) => {
    // PDFs übernimmt der Betrachter des Geräts, Bilder zeigen wir selbst.
    if (p.is_pdf) window.open(p.url, '_blank', 'noopener,noreferrer');
    else setViewer(p);
  };

  if (plans === null) {
    return <div style={{ fontSize: 13, color: theme.textMute, padding: '10px 0' }}>Pläne werden geladen…</div>;
  }

  const empty = plans.length === 0;

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 14, padding: '11px 14px', borderRadius: 11,
          background: theme.danger + '15', border: `1px solid ${theme.danger}44`,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <CLDIcon name="warning" size={16} color={theme.danger} />
          <span style={{ flex: 1, fontSize: 13, color: theme.text }}>{error}</span>
          <button onClick={() => setError('')} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}>
            <CLDIcon name="close" size={14} color={theme.textMute} />
          </button>
        </div>
      )}

      {/* Hochladen — nur Bearbeiter */}
      {isAdmin && (
        <div style={{ marginBottom: empty ? 0 : 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, color: theme.textMute }}>Neuer Plan als</span>
            {PLAN_KINDS.map(o => (
              <button key={o.k} onClick={() => setKind(o.k)} style={{
                appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                padding: '6px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: kind === o.k ? theme.accentSoft : 'transparent',
                border: `1px solid ${kind === o.k ? theme.accent : theme.line}`,
                color: kind === o.k ? theme.accent : theme.textMute,
              }}>{o.l}</button>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" multiple
            onChange={e => { const f = [...(e.target.files || [])]; e.target.value = ''; upload(f); }}
            style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} disabled={busy} style={{
            appearance: 'none', border: `1px dashed ${theme.lineHi}`, cursor: busy ? 'default' : 'pointer',
            fontFamily: 'inherit', width: '100%', padding: '14px', borderRadius: 12,
            background: theme.card, color: theme.textMute, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: busy ? 0.6 : 1,
          }}>
            <CLDIcon name="plus" size={16} color={theme.accent} strokeWidth={2.2} />
            {busy ? 'Wird hochgeladen…' : `${kindLabel(kind)} hinzufügen — JPG, PNG oder PDF`}
          </button>
        </div>
      )}

      {empty ? (
        <div style={{ fontSize: 13, color: theme.textDim, lineHeight: 1.6, paddingTop: isAdmin ? 14 : 0 }}>
          {isAdmin
            ? 'Noch keine Pläne hinterlegt. Grundrisse, Schnitte und Kartenausschnitte gelten für alle Befahrungen dieser Höhle.'
            : `Für ${caveName || 'diese Höhle'} sind noch keine Pläne hinterlegt.`}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12,
          gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(auto-fill, minmax(190px, 1fr))' }}>
          {plans.map(p => (
            <div key={p.id} style={{
              background: theme.card, border: `1px solid ${askDel === p.id ? theme.danger : theme.line}`,
              borderRadius: 13, overflow: 'hidden', position: 'relative',
              opacity: busy && askDel === p.id ? 0.5 : 1,
            }}>
              {/* Vorschau */}
              <button onClick={() => open(p)} title={p.is_pdf ? 'Im PDF-Betrachter öffnen' : 'Groß anzeigen'}
                style={{ appearance: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
                  height: compact ? 104 : 130, display: 'block', position: 'relative', background: theme.bg2 }}>
                {p.is_pdf ? (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <CLDIcon name="file-pdf" size={30} color={theme.accent} />
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: theme.textMute }}>PDF</span>
                  </div>
                ) : (
                  <CLDPhoto photo={asPhoto(p)} theme={theme} grade={false} w={compact ? 200 : 260} />
                )}
                <span style={{ position: 'absolute', top: 8, left: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 8px', borderRadius: 999, background: `${theme.bg}cc`, backdropFilter: 'blur(4px)',
                  fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.accent }}>
                  <CLDIcon name={kindIcon(p.kind)} size={11} color={theme.accent} /> {kindLabel(p.kind)}
                </span>
              </button>

              {/* Beschriftung */}
              <div style={{ padding: '10px 12px 12px' }}>
                {rename?.id === p.id ? (
                  <input autoFocus value={rename.title}
                    onChange={e => setRename(r => ({ ...r, title: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setRename(null); }}
                    onBlur={saveTitle}
                    style={{ width: '100%', appearance: 'none', padding: '6px 8px', borderRadius: 7,
                      background: theme.bg, border: `1px solid ${theme.accent}`, color: theme.text,
                      fontSize: 12.5, outline: 'none', fontFamily: 'inherit' }} />
                ) : (
                  <div onClick={() => isAdmin && setRename({ id: p.id, title: p.title })}
                    title={isAdmin ? 'Zum Umbenennen klicken' : undefined}
                    style={{ fontSize: 12.5, fontWeight: 600, color: theme.text, lineHeight: 1.3,
                      cursor: isAdmin ? 'text' : 'default', wordBreak: 'break-word' }}>
                    {p.title}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <span style={{ fontSize: 10.5, color: theme.textDim, fontFamily: 'JetBrains Mono, monospace' }}>
                    {fmtBytes(p.bytes)}{p.width ? ` · ${p.width}×${p.height}` : ''}
                  </span>
                  <div style={{ flex: 1 }} />
                  {isAdmin && askDel !== p.id && (
                    <button onClick={() => setAskDel(p.id)} title="Plan löschen" style={{
                      appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, display: 'flex' }}>
                      <CLDIcon name="trash" size={14} color={theme.textDim} />
                    </button>
                  )}
                </div>

                {askDel === p.id && (
                  <div style={{ marginTop: 9, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, color: theme.text, flex: 1 }}>Löschen?</span>
                    <button onClick={() => remove(p.id)} style={{
                      appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: theme.danger, color: '#fff', borderRadius: 6, padding: '5px 10px',
                      fontSize: 11, fontWeight: 700 }}>Ja</button>
                    <button onClick={() => setAskDel(null)} style={{
                      appearance: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent',
                      border: `1px solid ${theme.lineHi}`, color: theme.textMute, borderRadius: 6,
                      padding: '5px 10px', fontSize: 11 }}>Nein</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vollbild für Bild-Pläne */}
      {viewer && <PlanViewer plan={viewer} theme={theme} onClose={() => setViewer(null)} />}
    </div>
  );
}

// ── Vollbild mit Zoom ─────────────────────────────────────
function PlanViewer({ plan, theme, onClose }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z * 1.4, 8));
      if (e.key === '-') setZoom(z => Math.max(z / 1.4, 1));
      if (e.key === '0') setZoom(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const btn = {
    appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
    backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 9,
    width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: '#05070a',
      display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', flexShrink: 0 }}>
        <button onClick={onClose} style={{ ...btn, width: 'auto', padding: '0 14px', gap: 8 }}>
          <CLDIcon name="close" size={16} color="#fff" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Schließen</span>
        </button>
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis' }}>{plan.title}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
            {kindLabel(plan.kind)} · {fmtBytes(plan.bytes)}
          </div>
        </div>
        <button onClick={() => setZoom(z => Math.max(z / 1.4, 1))} title="Verkleinern" style={btn}>−</button>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace', minWidth: 44, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => setZoom(z => Math.min(z * 1.4, 8))} title="Vergrößern" style={btn}>+</button>
        <a href={safeUrl(plan.url) || undefined} target="_blank" rel="noopener noreferrer" title="In neuem Tab öffnen"
          style={{ ...btn, textDecoration: 'none' }}>
          <CLDIcon name="expand" size={16} color="#fff" />
        </a>
      </div>

      <div className="cld-scroll" style={{ flex: 1, overflow: 'auto', display: 'flex',
        alignItems: zoom > 1 ? 'flex-start' : 'center', justifyContent: zoom > 1 ? 'flex-start' : 'center', padding: 16 }}>
        <img src={plan.url} alt={plan.title} onDoubleClick={() => setZoom(z => z > 1 ? 1 : 2.5)}
          style={{ width: zoom > 1 ? `${zoom * 100}%` : 'auto',
            maxWidth: zoom > 1 ? 'none' : '100%', maxHeight: zoom > 1 ? 'none' : '100%',
            objectFit: 'contain', display: 'block', cursor: zoom > 1 ? 'grab' : 'zoom-in' }} />
      </div>

      <div style={{ flexShrink: 0, textAlign: 'center', padding: '0 20px 14px',
        fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
        Doppelklick zoomt · + / − / 0 · Esc schließt
      </div>
    </div>
  );
}
