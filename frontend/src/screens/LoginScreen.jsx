// Login-Screen — CaveLog Calm
import { useState } from 'react';
import CLIcon from '../icons.jsx';

export default function LoginScreen({ theme, onLogin }) {
  const [email,   setEmail]   = useState('');
  const [pw,      setPw]      = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !pw) { setError('E-Mail und Passwort eingeben.'); return; }
    setError(''); setLoading(true);
    try { await onLogin(email, pw); }
    catch (err) { setError(err.message || 'Anmeldung fehlgeschlagen.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header-Block */}
      <div style={{ padding: '48px 28px 32px', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
          background: theme.accentSoft, border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CLIcon name="caves" size={32} color={theme.accent} strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: theme.text, letterSpacing: -0.5, lineHeight: 1.1 }}>
          Cave<span style={{ color: theme.accent }}>Log</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: theme.textMute }}>
          Höhlen-Logbuch
        </div>
      </div>

      {/* Formular */}
      <div style={{ flex: 1, padding: '0 28px 40px' }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* E-Mail */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: theme.textMute, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              E-Mail
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <CLIcon name="profile" size={16} color={theme.textDim} />
              </div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" autoCapitalize="none" placeholder="deine@email.de"
                style={{
                  width: '100%', appearance: 'none',
                  padding: '12px 12px 12px 40px',
                  background: theme.bgCard,
                  border: `1px solid ${error ? theme.danger : theme.border}`,
                  borderRadius: 8, outline: 'none',
                  color: theme.text, fontSize: 14, fontFamily: 'inherit',
                }} />
            </div>
          </div>

          {/* Passwort */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: theme.textMute, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Passwort
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <CLIcon name="lock" size={16} color={theme.textDim} />
              </div>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)}
                autoComplete="current-password" placeholder="••••••••"
                style={{
                  width: '100%', appearance: 'none',
                  padding: '12px 12px 12px 40px',
                  background: theme.bgCard,
                  border: `1px solid ${error ? theme.danger : theme.border}`,
                  borderRadius: 8, outline: 'none',
                  color: theme.text, fontSize: 14, fontFamily: 'inherit',
                }} />
            </div>
          </div>

          {/* Fehler */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
              background: theme.danger + '14', border: `1px solid ${theme.danger}30`, borderRadius: 8,
            }}>
              <CLIcon name="warning" size={14} color={theme.danger} />
              <span style={{ fontSize: 12, color: theme.danger }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            marginTop: 8, width: '100%', appearance: 'none', border: 'none',
            padding: '14px', borderRadius: 8,
            background: loading ? theme.accentDim : theme.accent,
            color: theme.bg, fontWeight: 600, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit',
          }}>
            {loading ? 'Anmelden…' : 'Einsteigen'}
          </button>
        </form>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 12, color: theme.textDim, lineHeight: 1.6 }}>
          Kein Konto? Zugang nur per Einladung.
        </div>
      </div>
    </div>
  );
}
