// Einladung einlösen (Mobile) — wird statt des Logins gezeigt, wenn die Adresse
// einen ?invite=…-Token trägt. Die eingeladene Person setzt ihr eigenes Passwort.
import { useState, useEffect } from 'react';
import CLIcon from '../icons.jsx';
import { api } from '../api.js';

export default function InviteScreen({ theme, token, onDone, onGiveUp }) {
  const [state, setState] = useState('checking');   // checking | form | invalid
  const [info, setInfo]   = useState(null);
  const [pw, setPw]       = useState('');
  const [pw2, setPw2]     = useState('');
  const [show, setShow]   = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  useEffect(() => {
    let alive = true;
    api.checkInvite(token)
      .then(d => { if (alive) { setInfo(d); setState('form'); } })
      .catch(e => { if (alive) { setError(e?.message || 'Dieser Link ist nicht gültig.'); setState('invalid'); } });
    return () => { alive = false; };
  }, [token]);

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    if (pw.length < 10) { setError('Bitte mindestens 10 Zeichen wählen.'); return; }
    if (pw !== pw2)     { setError('Die beiden Passwörter stimmen nicht überein.'); return; }
    setBusy(true);
    try {
      const res = await api.redeemInvite(token, pw);
      onDone(res.user);
    } catch (err) {
      setError(err?.message || 'Das hat leider nicht geklappt.');
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%', appearance: 'none', padding: '12px 14px',
    background: theme.bgCard, border: `1px solid ${theme.border}`,
    borderRadius: 8, outline: 'none', color: theme.text, fontSize: 14, fontFamily: 'inherit',
  };
  const labelStyle = {
    fontSize: 10, fontWeight: 600, letterSpacing: 1, color: theme.textMute,
    textTransform: 'uppercase', display: 'block', marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Kopf */}
      <div style={{ padding: '44px 28px 26px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 18px',
          background: theme.accentSoft, border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CLIcon name="caves" size={32} color={theme.accent} strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: theme.text, letterSpacing: -0.5, lineHeight: 1.1 }}>
          Cave<span style={{ color: theme.accent }}>Log</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: theme.textMute }}>Höhlen-Logbuch</div>
      </div>

      <div style={{ flex: 1, padding: '0 28px 40px' }}>
        {state === 'checking' && (
          <div style={{ textAlign: 'center', fontSize: 13, color: theme.textMute, paddingTop: 20 }}>
            Einladung wird geprüft…
          </div>
        )}

        {state === 'invalid' && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, margin: '0 auto 16px',
              background: theme.danger + '1e', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: theme.danger, fontWeight: 700,
            }}>!</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: theme.text, marginBottom: 10 }}>Link nicht gültig</div>
            <p style={{ fontSize: 13, color: theme.textMute, lineHeight: 1.6, margin: '0 0 24px' }}>{error}</p>
            <button onClick={onGiveUp} style={{
              width: '100%', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '13px', borderRadius: 8, background: 'transparent',
              border: `1px solid ${theme.border}`, color: theme.textMute, fontSize: 14, fontWeight: 600,
            }}>Zur Anmeldung</button>
          </div>
        )}

        {state === 'form' && info && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: theme.text, marginBottom: 6 }}>
                Hallo {info.name.split(/\s+/)[0]}
              </div>
              <p style={{ fontSize: 13, color: theme.textMute, lineHeight: 1.55, margin: 0 }}>
                {info.first
                  ? <>Wähle ein Passwort für <strong style={{ color: theme.text }}>{info.email}</strong>. Danach bist du direkt drin.</>
                  : <>Vergib ein neues Passwort für <strong style={{ color: theme.text }}>{info.email}</strong>.</>}
              </p>
            </div>

            {info.role === 'viewer' && info.first && (
              <div style={{
                marginBottom: 18, padding: '11px 13px', borderRadius: 9,
                background: theme.bgSubtle, border: `1px solid ${theme.border}`,
                fontSize: 12, color: theme.textMute, lineHeight: 1.5,
              }}>
                Du bekommst einen <strong style={{ color: theme.text }}>Betrachter-Zugang</strong>: Du siehst alle
                Befahrungen und Fotos, änderst aber nichts.
              </div>
            )}

            {error && (
              <div style={{
                marginBottom: 14, padding: '10px 12px', borderRadius: 8,
                background: theme.danger + '1a', border: `1px solid ${theme.danger}55`,
                color: theme.danger, fontSize: 12.5,
              }}>{error}</div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label style={labelStyle}>Passwort</label>
                  <button type="button" onClick={() => setShow(s => !s)} style={{
                    appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 11, color: theme.textDim, padding: 0, marginBottom: 6,
                  }}>{show ? 'verbergen' : 'anzeigen'}</button>
                </div>
                <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                  autoComplete="new-password" placeholder="Mindestens 10 Zeichen" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Nochmal zur Sicherheit</label>
                <input type={show ? 'text' : 'password'} value={pw2} onChange={e => setPw2(e.target.value)}
                  autoComplete="new-password" placeholder="Passwort wiederholen" style={inputStyle} />
              </div>

              <button type="submit" disabled={busy} style={{
                marginTop: 6, width: '100%', appearance: 'none', border: 'none',
                cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
                padding: '14px', borderRadius: 8, background: theme.accent, color: theme.bg,
                fontSize: 14.5, fontWeight: 700, opacity: busy ? 0.6 : 1,
              }}>
                {busy ? 'Einen Moment…' : (info.first ? 'Zugang aktivieren' : 'Passwort speichern')}
              </button>
            </form>

            <div style={{ marginTop: 18, textAlign: 'center', fontSize: 11, color: theme.textDim, lineHeight: 1.5 }}>
              Das Passwort kennst nur du — auch der Betreiber sieht es nicht.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
