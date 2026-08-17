// sidebar.jsx — Persistente Desktop-Navigation (ersetzt Mobile Bottom-Tabs)
import { CLDIcon } from './icons.jsx';

const CLDSidebar = ({ theme, view, onNav, onNew, user, isAdmin=true }) => {
  const items = [
    { k:'feed',   i:'feed',   l:'Logbuch' },
    { k:'caves',  i:'caves',  l:'Höhlen' },
    { k:'map',    i:'map',    l:'Karte' },
    { k:'stats',  i:'stats',  l:'Statistik' },
  ];
  const initials = (user?.name || '?').split(/\s+/).map(p=>p[0]).join('').slice(0,2).toUpperCase();
  return (
    <aside style={{
      width:248, flexShrink:0, height:'100%',
      background:theme.panel, borderRight:`1px solid ${theme.line}`,
      display:'flex', flexDirection:'column', padding:'22px 16px',
    }}>
      {/* Wortmarke */}
      <div style={{ display:'flex', alignItems:'center', gap:11, padding:'4px 8px 26px' }}>
        <div style={{ position:'relative', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:theme.accent, opacity:0.16, filter:'blur(6px)' }}/>
          <CLDIcon name="compass" size={26} color={theme.accent} strokeWidth={1.7}/>
        </div>
        <div>
          <div style={{ fontFamily:'Fraunces, serif', fontSize:18, fontWeight:600, color:theme.text, letterSpacing:0.3, lineHeight:1 }}>CaveLog</div>
          <div style={{ fontSize:8.5, fontWeight:700, letterSpacing:2.5, color:theme.textDim, marginTop:3 }}>EXPEDITION&nbsp;ARCHIV</div>
        </div>
      </div>

      {/* Neue Befahrung (nur Bearbeiter) */}
      {isAdmin && (
      <button onClick={onNew} style={{
        appearance:'none', border:'none', cursor:'pointer', width:'100%',
        padding:'12px 14px', borderRadius:12, marginBottom:22,
        background:theme.accent, color:theme.bg,
        display:'flex', alignItems:'center', gap:9, fontFamily:'inherit',
        fontSize:13.5, fontWeight:700, letterSpacing:0.2,
        boxShadow:`0 6px 20px ${theme.accent}33`,
      }}>
        <CLDIcon name="plus" size={18} color={theme.bg} strokeWidth={2.4}/>
        Neue Befahrung
      </button>
      )}

      {/* Nav */}
      <nav style={{ display:'flex', flexDirection:'column', gap:3 }}>
        <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:2, color:theme.textDim, padding:'4px 10px 8px' }}>NAVIGATION</div>
        {(isAdmin ? [...items, { k:'admin', i:'people', l:'Verwaltung' }] : items).map(it=>{
          const active = view===it.k || (view==='detail'&&it.k==='feed') || (view==='cinema'&&it.k==='feed');
          return (
            <button key={it.k} onClick={()=>onNav(it.k)} style={{
              appearance:'none', border:'none', cursor:'pointer', width:'100%', textAlign:'left',
              padding:'11px 12px', borderRadius:10,
              background: active?theme.accentSoft:'transparent',
              color: active?theme.accent:theme.textMute,
              display:'flex', alignItems:'center', gap:12, fontFamily:'inherit',
              fontSize:14, fontWeight: active?600:500,
              position:'relative', transition:'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e=>{ if(!active) e.currentTarget.style.background=theme.cardHi; }}
            onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}>
              {active && <span style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:3, height:18, borderRadius:2, background:theme.accent }}/>}
              <CLDIcon name={it.i} size={19} color={active?theme.accent:theme.textMute} strokeWidth={active?1.9:1.6}/>
              {it.l}
            </button>
          );
        })}
      </nav>

      <div style={{ flex:1 }}/>

      {/* Nutzer */}
      <button onClick={()=>onNav('profile')} style={{
        appearance:'none', border:`1px solid ${theme.line}`, cursor:'pointer', width:'100%', textAlign:'left',
        padding:'10px 12px', borderRadius:12, background: view==='profile'?theme.cardHi:'transparent',
        display:'flex', alignItems:'center', gap:11, fontFamily:'inherit',
      }}>
        <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0,
          background:`linear-gradient(135deg, ${theme.accent}, ${theme.rope})`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:theme.bg, fontWeight:700, fontFamily:'Fraunces, serif', fontSize:14 }}>{initials}</div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:theme.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</div>
          <div style={{ fontSize:10.5, color:theme.textDim, letterSpacing:0.3 }}>{isAdmin ? `Bearbeiter · seit ${user.since}` : 'Betrachter · Nur-Lese'}</div>
        </div>
      </button>
    </aside>
  );
};

export default CLDSidebar;
