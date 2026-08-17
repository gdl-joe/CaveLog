// icons.jsx — Desktop Icon-Set (custom SVG strokes)
const CLDIcon = ({ name, size = 24, color = 'currentColor', strokeWidth = 1.6, style }) => {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24', style,
    fill: 'none', stroke: color, strokeWidth,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'feed': return <svg {...p}><path d="M4 6h16M4 12h16M4 18h10"/></svg>;
    case 'grid': return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'map': return <svg {...p}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v18M15 6v18"/></svg>;
    case 'caves': return <svg {...p}><path d="M3 20V13c0-5 4-9 9-9s9 4 9 9v7"/><path d="M3 20h18"/><path d="M8 20v-3a4 4 0 018 0v3"/></svg>;
    case 'stats': return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>;
    case 'profile': return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'plus': return <svg {...p} strokeWidth={2}><path d="M12 5v14M5 12h14"/></svg>;
    case 'back': return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'arrow-left': return <svg {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'close': return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>;
    case 'filter': return <svg {...p}><path d="M3 6h18M6 12h12M10 18h4"/></svg>;
    case 'more': return <svg {...p}><circle cx="12" cy="5" r="1.3" fill={color}/><circle cx="12" cy="12" r="1.3" fill={color}/><circle cx="12" cy="19" r="1.3" fill={color}/></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>;
    case 'depth': return <svg {...p}><path d="M12 3v14"/><path d="M7 12l5 5 5-5"/><path d="M4 20h16"/></svg>;
    case 'length': return <svg {...p}><path d="M4 12h16"/><path d="M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3"/></svg>;
    case 'drop': return <svg {...p}><path d="M12 3s6 6 6 11a6 6 0 11-12 0c0-5 6-11 6-11z"/></svg>;
    case 'rope': return <svg {...p}><path d="M8 3c2 3-2 5 0 8s-2 5 0 8"/><path d="M16 3c-2 3 2 5 0 8s2 5 0 8"/></svg>;
    case 'star': return <svg {...p}><path d="M12 3l2.6 5.7L21 9.5l-4.8 4.3L17.5 21 12 17.8 6.5 21l1.3-7.2L3 9.5l6.4-.8L12 3z"/></svg>;
    case 'star-filled': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}><path d="M12 2l2.6 5.7L21 8.5l-4.8 4.3L17.5 20 12 16.8 6.5 20l1.3-7.2L3 8.5l6.4-.8L12 2z"/></svg>;
    case 'pin': return <svg {...p}><path d="M12 22s-7-7-7-12a7 7 0 1114 0c0 5-7 12-7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case 'camera': return <svg {...p}><path d="M4 7h3l2-2h6l2 2h3v12H4V7z"/><circle cx="12" cy="13" r="3.5"/></svg>;
    case 'people': return <svg {...p}><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><path d="M15 19c0-2 2-4 4-4s2 1 2 2"/></svg>;
    case 'warning': return <svg {...p}><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.8" fill={color}/></svg>;
    case 'weather': return <svg {...p}><path d="M6 15a4 4 0 010-8 6 6 0 0112 1 4 4 0 01-1 8H6z"/></svg>;
    case 'gear': return <svg {...p}><path d="M7 3h10l-2 5h-6L7 3z"/><path d="M9 8v12l3-2 3 2V8"/></svg>;
    case 'check': return <svg {...p} strokeWidth={2}><path d="M5 12l5 5L20 7"/></svg>;
    case 'edit': return <svg {...p}><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/></svg>;
    case 'chevron-right': return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-left': return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-down': return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>;
    case 'play': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}><path d="M7 4l13 8-13 8V4z"/></svg>;
    case 'pause': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>;
    case 'expand': return <svg {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>;
    case 'slideshow': return <svg {...p}><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M10 9l4 2.5L10 14V9z" fill={color} stroke="none"/><path d="M8 21h8"/></svg>;
    case 'aperture': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3l4 7M21 12h-8M16.5 19l-4-7M7.5 19l4-7M3 12h8M7.5 5l4 7"/></svg>;
    case 'mountain': return <svg {...p}><path d="M3 20l5-9 4 5 3-4 6 8H3z"/></svg>;
    case 'compass': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" fill={color} stroke="none" opacity="0.9"/></svg>;
    case 'logout': return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'flame': return <svg {...p}><path d="M12 3s-1 3-3 5-2 4-2 6a5 5 0 0010 0c0-3-3-5-3-7s1-3-2-4z"/></svg>;
    case 'route': return <svg {...p}><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6a4 4 0 000-8H10a4 4 0 010-8h6"/></svg>;
    case 'layers': return <svg {...p}><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>;
    case 'shield': return <svg {...p}><path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'copy': return <svg {...p}><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1"/></svg>;
    case 'link': return <svg {...p}><path d="M10 13a4 4 0 006 .5l3-3a4 4 0 00-6-6l-1.5 1.5"/><path d="M14 11a4 4 0 00-6-.5l-3 3a4 4 0 006 6L12.5 18"/></svg>;
    case 'trash': return <svg {...p}><path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>;
    case 'lock': return <svg {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>;
    case 'unlock': return <svg {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 017.5-2"/></svg>;
    case 'mail': return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'refresh': return <svg {...p}><path d="M20 12a8 8 0 01-13.7 5.7L4 15.5"/><path d="M4 12a8 8 0 0113.7-5.7L20 8.5"/><path d="M4 20v-4.5h4.5M20 4v4.5h-4.5"/></svg>;
    case 'eye': return <svg {...p}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'file-pdf': return <svg {...p}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path d="M14 3v5h5"/><path d="M9 13h1.2a1.3 1.3 0 010 2.6H9V13v5"/><path d="M13.5 18v-5h1a2.5 2.5 0 010 5h-1z"/></svg>;
    case 'plan': return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11M15 4v5"/></svg>;
    case 'database': return <svg {...p}><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8"/></svg>;
  }
};

export default CLDIcon;
export { CLDIcon };
