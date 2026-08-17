// view-admin.jsx — Verwaltung: Zugänge einrichten und System pflegen.
// Nur für Bearbeiter erreichbar; der Server prüft jede Aktion zusätzlich selbst.
import { useState, useEffect, useCallback } from 'react';
import { CLDIcon } from './icons.jsx';
import { api } from '../api.js';

// ── Rollen und Status in Klartext ─────────────────────────
const ROLE = {
  admin:  { label: 'Bearbeiter', desc: 'Darf Befahrungen anlegen, ändern und Fotos hochladen.' },
  viewer: { label: 'Betrachter', desc: 'Sieht alles, kann aber nichts ändern.' },
};
const STATUS = {
  active:  { label: 'Aktiv',            tone: 'success' },
  invited: { label: 'Einladung offen',  tone: 'accent'  },
  reset:   { label: 'Neuer Link offen', tone: 'cool'    },
  blocked: { label: 'Gesperrt',         tone: 'danger'  },
};

const initialsOf = (name = '?') => name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = (s) => {
  if (!s) return null;
  const d = new Date(String(s).replace(' ', 'T'));
  return isNaN(d) ? null : d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Zwischenablage — mit Rückfallweg für unverschlüsselte Verbindungen (lokal). */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* weiter zum Rückfallweg */ }
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
export default function CLDAdmin({ theme, meId, onBack }) {
  const [tab, setTab] = useState('people');   // people | system

  return (
    <div style={{ padding: '40px 56px 72px', maxWidth: 1080 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 30 }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: theme.accent, marginBottom: 9 }}>
            Verwaltung
          </div>
          <h1 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 600, color: theme.text, letterSpacing: -0.6 }}>
            Zugänge &amp; System
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, color: theme.textMute, maxWidth: 620, lineHeight: 1.55 }}>
            Höhlenfreunde bekommen einen Betrachter-Zugang: Sie sehen das komplette Archiv,
            können aber nichts anlegen, ändern oder löschen.
          </p>
        </div>
        {onBack && (
          <button onClick={onBack} style={{
            appearance: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            background: 'transparent', border: `1px solid ${theme.line}`, borderRadius: 10,
            padding: '9px 14px', color: theme.textMute, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <CLDIcon name="back" size={15} color={theme.textMute} /> Zurück
          </button>
        )}
      </div>

      {/* Reiter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 26, borderBottom: `1px solid ${theme.line}` }}>
        {[
          { k: 'people', i: 'people',   l: 'Zugänge' },
          { k: 'system', i: 'database', l: 'System'  },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: 'transparent', padding: '11px 16px', marginBottom: -1,
            borderBottom: `2px solid ${tab === t.k ? theme.accent : 'transparent'}`,
            color: tab === t.k ? theme.accent : theme.textMute,
            fontSize: 13.5, fontWeight: tab === t.k ? 700 : 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CLDIcon name={t.i} size={16} color={tab === t.k ? theme.accent : theme.textMute} />
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'people' ? <PeoplePanel theme={theme} meId={meId} /> : <SystemPanel theme={theme} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Zugänge
// ══════════════════════════════════════════════════════════
function PeoplePanel({ theme, meId }) {
  const [users, setUsers]     = useState(null);
  const [error, setError]     = useState('');
  const [adding, setAdding]   = useState(false);
  const [freshId, setFreshId] = useState(null);   // gerade angelegt → Link hervorheben

  const load = useCallback(async () => {
    setError('');
    try { setUsers(await api.getUsers()); }
    catch (e) { setError(e?.message || 'Die Liste konnte nicht geladen werden.'); setUsers([]); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = async (id, data) => {
    setError('');
    try { const u = await api.updateUser(id, data); setUsers(list => list.map(x => x.id === id ? u : x)); return u; }
    catch (e) { setError(e?.message || 'Die Änderung wurde nicht übernommen.'); return null; }
  };

  const remove = async (id) => {
    setError('');
    try { await api.deleteUser(id); setUsers(list => list.filter(x => x.id !== id)); }
    catch (e) { setError(e?.message || 'Der Zugang konnte nicht gelöscht werden.'); }
  };

  if (users === null) return <Muted theme={theme}>Zugänge werden geladen…</Muted>;

  const admins  = users.filter(u => u.role === 'admin').length;
  const viewers = users.length - admins;

  return (
    <div>
      {error && <Banner theme={theme} tone="danger" onClose={() => setError('')}>{error}</Banner>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: theme.textMute }}>
          <strong style={{ color: theme.text, fontWeight: 600 }}>{users.length}</strong>
          {users.length === 1 ? ' Zugang' : ' Zugänge'} · {admins} {admins === 1 ? 'Bearbeiter' : 'Bearbeiter'} · {viewers} Betrachter
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} style={btnPrimary(theme)}>
            <CLDIcon name="plus" size={17} color={theme.bg} strokeWidth={2.3} />
            Höhlenfreund einladen
          </button>
        )}
      </div>

      {adding && (
        <InviteForm theme={theme}
          onCancel={() => setAdding(false)}
          onCreated={(u) => { setUsers(list => [...list, u]); setFreshId(u.id); setAdding(false); }}
          onError={setError} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {users.map(u => (
          <UserCard key={u.id} user={u} theme={theme} isMe={u.id === meId} highlight={u.id === freshId}
            onPatch={patch} onRemove={remove} />
        ))}
      </div>
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
    if (!name.trim())  { onError('Bitte einen Namen angeben.'); return; }
    if (!email.trim()) { onError('Bitte eine E-Mail-Adresse angeben.'); return; }
    setBusy(true);
    try {
      onCreated(await api.createUser({ name: name.trim(), email: email.trim(), role }));
    } catch (e) {
      onError(e?.message || 'Der Zugang konnte nicht angelegt werden.');
      setBusy(false);
    }
  };

  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.accent}44`, borderRadius: 16, padding: '22px 24px', marginBottom: 20 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: theme.accent, marginBottom: 16 }}>
        Neuer Zugang
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Field theme={theme} label="Name" value={name} onChange={setName} placeholder="z. B. Fabian Weber" onEnter={submit} autoFocus />
        <Field theme={theme} label="E-Mail" type="email" value={email} onChange={setEmail} placeholder="fabian@example.de" onEnter={submit} />
      </div>

      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.textMute, marginBottom: 9 }}>
        Rechte
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {['viewer', 'admin'].map(r => (
          <button key={r} onClick={() => setRole(r)} style={{
            appearance: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            padding: '13px 15px', borderRadius: 12,
            background: role === r ? theme.accentSoft : 'transparent',
            border: `1px solid ${role === r ? theme.accent : theme.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <CLDIcon name={r === 'admin' ? 'edit' : 'eye'} size={15} color={role === r ? theme.accent : theme.textMute} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: role === r ? theme.accent : theme.text }}>{ROLE[r].label}</span>
            </div>
            <div style={{ fontSize: 11.5, color: theme.textDim, lineHeight: 1.4 }}>{ROLE[r].desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={submit} disabled={busy} style={{ ...btnPrimary(theme), opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Wird angelegt…' : 'Anlegen und Link erzeugen'}
        </button>
        <button onClick={onCancel} style={btnGhost(theme)}>Abbrechen</button>
        <span style={{ fontSize: 11.5, color: theme.textDim, marginLeft: 'auto' }}>
          Es wird keine E-Mail verschickt — du bekommst einen Link zum Weitergeben.
        </span>
      </div>
    </div>
  );
}

// ── Eine Zugangs-Karte ────────────────────────────────────
function UserCard({ user, theme, isMe, highlight, onPatch, onRemove }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const st   = STATUS[user.status] || STATUS.active;
  const tone = { success: theme.success, accent: theme.accent, cool: theme.cool, danger: theme.danger }[st.tone];

  const act = async (fn) => { setBusy(true); await fn(); setBusy(false); };

  return (
    <div style={{
      background: theme.card,
      border: `1px solid ${highlight ? theme.accent + '66' : theme.line}`,
      borderRadius: 16, padding: '18px 20px',
      transition: 'border-color 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: user.role === 'admin'
            ? `linear-gradient(135deg, ${theme.accent}, ${theme.rope})`
            : `linear-gradient(135deg, ${theme.cool}, ${theme.accent}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: theme.bg, fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600,
          opacity: user.is_active ? 1 : 0.4,
        }}>{initialsOf(user.name)}</div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15.5, fontWeight: 600, color: theme.text }}>{user.name}</span>
            {isMe && <Tag theme={theme} color={theme.textMute}>Du</Tag>}
            <Tag theme={theme} color={user.role === 'admin' ? theme.accent : theme.cool}>{ROLE[user.role]?.label || user.role}</Tag>
            <Tag theme={theme} color={tone}>{st.label}</Tag>
          </div>
          <div style={{ fontSize: 12.5, color: theme.textMute, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>{user.email}</span>
            {user.last_login
              ? <span style={{ color: theme.textDim }}>zuletzt hier: {fmtDate(user.last_login)}</span>
              : <span style={{ color: theme.textDim }}>war noch nie angemeldet</span>}
          </div>
        </div>

        {/* Aktionen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          {!isMe && (
            <>
              <IconBtn theme={theme} icon={user.role === 'admin' ? 'eye' : 'edit'} busy={busy}
                title={user.role === 'admin' ? 'Auf Betrachter zurückstufen' : 'Zum Bearbeiter machen'}
                onClick={() => act(() => onPatch(user.id, { role: user.role === 'admin' ? 'viewer' : 'admin' }))} />
              <IconBtn theme={theme} icon={user.is_active ? 'lock' : 'unlock'} busy={busy}
                title={user.is_active ? 'Zugang sperren' : 'Zugang wieder freigeben'}
                onClick={() => act(() => onPatch(user.id, { is_active: !user.is_active }))} />
            </>
          )}
          <IconBtn theme={theme} icon="refresh" busy={busy}
            title={user.invite_url ? 'Neuen Link erzeugen' : 'Passwort zurücksetzen (neuer Link)'}
            onClick={() => act(() => onPatch(user.id, { new_invite: true }))} />
          {!isMe && (
            <IconBtn theme={theme} icon="trash" danger busy={busy}
              title="Zugang löschen"
              onClick={() => setConfirmDelete(v => !v)} />
          )}
        </div>
      </div>

      {/* Offener Einladungslink */}
      {user.invite_url && <InviteLink theme={theme} user={user} onRevoke={() => onPatch(user.id, { revoke_invite: true })} />}

      {/* Löschen bestätigen */}
      {confirmDelete && (
        <div style={{
          marginTop: 14, padding: '13px 15px', borderRadius: 12,
          background: theme.danger + '14', border: `1px solid ${theme.danger}44`,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <CLDIcon name="warning" size={17} color={theme.danger} />
          <span style={{ fontSize: 13, color: theme.text, flex: 1, minWidth: 220 }}>
            <strong>{user.name}</strong> endgültig löschen? Der Zugang verschwindet vollständig.
          </span>
          <button onClick={() => { setConfirmDelete(false); act(() => onRemove(user.id)); }} style={{
            ...btnGhost(theme), borderColor: theme.danger + '77', color: theme.danger, fontWeight: 600,
          }}>Ja, löschen</button>
          <button onClick={() => setConfirmDelete(false)} style={btnGhost(theme)}>Behalten</button>
        </div>
      )}
    </div>
  );
}

// ── Link-Box mit Kopieren ─────────────────────────────────
function InviteLink({ theme, user, onRevoke }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (await copyText(user.invite_url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const first = !user.last_login;
  return (
    <div style={{
      marginTop: 14, padding: '14px 16px', borderRadius: 12,
      background: theme.accentSoft, border: `1px dashed ${theme.accent}55`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <CLDIcon name="link" size={15} color={theme.accent} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: theme.accent }}>
          {first ? 'Einladungslink' : 'Link zum Passwort-Neusetzen'}
        </span>
        {user.invite_expires && (
          <span style={{ fontSize: 11.5, color: theme.textMute, marginLeft: 'auto' }}>
            gültig bis {fmtDate(user.invite_expires)}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <input readOnly value={user.invite_url} onFocus={e => e.target.select()} style={{
          flex: 1, minWidth: 0, appearance: 'none', padding: '10px 12px', borderRadius: 9,
          background: theme.bg, border: `1px solid ${theme.line}`, color: theme.textMute,
          fontSize: 12, fontFamily: 'JetBrains Mono, monospace', outline: 'none',
        }} />
        <button onClick={copy} style={{
          ...btnPrimary(theme), padding: '10px 15px', flexShrink: 0,
          background: copied ? theme.success : theme.accent,
        }}>
          <CLDIcon name={copied ? 'check' : 'copy'} size={15} color={theme.bg} strokeWidth={2.2} />
          {copied ? 'Kopiert' : 'Kopieren'}
        </button>
        <button onClick={onRevoke} style={{ ...btnGhost(theme), flexShrink: 0 }} title="Link ungültig machen">
          Zurückziehen
        </button>
      </div>

      <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 10, lineHeight: 1.5 }}>
        Schick den Link an <strong style={{ color: theme.textMute }}>{user.email}</strong> — per Mail, WhatsApp oder Signal.
        {first
          ? ' Beim ersten Öffnen setzt sich die Person selbst ein Passwort.'
          : ' Das bisherige Passwort bleibt gültig, bis der Link benutzt wird.'}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// System
// ══════════════════════════════════════════════════════════
function SystemPanel({ theme }) {
  const [sys, setSys]     = useState(null);
  const [busy, setBusy]   = useState('');
  const [note, setNote]   = useState(null);   // { tone, text }
  const [error, setError] = useState('');
  const [photoRun, setPhotoRun] = useState(null);  // { done, total } während des Laufs

  const load = useCallback(async () => {
    setError('');
    try { setSys(await api.getSystem()); }
    catch (e) { setError(e?.message || 'Der Systemzustand konnte nicht geladen werden.'); setSys(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const migrate = async () => {
    setBusy('migrate'); setNote(null); setError('');
    try {
      const r = await api.migrateDb();
      if (r.failed?.length) {
        setError('Nicht alles hat geklappt: ' + r.failed.map(f => `${f.column} (${f.error})`).join(' · '));
      } else {
        setNote({ tone: 'success', text: r.applied.length
          ? `Ergänzt: ${r.applied.join(', ')}. Höhlen-Titelbilder funktionieren jetzt.`
          : 'Die Datenbank war bereits aktuell.' });
      }
      await load();
    } catch (e) { setError(e?.message || 'Die Aktualisierung ist fehlgeschlagen.'); }
    finally { setBusy(''); }
  };

  // Fotos nachbearbeiten. Der Server liefert pro Aufruf ein kleines Paket und
  // meldet, wie viel noch aussteht — wir rufen so lange, bis nichts übrig ist.
  const processPhotos = async () => {
    setBusy('photos'); setNote(null); setError('');
    const total = sys?.photos?.pending ?? 0;
    let done = 0, after = 0, guard = 0;
    const skipped = [];
    try {
      for (;;) {
        const r = await api.processPhotos(5, after);
        done += r.processed || 0;
        if (r.skipped?.length) skipped.push(...r.skipped);
        setPhotoRun({ done: done + skipped.length, total: total || (done + skipped.length + (r.remaining || 0)) });
        if (!r.remaining) break;
        // Kommt die Position nicht voran, ist etwas grundsätzlich falsch → abbrechen
        if (r.lastId > after) { after = r.lastId; guard = 0; } else if (++guard > 2) break;
      }
      setNote({
        tone: 'success',
        text: `${done} ${done === 1 ? 'Foto' : 'Fotos'} nachbearbeitet — die Vollbildansicht ist jetzt scharf.`
            + (skipped.length ? ` ${skipped.length} übersprungen (Datei fehlt oder unlesbar).` : ''),
      });
      await load();
    } catch (e) {
      setError((e?.message || 'Die Nachbearbeitung ist fehlgeschlagen.')
             + (done ? ` ${done} Fotos waren bereits fertig — ein erneuter Start macht dort weiter.` : ''));
    } finally {
      setBusy(''); setPhotoRun(null);
    }
  };

  const cleanup = async (paths) => {
    setBusy('cleanup'); setNote(null); setError('');
    try {
      const r = await api.cleanupFiles(paths);
      if (r.failed?.length) setError(r.failed.map(f => `${f.path}: ${f.error}`).join(' · '));
      else setNote({ tone: 'success', text: `Vom Server gelöscht: ${r.deleted.join(', ') || '(nichts)'}` });
      await load();
    } catch (e) { setError(e?.message || 'Das Löschen ist fehlgeschlagen.'); }
    finally { setBusy(''); }
  };

  if (sys === null)  return <Muted theme={theme}>Systemzustand wird geprüft…</Muted>;
  if (sys === false) return <Banner theme={theme} tone="danger">{error}</Banner>;

  const risky = (sys.leftovers || []).filter(l => l.risk === 'high');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <Banner theme={theme} tone="danger" onClose={() => setError('')}>{error}</Banner>}
      {note  && <Banner theme={theme} tone={note.tone} onClose={() => setNote(null)}>{note.text}</Banner>}

      {/* Grunddaten */}
      <Card theme={theme} title="Server" icon="layers">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 4 }}>
          <KeyVal theme={theme} k="PHP-Version" v={sys.php} />
          <KeyVal theme={theme} k="Datenbank" v={sys.driver === 'mysql' ? 'MySQL' : 'SQLite'} />
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {(sys.checks || []).map(c => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                width: 19, height: 19, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: c.ok ? theme.success + '22' : theme.danger + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CLDIcon name={c.ok ? 'check' : 'close'} size={12} color={c.ok ? theme.success : theme.danger} strokeWidth={2.6} />
              </span>
              <div>
                <div style={{ fontSize: 13, color: theme.text }}>{c.label}</div>
                {!c.ok && <div style={{ fontSize: 11.5, color: theme.danger, marginTop: 2 }}>{c.hint}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Datenbank */}
      <Card theme={theme} title="Datenbank" icon="database"
        badge={sys.migrations?.length ? { text: `${sys.migrations.length} offen`, tone: theme.accent } : { text: 'Aktuell', tone: theme.success }}>
        {sys.migrations?.length ? (
          <>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: theme.textMute, lineHeight: 1.55 }}>
              Der Datenbank fehlen Felder, die neuere Funktionen brauchen. Das Ergänzen dauert einen Augenblick
              und lässt vorhandene Daten unangetastet.
            </p>
            <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {sys.migrations.map(m => (
                <li key={`${m.table}.${m.column}`} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: theme.textMute }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.accent, flexShrink: 0 }} />
                  <span style={{ color: theme.text }}>{m.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: theme.textDim }}>{m.table}.{m.column}</span>
                </li>
              ))}
            </ul>
            <button onClick={migrate} disabled={!!busy} style={{ ...btnPrimary(theme), opacity: busy ? 0.6 : 1 }}>
              <CLDIcon name="database" size={16} color={theme.bg} />
              {busy === 'migrate' ? 'Wird ergänzt…' : 'Datenbank aktualisieren'}
            </button>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: theme.textMute }}>
            Alle Felder sind vorhanden — nichts zu tun.
          </p>
        )}
      </Card>

      {/* Fotos */}
      {sys.photos && (
        <Card theme={theme} title="Fotos" icon="camera"
          badge={sys.photos.pending
            ? { text: `${sys.photos.pending} offen`, tone: theme.accent }
            : { text: 'Fertig', tone: theme.success }}>
          {sys.photos.pending ? (
            <>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: theme.textMute, lineHeight: 1.55 }}>
                Für <strong style={{ color: theme.text }}>{sys.photos.pending}</strong> von {sys.photos.total} Fotos
                fehlt die hochauflösende Fassung für die Vollbildansicht. Ohne sie wirken die Bilder
                im Großformat weich. Die Originale bleiben unangetastet.
              </p>
              {busy === 'photos' && photoRun && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ height: 4, borderRadius: 2, background: theme.line, overflow: 'hidden', marginBottom: 7 }}>
                    <div style={{ height: '100%', borderRadius: 2, background: theme.accent,
                      width: `${photoRun.total ? Math.round(photoRun.done / photoRun.total * 100) : 0}%`,
                      transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMute }}>
                    {photoRun.done} von {photoRun.total} — bitte das Fenster offen lassen.
                  </div>
                </div>
              )}
              <button onClick={processPhotos} disabled={!!busy} style={{ ...btnPrimary(theme), opacity: busy ? 0.6 : 1 }}>
                <CLDIcon name="camera" size={16} color={theme.bg} />
                {busy === 'photos' ? 'Läuft…' : 'Fotos nachbearbeiten'}
              </button>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: theme.textMute }}>
              Alle {sys.photos.total} Fotos liegen in voller Auflösung vor.
            </p>
          )}
        </Card>
      )}

      {/* Altlasten */}
      <Card theme={theme} title="Aufräumen" icon="shield"
        badge={risky.length ? { text: `${risky.length} kritisch`, tone: theme.danger } : null}>
        {sys.leftovers?.length ? (
          <>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: theme.textMute, lineHeight: 1.55 }}>
              Diese Dateien stammen aus der Einrichtung oder der Fehlersuche und liegen noch auf dem Server.
              Sie werden nicht mehr gebraucht.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {sys.leftovers.map(l => (
                <div key={l.path} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 13px', borderRadius: 11,
                  background: l.risk === 'high' ? theme.danger + '10' : theme.cardHi,
                  border: `1px solid ${l.risk === 'high' ? theme.danger + '33' : theme.line}`,
                }}>
                  <CLDIcon name={l.risk === 'high' ? 'warning' : 'trash'} size={16}
                    color={l.risk === 'high' ? theme.danger : theme.textMute} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: theme.text }}>{l.label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: theme.textDim }}>{l.path}</span>
                      {l.risk === 'high' && <Tag theme={theme} color={theme.danger}>Sicherheitsrisiko</Tag>}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textMute, marginTop: 3, lineHeight: 1.45 }}>{l.why}</div>
                    {!l.writable && (
                      <div style={{ fontSize: 11.5, color: theme.danger, marginTop: 4 }}>
                        Keine Schreibrechte — diese Datei muss per FTP gelöscht werden.
                      </div>
                    )}
                  </div>
                  <button onClick={() => cleanup([l.path])} disabled={!!busy || !l.writable}
                    style={{ ...btnGhost(theme), flexShrink: 0, opacity: (busy || !l.writable) ? 0.45 : 1 }}>
                    Löschen
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => cleanup(sys.leftovers.filter(l => l.writable).map(l => l.path))} disabled={!!busy}
              style={{ ...btnPrimary(theme), opacity: busy ? 0.6 : 1 }}>
              <CLDIcon name="trash" size={16} color={theme.bg} />
              {busy === 'cleanup' ? 'Wird gelöscht…' : 'Alle entfernen'}
            </button>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: theme.textMute }}>
            Sauber — es liegen keine Setup- oder Diagnose-Dateien mehr auf dem Server.
          </p>
        )}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Bausteine
// ══════════════════════════════════════════════════════════
const btnPrimary = (theme) => ({
  appearance: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  padding: '11px 17px', borderRadius: 11, background: theme.accent, color: theme.bg,
  fontSize: 13.5, fontWeight: 700, letterSpacing: 0.2,
  display: 'inline-flex', alignItems: 'center', gap: 8,
  boxShadow: `0 6px 18px ${theme.accent}2e`,
});

const btnGhost = (theme) => ({
  appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
  padding: '10px 14px', borderRadius: 10, background: 'transparent',
  border: `1px solid ${theme.line}`, color: theme.textMute, fontSize: 12.5, fontWeight: 500,
});

function IconBtn({ theme, icon, title, onClick, danger, busy }) {
  const [hover, setHover] = useState(false);
  const c = danger ? theme.danger : theme.textMute;
  return (
    <button onClick={onClick} title={title} disabled={busy}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none', cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: hover && !busy ? (danger ? theme.danger + '1e' : theme.cardHi) : 'transparent',
        border: `1px solid ${hover && !busy ? (danger ? theme.danger + '55' : theme.lineHi) : theme.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: busy ? 0.4 : 1, transition: 'background 0.12s, border-color 0.12s',
      }}>
      <CLDIcon name={icon} size={16} color={hover && !busy ? (danger ? theme.danger : theme.text) : c} />
    </button>
  );
}

function Field({ theme, label, type = 'text', value, onChange, placeholder, onEnter, autoFocus }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.textMute, marginBottom: 7 }}>
        {label}
      </div>
      <input type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        style={{
          width: '100%', appearance: 'none', padding: '11px 13px', borderRadius: 10,
          background: theme.bg, border: `1px solid ${theme.line}`, color: theme.text,
          fontSize: 14, outline: 'none', fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderColor = theme.accent}
        onBlur={e => e.target.style.borderColor = theme.line} />
    </div>
  );
}

function Card({ theme, title, icon, badge, children }) {
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.line}`, borderRadius: 16, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <CLDIcon name={icon} size={17} color={theme.accent} />
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: theme.textMute }}>{title}</span>
        {badge && <span style={{ marginLeft: 'auto' }}><Tag theme={theme} color={badge.tone}>{badge.text}</Tag></span>}
      </div>
      {children}
    </div>
  );
}

function KeyVal({ theme, k, v }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: theme.textDim, marginBottom: 4 }}>{k}</div>
      <div style={{ fontSize: 14, color: theme.text, fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
    </div>
  );
}

function Tag({ theme, color, children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2.5px 8px', borderRadius: 999,
      background: color + '1c', border: `1px solid ${color}44`, color,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Banner({ theme, tone = 'danger', onClose, children }) {
  const c = tone === 'success' ? theme.success : tone === 'accent' ? theme.accent : theme.danger;
  return (
    <div style={{
      marginBottom: 18, padding: '12px 15px', borderRadius: 12,
      background: c + '15', border: `1px solid ${c}44`,
      display: 'flex', alignItems: 'center', gap: 11,
    }}>
      <CLDIcon name={tone === 'success' ? 'check' : 'warning'} size={16} color={c} />
      <span style={{ flex: 1, fontSize: 13, color: theme.text, lineHeight: 1.5 }}>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{
          appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
          padding: 2, display: 'flex', flexShrink: 0,
        }}>
          <CLDIcon name="close" size={15} color={theme.textMute} />
        </button>
      )}
    </div>
  );
}

function Muted({ theme, children }) {
  return <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: theme.textMute }}>{children}</div>;
}
