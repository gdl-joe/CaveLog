// view-profile.jsx — Desktop-Profil: Avatar + KPIs + Farbwelt-Wähler + Aktionen
import { CLDIcon } from './icons.jsx';
import { CLDChip } from './atoms.jsx';
import { CLD_PALETTES } from './theme.js';

const CLDProfile = ({ theme, user, isAdmin=true, palette, onChangePalette, onLogout, cavesCount=0, onManageUsers }) => {
  return (
    <div style={{ padding:'40px 56px 72px', maxWidth:1000 }}>
      <div style={{ display:'flex', alignItems:'center', gap:22, marginBottom:36 }}>
        <div style={{ width:88, height:88, borderRadius:'50%',
          background:`linear-gradient(135deg, ${theme.accent}, ${theme.rope})`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:theme.bg, fontFamily:'Fraunces, serif', fontSize:34, fontWeight:600,
          boxShadow:`0 0 40px ${theme.accent}33` }}>{user.initials}</div>
        <div>
          <h1 style={{ margin:0, fontFamily:'Fraunces, serif', fontSize:34, fontWeight:600, color:theme.text }}>{user.name}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:8 }}>
            <span style={{ fontSize:13, color:theme.textMute }}>{isAdmin ? `${user.handle} · dabei seit ${user.since}` : 'Nur-Lese-Zugang'}</span>
            <CLDChip icon="profile" label={isAdmin?'Bearbeiter':'Betrachter'} theme={theme} tone={isAdmin?'accent':'cool'}/>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:36 }}>
        {[
          {l:'Befahrungen', v:user.trips}, {l:'Höhlen', v:user.caves},
          {l:'Tiefster Punkt', v:`−${user.maxDepth} m`}, {l:'Stunden', v:`${user.totalHours} h`},
        ].map((s,i)=>(
          <div key={i} style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:14, padding:'18px 20px' }}>
            <div style={{ fontFamily:'Fraunces, serif', fontSize:28, fontWeight:600, color:theme.text, lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:theme.textMute, marginTop:7 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, padding:'20px 22px' }}>
          <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:1.8, textTransform:'uppercase', color:theme.textMute, marginBottom:16 }}>Darstellung</div>
          <div style={{ fontSize:12, color:theme.textMute, marginBottom:8 }}>Farbwelt</div>
          <div style={{ display:'flex', gap:8, marginBottom:18 }}>
            {Object.values(CLD_PALETTES).map(p=>(
              <button key={p.key} onClick={()=>onChangePalette(p.key)} style={{
                appearance:'none', cursor:'pointer', flex:1, padding:'12px 10px', borderRadius:11, textAlign:'left',
                background: palette===p.key?p.accentSoft:'transparent',
                border:`1px solid ${palette===p.key?p.accent:theme.line}`, fontFamily:'inherit' }}>
                <div style={{ display:'flex', gap:4, marginBottom:8 }}>
                  <span style={{ width:14, height:14, borderRadius:4, background:p.accent }}/>
                  <span style={{ width:14, height:14, borderRadius:4, background:p.cool }}/>
                  <span style={{ width:14, height:14, borderRadius:4, background:p.card, border:`1px solid ${theme.lineHi}` }}/>
                </div>
                <div style={{ fontSize:13, fontWeight:600, color: palette===p.key?p.accent:theme.text }}>{p.name}</div>
                <div style={{ fontSize:10.5, color:theme.textDim, marginTop:2 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ background:theme.card, border:`1px solid ${theme.line}`, borderRadius:16, padding:'8px 8px' }}>
          {(isAdmin ? [
            {i:'people', l:'Zugänge verwalten', r:'Einladen · Rechte', act:onManageUsers},
            {i:'expand', l:'Export · GPX · PDF · CSV', r:'', act:null},
            {i:'caves', l:'Höhlen-Kataster pflegen', r:`${cavesCount} aktiv`, act:null},
            {i:'logout', l:'Abmelden', r:'', act:onLogout},
          ] : [
            {i:'profile', l:'Mein Zugang', r:'Nur-Lese', act:null},
            {i:'expand', l:'Export · PDF', r:'', act:null},
            {i:'logout', l:'Abmelden', r:'', act:onLogout},
          ]).map((row,i,arr)=>(
            <div key={i} onClick={row.act||undefined} style={{ display:'flex', alignItems:'center', gap:13, padding:'15px 14px',
              borderBottom: i<arr.length-1?`1px solid ${theme.line}`:'none', cursor: row.act?'pointer':'default' }}>
              <div style={{ width:34, height:34, borderRadius:9, background:theme.accentSoft, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <CLDIcon name={row.i} size={17} color={theme.accent}/>
              </div>
              <span style={{ flex:1, fontSize:14, color:theme.text, fontWeight:500 }}>{row.l}</span>
              {row.r && <span style={{ fontSize:12, color:theme.textMute }}>{row.r}</span>}
              <CLDIcon name="chevron-right" size={16} color={theme.textDim}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CLDProfile;
