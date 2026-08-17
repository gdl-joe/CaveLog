// PlansSection — Pläne einer Höhle in der Mobile-Welt.
//
// Mobil gibt es keine eigene Höhlenseite; die Pläne erscheinen deshalb in der
// Befahrungsansicht, deutlich als Angaben zur Höhle gekennzeichnet. Bilder
// öffnen sich im Vollbild, PDFs im Betrachter des Geräts.
import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { CLSection } from '../atoms.jsx';
import CLIcon from '../icons.jsx';

const KIND_LABEL = {
  grundriss: 'Grundriss', schnitt: 'Schnitt', karte: 'Karte', sonstiges: 'Plan',
};
const fmtBytes = (b) => !b ? '' : (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function PlansSection({ caveId, caveName, theme }) {
  const [plans, setPlans] = useState(null);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!caveId) { setPlans([]); return undefined; }
    api.getPlans(caveId)
      .then(p => { if (alive) setPlans(Array.isArray(p) ? p : []); })
      .catch(() => { if (alive) setPlans([]); });   // vor der Migration schlicht leer
    return () => { alive = false; };
  }, [caveId]);

  // Ohne Pläne bleibt der Abschnitt ganz weg — kein leerer Platzhalter.
  if (!plans || plans.length === 0) return null;

  const open = (p) => {
    if (p.is_pdf) window.open(p.url, '_blank', 'noopener,noreferrer');
    else setViewer(p);
  };

  return (
    <>
      <CLSection title={`Pläne${caveName ? ` · ${caveName}` : ''}`} theme={theme}>
        <div style={{ fontSize: 11, color: theme.textMute, marginBottom: 10 }}>
          Gelten für alle Befahrungen dieser Höhle.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {plans.map(p => (
            <button key={p.id} onClick={() => open(p)} style={{
              appearance: 'none', border: `1px solid ${theme.border}`, background: theme.bgCard,
              borderRadius: 10, overflow: 'hidden', padding: 0, cursor: 'pointer',
              textAlign: 'left', fontFamily: 'inherit', display: 'block',
            }}>
              <div style={{ height: 92, position: 'relative', background: theme.bgSubtle }}>
                {p.is_pdf ? (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <CLIcon name="expand" size={22} color={theme.accent} />
                    <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: theme.textMute }}>PDF</span>
                  </div>
                ) : (
                  <img src={p.thumb || p.url} alt={p.title} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
                <span style={{ position: 'absolute', top: 6, left: 6, padding: '2px 7px', borderRadius: 999,
                  background: theme.bg + 'dd', fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
                  textTransform: 'uppercase', color: theme.accent }}>
                  {KIND_LABEL[p.kind] || 'Plan'}
                </span>
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, lineHeight: 1.25, wordBreak: 'break-word' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 10, color: theme.textDim, marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                  {fmtBytes(p.bytes)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CLSection>

      {viewer && <PlanFullscreen plan={viewer} theme={theme} onClose={() => setViewer(null)} />}
    </>
  );
}

// ── Vollbild mit Doppeltipp-Zoom ──────────────────────────
function PlanFullscreen({ plan, theme, onClose }) {
  const [zoom, setZoom] = useState(1);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#000',
      display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        padding: 'max(12px, env(safe-area-inset-top)) 14px 12px', flexShrink: 0 }}>
        <button onClick={onClose} style={{ appearance: 'none', border: 'none', background: 'rgba(255,255,255,0.12)',
          borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer' }}>
          <CLIcon name="close" size={18} color="#fff" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis' }}>{plan.title}</div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>
            {KIND_LABEL[plan.kind] || 'Plan'} · {fmtBytes(plan.bytes)}
          </div>
        </div>
        <button onClick={() => setZoom(z => z > 1 ? 1 : 2.5)} style={{
          appearance: 'none', border: 'none', background: 'rgba(255,255,255,0.12)', borderRadius: 8,
          padding: '0 12px', height: 36, color: '#fff', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit' }}>
          {zoom > 1 ? '100 %' : 'Zoom'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex',
        alignItems: zoom > 1 ? 'flex-start' : 'center', justifyContent: zoom > 1 ? 'flex-start' : 'center' }}>
        <img src={plan.url} alt={plan.title} onDoubleClick={() => setZoom(z => z > 1 ? 1 : 2.5)}
          style={{ width: zoom > 1 ? `${zoom * 100}%` : 'auto',
            maxWidth: zoom > 1 ? 'none' : '100%', maxHeight: zoom > 1 ? 'none' : '100%',
            objectFit: 'contain', display: 'block' }} />
      </div>

      <div style={{ flexShrink: 0, textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,0.4)',
        padding: '10px 14px max(12px, env(safe-area-inset-bottom))' }}>
        Doppeltippen zoomt
      </div>
    </div>
  );
}
