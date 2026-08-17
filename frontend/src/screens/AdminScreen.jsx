// Verwaltung (Mobile) — Zugänge einrichten und System pflegen.
// Gleiche Funktionen wie die Desktop-Verwaltung, nur auf Handy-Breite gedacht.
import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import { CLSection } from '../atoms.jsx';
import CLIcon from '../icons.jsx';

const ROLE = {
  admin:  { label: 'Bearbeiter', desc: 'Darf anlegen, ändern, Fotos hochladen.' },
  viewer: { label: 'Betrachter', desc: 'Sieht alles, ändert nichts.' },
};
const STATUS = {
  active:  { label: 'Aktiv',            key: 'success' },
  invited: { label: 'Einladung offen',  key: 'accent'  },
  reset:   { label: 'Neuer Link offen', key: 'warm'    },
  blocked: { label: 'Gesperrt',         key: 'danger'  },
};

const initialsOf = (n = '?') => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = (s) => {
  if (!s) return null;
  const d = new Date(String(s).replace(' ', 'T'));
  return isNaN(d) ? null : d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
};

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* Rückfallweg */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

// ══════════════════════════════════════════════════════════
export default function AdminScreen({ theme, user, onBack }) {
  const [users, setUsers]   = useState(null);
  const [sys, setSys]       = useState(null);
  const [error, setError]   = useState('');
  const [note, setNote]     = useState('');
  const [adding, setAdding] = useState(false);
  const [busy, setBusy]     = useState('');
  const [photoRun, setPhotoRun] = useState(null);

  const loadUsers = useCallback(async () => {
    try { setUsers(await api.getUsers()); }
    catch (e) { setError(e?.message || 'Die Zugänge konnten nicht geladen werden.'); setUsers([]); }
  }, []);
  const loadSys = useCallback(async () => {
    try { setSys(await api.getSystem()); } catch { setSys(false); }
  }, []);

  useEffect(() => { loadUsers(); loadSys(); }, [loadUsers, loadSys]);

  const patch = async (id, data) => {
    setError('');
    try { const u = await api.updateUser(id, data); setUsers(l => l.map(x => x.id === id ? u : x)); }
    catch (e) { setError(e?.message || 'Die Änderung wurde nicht übernommen.'); }
  };
  const remove = async (id) => {
    setError('');
    try { await api.deleteUser(id); setUsers(l => l.filter(x => x.id !== id)); }
    catch (e) { setError(e?.message || 'Der Zugang konnte nicht gelöscht werden.'); }
  };
  const migrate = async () => {
    setBusy('migrate'); setError(''); setNote('');
    try {
      const r = await api.migrateDb();
      if (r.failed?.length) setError(r.failed.map(f => `${f.column}: ${f.error}`).join(' · '));
      else setNote(r.applied.length ? `Ergänzt: ${r.applied.join(', ')}` : 'Die Datenbank war bereits aktuell.');
      await loadSys();
    } catch (e) { setError(e?.message || 'Die Aktualisierung ist fehlgeschlagen.'); }
    finally { setBusy(''); }
  };
  const processPhotos = async () => {
    setBusy('photos'); setError(''); setNote('');
    const total = sys?.photos?.pending ?? 0;
    let done = 0, after = 0, guard = 0, skipped = 0;
    try {
      for (;;) {
        const r = await api.processPhotos(5, after);
        done += r.processed || 0;
        skipped += r.skipped?.length || 0;
        setPhotoRun({ done: done + skipped, total: total || (done + skipped + (r.remaining || 0)) });
        if (!r.remaining) break;
        if (r.lastId > after) { after = r.lastId; guard = 0; } else if (++guard > 2) break;
      }
      setNote(`${done} ${done === 1 ? 'Foto' : 'Fotos'} nachbearbeitet.`);
      await loadSys();
    } catch (e) {
      setError(e?.message || 'Die Nachbearbeitung ist fehlgeschlagen.');
    } finally { setBusy(''); setPhotoRun(null); }
  };

  const cleanup = async (paths) => {
    setBusy('cleanup'); setError(''); setNote('');
    try {
      const r = await api.cleanupFiles(paths);
      if (r.failed?.length) setError(r.failed.map(f => `${f.path}: ${f.error}`).join(' · '));
      else setNote(`Gelöscht: ${r.deleted.join(', ') || '(nichts)'}`);
      await loadSys();
    } catch (e) { setError(e?.message || 'Das Löschen ist fehlgeschlagen.'); }
    finally { setBusy(''); }
  };

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Kopf */}
      <div style={{ padding: '16px 18px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{
          appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
          padding: 0, display: 'flex', alignItems: 'center',
        }}>
          <CLIcon name="chevron-left" size={22} color={theme.textMute} />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: theme.text, lineHeight: 1.15 }}>Verwaltung</div>
          <div style={{ fontSize: 11.5, color: theme.textMute, marginTop: 2 }}>Zugänge und System</div>
        </div>
      </div>

      {error && <Note theme={theme} tone="danger" onClose={() => setError('')}>{error}</Note>}
      {note  && <Note theme={theme} tone="success" onClose={() => setNote('')}>{note}</Note>}

      {/* Zugänge */}
      <CLSection title="Zugänge" theme={theme}
        action={!adding && (
          <button onClick={() => setAdding(true)} style={{
            appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: theme.accent, padding: 0,
          }}>+ Einladen</button>
        )}>
        {adding && (
          <InviteForm theme={theme} onCancel={() => setAdding(false)} onError={setError}
            onCreated={(u) => { setUsers(l => [...l, u]); setAdding(false); }} />
        )}

        {users === null ? (
          <div style={{ fontSize: 12.5, color: theme.textMute, padding: '8px 2px' }}>Lädt…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map(u => (
              <UserCard key={u.id} u={u} theme={theme} isMe={u.id === user?.id} onPatch={patch} onRemove={remove} />
            ))}
          </div>
        )}
      </CLSection>

      {/* System */}
      {sys && sys !== false && (
        <CLSection title="System" theme={theme}>
          <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
              {(sys.checks || []).map(c => (
                <div key={c.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <span style={{
                    width: 17, height: 17, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    background: c.ok ? theme.success + '22' : theme.danger + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: c.ok ? theme.success : theme.danger,
                  }}>{c.ok ? '✓' : '!'}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: theme.text }}>{c.label}</div>
                    {!c.ok && <div style={{ fontSize: 11, color: theme.danger, marginTop: 2 }}>{c.hint}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}`, fontSize: 11, color: theme.textDim, fontFamily: 'JetBrains Mono, monospace' }}>
              PHP {sys.php} · {sys.driver === 'mysql' ? 'MySQL' : 'SQLite'}
            </div>
          </div>

          {/* Datenbank */}
          {sys.migrations?.length > 0 && (
            <div style={{ marginTop: 10, background: theme.accentSoft, border: `1px solid ${theme.accent}44`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>
                Datenbank ergänzen ({sys.migrations.length})
              </div>
              <div style={{ fontSize: 11.5, color: theme.textMute, lineHeight: 1.5, marginBottom: 12 }}>
                Es fehlen Felder für neuere Funktionen — unter anderem für Höhlen-Titelbilder.
                Vorhandene Daten bleiben unverändert.
              </div>
              <button onClick={migrate} disabled={!!busy} style={btnMain(theme, busy)}>
                {busy === 'migrate' ? 'Wird ergänzt…' : 'Datenbank aktualisieren'}
              </button>
            </div>
          )}

          {/* Fotos */}
          {sys.photos && sys.photos.pending > 0 && (
            <div style={{ marginTop: 10, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>
                Fotos nachbearbeiten ({sys.photos.pending})
              </div>
              <div style={{ fontSize: 11.5, color: theme.textMute, lineHeight: 1.5, marginBottom: 12 }}>
                Für diese Fotos fehlt die hochauflösende Fassung — im Vollbild wirken sie sonst weich.
                Die Originale bleiben unangetastet.
              </div>
              {busy === 'photos' && photoRun && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', borderRadius: 2, background: theme.accent,
                      width: `${photoRun.total ? Math.round(photoRun.done / photoRun.total * 100) : 0}%`, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMute }}>{photoRun.done} von {photoRun.total}</div>
                </div>
              )}
              <button onClick={processPhotos} disabled={!!busy} style={btnMain(theme, busy)}>
                {busy === 'photos' ? 'Läuft…' : 'Fotos nachbearbeiten'}
              </button>
            </div>
          )}

          {/* Altlasten */}
          {sys.leftovers?.length > 0 && (
            <div style={{ marginTop: 10, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 8 }}>
                Aufräumen ({sys.leftovers.length})
              </div>
              {sys.leftovers.map(l => (
                <div key={l.path} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, color: theme.text, fontWeight: 500 }}>{l.label}</span>
                    {l.risk === 'high' && <Badge theme={theme} color={theme.danger}>Risiko</Badge>}
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMute, marginTop: 2, lineHeight: 1.45 }}>{l.why}</div>
                  {!l.writable && <div style={{ fontSize: 11, color: theme.danger, marginTop: 3 }}>Keine Schreibrechte — bitte per FTP löschen.</div>}
                </div>
              ))}
              <button onClick={() => cleanup(sys.leftovers.filter(l => l.writable).map(l => l.path))} disabled={!!busy}
                style={btnMain(theme, busy)}>
                {busy === 'cleanup' ? 'Wird gelöscht…' : 'Alle entfernen'}
              </button>
            </div>
          )}

          {!sys.migrations?.length && !sys.leftovers?.length && !sys.photos?.pending && (
            <div style={{ marginTop: 10, fontSize: 12, color: theme.textMute, padding: '0 2px' }}>
              Datenbank aktuell, keine Altlasten auf dem Server.
            </div>
          )}
        </CLSection>
      )}
    </div>
  );
}

// ── Zugangs-Karte ─────────────────────────────────────────
function UserCard({ u, theme, isMe, onPatch, onRemove }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const st = STATUS[u.status] || STATUS.active;
  const tone = { success: theme.success, accent: theme.accent, warm: theme.warm, danger: theme.danger }[st.key];

  const copy = async () => {
    if (await copyText(u.invite_url)) { setCopied(true); setTimeout(() => setCopied(false), 2200); }
  };

  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 13, cursor: 'pointer' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${u.role === 'admin' ? theme.accent : theme.wet || theme.warm}, ${theme.warm})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12.5, fontWeight: 600, color: theme.bg, opacity: u.is_active ? 1 : 0.45,
        }}>{initialsOf(u.name)}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{u.name}</span>
            {isMe && <Badge theme={theme} color={theme.textMute}>Du</Badge>}
          </div>
          <div style={{ fontSize: 11, color: theme.textMute, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {u.email}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <Badge theme={theme} color={u.role === 'admin' ? theme.accent : theme.textMute}>{ROLE[u.role]?.label || u.role}</Badge>
          <Badge theme={theme} color={tone}>{st.label}</Badge>
        </div>
      </div>

      {/* Einladungslink */}
      {u.invite_url && (
        <div style={{ padding: '0 13px 13px' }}>
          <div style={{ background: theme.accentSoft, border: `1px dashed ${theme.accent}55`, borderRadius: 8, padding: 11 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.accent, marginBottom: 7 }}>
              {u.last_login ? 'Link zum Passwort-Neusetzen' : 'Einladungslink'}
              {u.invite_expires && <span style={{ fontWeight: 500, letterSpacing: 0, textTransform: 'none', color: theme.textMute }}>
                {' '}· bis {fmtDate(u.invite_expires)}</span>}
            </div>
            <div style={{
              fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', color: theme.textMute,
              background: theme.bg, borderRadius: 6, padding: '7px 9px', marginBottom: 8,
              wordBreak: 'break-all', lineHeight: 1.4,
            }}>{u.invite_url}</div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={copy} style={{
                flex: 1, appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: copied ? theme.success : theme.accent, color: theme.bg,
                borderRadius: 7, padding: '9px 12px', fontSize: 12.5, fontWeight: 700,
              }}>{copied ? '✓ Kopiert' : 'Link kopieren'}</button>
              <button onClick={() => onPatch(u.id, { revoke_invite: true })} style={{
                appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMute,
                borderRadius: 7, padding: '9px 12px', fontSize: 12,
              }}>Zurückziehen</button>
            </div>
          </div>
        </div>
      )}

      {/* Aufgeklappte Aktionen */}
      {open && (
        <div style={{ borderTop: `1px solid ${theme.border}`, padding: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: theme.textDim }}>
            {u.last_login ? `Zuletzt hier: ${fmtDate(u.last_login)}` : 'War noch nie angemeldet'}
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {!isMe && (
              <>
                <Act theme={theme} onClick={() => onPatch(u.id, { role: u.role === 'admin' ? 'viewer' : 'admin' })}>
                  {u.role === 'admin' ? 'Auf Betrachter zurückstufen' : 'Zum Bearbeiter machen'}
                </Act>
                <Act theme={theme} onClick={() => onPatch(u.id, { is_active: !u.is_active })}>
                  {u.is_active ? 'Sperren' : 'Freigeben'}
                </Act>
              </>
            )}
            <Act theme={theme} onClick={() => onPatch(u.id, { new_invite: true })}>Neuer Link</Act>
            {!isMe && <Act theme={theme} danger onClick={() => setConfirm(c => !c)}>Löschen</Act>}
          </div>

          {confirm && (
            <div style={{ background: theme.danger + '14', border: `1px solid ${theme.danger}44`, borderRadius: 8, padding: 11 }}>
              <div style={{ fontSize: 12, color: theme.text, marginBottom: 9, lineHeight: 1.45 }}>
                <strong>{u.name}</strong> endgültig löschen?
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <button onClick={() => { setConfirm(false); onRemove(u.id); }} style={{
                  appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: theme.danger, color: theme.bg, borderRadius: 7, padding: '8px 14px',
                  fontSize: 12.5, fontWeight: 700,
                }}>Ja, löschen</button>
                <button onClick={() => setConfirm(false)} style={{
                  appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMute,
                  borderRadius: 7, padding: '8px 14px', fontSize: 12.5,
                }}>Behalten</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Einladungsformular ────────────────────────────────────
function InviteForm({ theme, onCancel, onCreated, onError }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('viewer');
  const [busy, setBusy]   = useState(false);

  const submit = async () => {
    if (busy) return;
    if (!name.trim() || !email.trim()) { onError('Bitte Name und E-Mail angeben.'); return; }
    setBusy(true);
    try { onCreated(await api.createUser({ name: name.trim(), email: email.trim(), role })); }
    catch (e) { onError(e?.message || 'Der Zugang konnte nicht angelegt werden.'); setBusy(false); }
  };

  const input = {
    width: '100%', appearance: 'none', outline: 'none', padding: '10px 12px', borderRadius: 8,
    background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text,
    fontSize: 13.5, fontFamily: 'inherit', marginBottom: 9,
  };

  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.accent}55`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.accent, marginBottom: 11 }}>
        Neuer Zugang
      </div>
      <input style={input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <input style={input} type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['viewer', 'admin'].map(r => (
          <button key={r} onClick={() => setRole(r)} style={{
            flex: 1, appearance: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            padding: '10px 11px', borderRadius: 8,
            background: role === r ? theme.accentSoft : 'transparent',
            border: `1px solid ${role === r ? theme.accent : theme.border}`,
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: role === r ? theme.accent : theme.text }}>{ROLE[r].label}</div>
            <div style={{ fontSize: 10.5, color: theme.textDim, marginTop: 2, lineHeight: 1.35 }}>{ROLE[r].desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={submit} disabled={busy} style={{ ...btnMain(theme, busy), flex: 1 }}>
          {busy ? 'Wird angelegt…' : 'Anlegen'}
        </button>
        <button onClick={onCancel} style={{
          appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMute,
          borderRadius: 8, padding: '10px 16px', fontSize: 13,
        }}>Abbrechen</button>
      </div>
      <div style={{ fontSize: 10.5, color: theme.textDim, marginTop: 9, lineHeight: 1.45 }}>
        Es wird keine E-Mail verschickt — du bekommst einen Link zum Weitergeben.
      </div>
    </div>
  );
}

// ── Kleinteile ────────────────────────────────────────────
const btnMain = (theme, busy) => ({
  appearance: 'none', border: 'none', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
  background: theme.accent, color: theme.bg, borderRadius: 8, padding: '11px 16px',
  fontSize: 13, fontWeight: 700, width: '100%', opacity: busy ? 0.6 : 1,
});

function Act({ theme, onClick, danger, children }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: 'transparent', border: `1px solid ${danger ? theme.danger + '66' : theme.border}`,
      color: danger ? theme.danger : theme.textMute,
      borderRadius: 7, padding: '7px 11px', fontSize: 11.5, fontWeight: 500,
    }}>{children}</button>
  );
}

function Badge({ theme, color, children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 7px', borderRadius: 999,
      background: color + '1c', border: `1px solid ${color}44`, color,
      fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Note({ theme, tone, onClose, children }) {
  const c = tone === 'success' ? theme.success : theme.danger;
  return (
    <div style={{
      margin: '4px 14px 0', padding: '11px 13px', borderRadius: 9,
      background: c + '15', border: `1px solid ${c}44`,
      display: 'flex', alignItems: 'flex-start', gap: 9,
    }}>
      <span style={{ flex: 1, fontSize: 12.5, color: theme.text, lineHeight: 1.45 }}>{children}</span>
      <button onClick={onClose} style={{
        appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
        fontSize: 16, color: theme.textMute, lineHeight: 1, padding: 0, flexShrink: 0,
      }}>×</button>
    </div>
  );
}
