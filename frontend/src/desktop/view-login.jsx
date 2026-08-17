// view-login.jsx — Login (Foto-Splitscreen). Echte Auth: E-Mail/Passwort gegen
// die bestehende Session-API. Die Rolle bestimmt der Server (kein Demo-Wähler).
import { useState } from 'react';
import { CLDIcon } from './icons.jsx';
import { CLDPhoto } from './photos.jsx';

const CLDLogin = ({ theme, onLogin }) => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email.trim() || !pw) { setError('Bitte E-Mail und Passwort eingeben.'); return; }
    setBusy(true);
    try {
      await onLogin(email.trim(), pw);
    } catch (e) {
      setError(e?.message || 'Anmeldung fehlgeschlagen.');
      setBusy(false);
    }
  };

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', background:theme.bg, color:theme.text }}>
      {/* Linke Foto-Seite */}
      <div style={{ position:'relative', flex:'1 1 56%', overflow:'hidden' }}>
        <CLDPhoto photo={null} theme={theme} grade={false} eager w={2200}/>
        <div style={{ position:'absolute', inset:0, background:theme.heroGrade }}/>
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg, ${theme.bg}40, transparent 50%, ${theme.bg}66)` }}/>

        {/* Marke oben */}
        <div style={{ position:'absolute', top:36, left:44, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ position:'relative', width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:theme.accent, opacity:0.18, filter:'blur(8px)' }}/>
            <CLDIcon name="compass" size={30} color={theme.accent} strokeWidth={1.7}/>
          </div>
          <div>
            <div style={{ fontFamily:'Fraunces, serif', fontSize:20, fontWeight:600, color:theme.text, lineHeight:1 }}>CaveLog</div>
            <div style={{ fontSize:8.5, fontWeight:700, letterSpacing:2.5, color:theme.text, opacity:0.7, marginTop:3 }}>EXPEDITION&nbsp;ARCHIV</div>
          </div>
        </div>

        {/* Claim unten */}
        <div style={{ position:'absolute', left:44, right:44, bottom:46 }}>
          <h1 style={{ margin:0, fontFamily:'Fraunces, serif', fontSize:'clamp(40px,4.4vw,64px)', fontWeight:600,
            lineHeight:1.02, letterSpacing:-1.2, color:theme.text, maxWidth:560 }}>
            Jede Tiefe, <span style={{ fontStyle:'italic', color:theme.accent }}>festgehalten</span>.
          </h1>
          <p style={{ margin:'16px 0 0', fontSize:15, color:theme.textMute, maxWidth:440, lineHeight:1.5 }}>
            Das private Logbuch deiner Höhlenbefahrungen — Fotos, Daten, Touren und Gefahren an einem Ort.
          </p>
        </div>
      </div>

      {/* Rechte Formular-Seite */}
      <div style={{ flex:'0 0 480px', maxWidth:480, background:theme.panel, borderLeft:`1px solid ${theme.line}`,
        display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 56px' }}>
        <div style={{ width:'100%', maxWidth:368, margin:'0 auto' }}>
          <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:theme.accent, marginBottom:10 }}>Anmeldung</div>
          <h2 style={{ margin:'0 0 28px', fontFamily:'Fraunces, serif', fontSize:32, fontWeight:600, color:theme.text, letterSpacing:-0.5 }}>Willkommen zurück</h2>

          {error && (
            <div style={{ marginBottom:18, padding:'11px 14px', borderRadius:11, background:theme.danger+'1a',
              border:`1px solid ${theme.danger}55`, color:theme.danger, fontSize:13, fontWeight:500 }}>{error}</div>
          )}

          {/* Felder */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <LoginField theme={theme} label="E-Mail" type="email" value={email} onChange={setEmail} placeholder="marco@cavelog.de" onEnter={submit}/>
            <LoginField theme={theme} label="Passwort" type="password" value={pw} onChange={setPw} placeholder="••••••••" onEnter={submit}/>
          </div>

          <button onClick={submit} disabled={busy} style={{
            marginTop:24, width:'100%', appearance:'none', border:'none', cursor: busy?'default':'pointer', fontFamily:'inherit',
            padding:'15px', borderRadius:12, background:theme.accent, color:theme.bg, fontSize:14.5, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center', gap:9, letterSpacing:0.2, opacity: busy?0.6:1,
            boxShadow:`0 8px 24px ${theme.accent}33` }}>
            {busy ? 'Anmelden…' : 'Anmelden'}
            <CLDIcon name="arrow-right" size={17} color={theme.bg}/>
          </button>

          <div style={{ marginTop:22, textAlign:'center', fontSize:12, color:theme.textDim }}>
            Zugang nur auf Einladung · <span style={{ color:theme.textMute }}>all-inkl.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginField = ({ theme, label, type, value, onChange, placeholder, onEnter }) => (
  <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
      <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:theme.textMute }}>{label}</span>
    </div>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      onKeyDown={e=>{ if(e.key==='Enter' && onEnter) onEnter(); }}
      style={{ width:'100%', appearance:'none', padding:'13px 15px', background:theme.card,
        border:`1px solid ${theme.line}`, borderRadius:11, color:theme.text, fontSize:14.5, outline:'none', fontFamily:'inherit' }}
      onFocus={e=>e.target.style.borderColor=theme.accent}
      onBlur={e=>e.target.style.borderColor=theme.line}/>
  </div>
);

export default CLDLogin;
