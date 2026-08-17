// ui.js — geteilte Button-Styles (Primär/Ghost) für die Desktop-Views
export function btnPrimary(theme){ return {
  appearance:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
  padding:'14px 22px', borderRadius:12, background:theme.accent, color:theme.bg,
  fontSize:14, fontWeight:700, letterSpacing:0.2, display:'inline-flex', alignItems:'center', gap:9,
  boxShadow:`0 8px 26px ${theme.accent}40` }; }
export function btnGhost(theme){ return {
  appearance:'none', cursor:'pointer', fontFamily:'inherit',
  padding:'14px 22px', borderRadius:12, background:`${theme.text}0d`, color:theme.text,
  border:`1px solid ${theme.lineHi}`, backdropFilter:'blur(8px)',
  fontSize:14, fontWeight:600, display:'inline-flex', alignItems:'center', gap:9 }; }
