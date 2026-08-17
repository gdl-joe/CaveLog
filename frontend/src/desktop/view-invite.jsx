// view-invite.jsx — Einladung einlösen (Desktop). Wird statt des Logins gezeigt,
// wenn die Adresse einen ?invite=…-Token enthält. Die Person setzt hier ihr
// eigenes Passwort; danach ist sie angemeldet.
import { useState, useEffect } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDPhoto } from './photos.jsx';
import { api } from '../api.js';

const CLDInvite = ({ theme, token, onDone, onGiveUp }) => {
  const [state, setState] = useState('checking');   // checking | form | invalid
  const [info, setInfo]   = useState(null);
  const [pw, setPw]       = useState('');
  const [pw2, setPw2]     = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  useEffect(() => {
    let alive = true;
    api.checkInvite(token)
      .then(d => { if (alive) { setInfo(d); setState('form'); } })
      .catch(e => { if (alive) { setError(e?.message || 'Dieser Link ist nicht gültig.'); setState('invalid'); } });
    return () => { alive = false; };
  }, [token]);

  const submit = async () => {
    setError('');
    if (pw.length < 10)  { setError('Bitte mindestens 10 Zeichen wählen.'); return; }
    if (pw !== pw2)      { setError('Die beiden Passwörter stimmen nicht überein.'); return; }
    setBusy(true);
    try {
      const res = await api.redeemInvite(token, pw);
      onDone(res.user);
    } catch (e) {
      setError(e?.message || 'Das hat leider nicht geklappt.');
      setBusy(false);
    }
  };

  const strength = scorePassword(pw);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: theme.bg, color: theme.text }}>
      {/* Foto-Seite */}
      <div style={{ position: 'relative', flex: '1 1 56%', overflow: 'hidden' }}>
        <CLDPhoto photo={null} theme={theme} grade={false} eager w={2200} />
        <div style={{ position: 'absolute', inset: 0, background: theme.heroGrade }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${theme.bg}40, transparent 50%, ${theme.bg}66)` }} />

        <div style={{ position: 'absolute', top: 36, left: 44, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: theme.accent, opacity: 0.18, filter: 'blur(8px)' }} />
            <CLDIcon name="compass" size={30} color={theme.accent} strokeWidth={1.7} />
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: theme.text, lineHeight: 1 }}>CaveLog</div>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 2.5, color: theme.text, opacity: 0.7, marginTop: 3 }}>EXPEDITION&nbsp;ARCHIV</div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 44, right: 44, bottom: 46 }}>
          <h1 style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 'clamp(38px,4.1vw,58px)', fontWeight: 600,
            lineHeight: 1.04, letterSpacing: -1.1, color: theme.text, maxWidth: 560 }}>
            Willkommen im <span style={{ fontStyle: 'italic', color: theme.accent }}>Archiv</span>.
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: 15, color: theme.textMute, maxWidth: 440, lineHeight: 1.5 }}>
            Befahrungen, Fotos und Höhlendaten aus vielen Jahren — für dich zum Mitlesen geöffnet.
          </p>
        </div>
      </div>

      {/* Formular-Seite */}
      <div style={{ flex: '0 0 480px', maxWidth: 480, background: theme.panel, borderLeft: `1px solid ${theme.line}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>
        <div style={{ width: '100%', maxWidth: 368, margin: '0 auto' }}>

          {state === 'checking' && (
            <div style={{ textAlign: 'center', color: theme.textMute, fontSize: 13.5 }}>Einladung wird geprüft…</div>
          )}

          {state === 'invalid' && (
            <>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: theme.danger + '1e',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <CLDIcon name="warning" size={22} color={theme.danger} />
              </div>
              <h2 style={{ margin: '0 0 12px', fontFamily: 'Fraunces, serif', fontSize: 27, fontWeight: 600, color: theme.text }}>
                Link nicht gültig
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: 13.5, color: theme.textMute, lineHeight: 1.6 }}>{error}</p>
              <button onClick={onGiveUp} style={{
                width: '100%', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                padding: '14px', borderRadius: 12, background: 'transparent',
                border: `1px solid ${theme.line}`, color: theme.textMute, fontSize: 14, fontWeight: 600 }}>
                Zur Anmeldung
              </button>
            </>
          )}

          {state === 'form' && info && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: theme.accent, marginBottom: 10 }}>
                {info.first ? 'Zugang einrichten' : 'Neues Passwort'}
              </div>
              <h2 style={{ margin: '0 0 10px', fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 600, color: theme.text, letterSpacing: -0.5 }}>
                Hallo {info.name.split(/\s+/)[0]}
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: 13.5, color: theme.textMute, lineHeight: 1.6 }}>
                {info.first
                  ? <>Wähle ein Passwort für <strong style={{ color: theme.text }}>{info.email}</strong>. Danach bist du direkt drin.</>
                  : <>Vergib ein neues Passwort für <strong style={{ color: theme.text }}>{info.email}</strong>.</>}
              </p>

              {info.role === 'viewer' && info.first && (
                <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 11,
                  background: theme.coolSoft, border: `1px solid ${theme.cool}3a`, display: 'flex', gap: 10 }}>
                  <CLDIcon name="eye" size={16} color={theme.cool} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12.5, color: theme.textMute, lineHeight: 1.5 }}>
                    Du hast einen <strong style={{ color: theme.text }}>Betrachter-Zugang</strong>: Du siehst
                    alle Befahrungen und Fotos, änderst aber nichts.
                  </span>
                </div>
              )}

              {error && (
                <div style={{ marginBottom: 18, padding: '11px 14px', borderRadius: 11, background: theme.danger + '1a',
                  border: `1px solid ${theme.danger}55`, color: theme.danger, fontSize: 13, fontWeight: 500 }}>{error}</div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <PwField theme={theme} label="Passwort" value={pw} onChange={setPw} placeholder="Mindestens 10 Zeichen" onEnter={submit} autoFocus />
                <PwField theme={theme} label="Nochmal zur Sicherheit" value={pw2} onChange={setPw2} placeholder="Passwort wiederholen" onEnter={submit} />
              </div>

              {/* Stärke-Anzeige */}
              {pw.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {[0, 1, 2, 3].map(i => (
                      <span key={i} style={{ flex: 1, height: 3, borderRadius: 2,
                        background: i < strength.level ? strength.color : theme.line }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11.5, color: strength.level >= 2 ? theme.textMute : theme.textDim }}>{strength.text}</div>
                </div>
              )}

              <button onClick={submit} disabled={busy} style={{
                marginTop: 22, width: '100%', appearance: 'none', border: 'none', cursor: busy ? 'default' : 'pointer',
                fontFamily: 'inherit', padding: '15px', borderRadius: 12, background: theme.accent, color: theme.bg,
                fontSize: 14.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 9, letterSpacing: 0.2, opacity: busy ? 0.6 : 1, boxShadow: `0 8px 24px ${theme.accent}33` }}>
                {busy ? 'Einen Moment…' : (info.first ? 'Zugang aktivieren' : 'Passwort speichern')}
                <CLDIcon name="arrow-right" size={17} color={theme.bg} />
              </button>

              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11.5, color: theme.textDim, lineHeight: 1.5 }}>
                Das Passwort kennst nur du — auch der Betreiber sieht es nicht.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PwField = ({ theme, label, value, onChange, placeholder, onEnter, autoFocus }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.textMute }}>{label}</span>
        <button onClick={() => setShow(s => !s)} style={{
          appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 11, color: theme.textDim, padding: 0 }}>
          {show ? 'verbergen' : 'anzeigen'}
        </button>
      </div>
      <input type={show ? 'text' : 'password'} value={value} placeholder={placeholder} autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        style={{ width: '100%', appearance: 'none', padding: '13px 15px', background: theme.card,
          border: `1px solid ${theme.line}`, borderRadius: 11, color: theme.text, fontSize: 14.5,
          outline: 'none', fontFamily: 'inherit' }}
        onFocus={e => e.target.style.borderColor = theme.accent}
        onBlur={e => e.target.style.borderColor = theme.line} />
    </div>
  );
};

/** Grobe Einschätzung — nur als Hinweis, der Server verlangt lediglich 10 Zeichen. */
function scorePassword(pw) {
  let n = 0;
  if (pw.length >= 10) n++;
  if (pw.length >= 14) n++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) n++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) n++;
  const map = [
    { level: 0, text: 'Noch zu kurz — mindestens 10 Zeichen.', color: '#ff6a47' },
    { level: 1, text: 'Geht so. Länger wäre besser.',          color: '#ff6a47' },
    { level: 2, text: 'Solide.',                                color: '#d98a4f' },
    { level: 3, text: 'Gut.',                                   color: '#8fc96a' },
    { level: 4, text: 'Sehr gut.',                              color: '#8fc96a' },
  ];
  return map[Math.min(n, 4)];
}

export default CLDInvite;
