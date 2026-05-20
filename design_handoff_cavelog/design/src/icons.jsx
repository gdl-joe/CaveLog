// icons.jsx — Custom SVG-Icons im handgezeichneten Höhlen-Stil

const CLIcon = ({ name, size = 24, color = 'currentColor', strokeWidth = 1.6 }) => {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'feed': return (
      <svg {...p}>
        <path d="M4 7l8-4 8 4"/>
        <path d="M4 7v12l8 3 8-3V7"/>
        <path d="M4 7l8 3m0 0l8-3m-8 3v12"/>
      </svg>
    );
    case 'map': return (
      <svg {...p}>
        <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/>
        <path d="M9 4v18M15 6v18"/>
      </svg>
    );
    case 'caves': return (
      <svg {...p}>
        <path d="M3 20V13c0-5 4-9 9-9s9 4 9 9v7"/>
        <path d="M3 20h18"/>
        <path d="M8 20v-3a4 4 0 018 0v3"/>
      </svg>
    );
    case 'stats': return (
      <svg {...p}>
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>
      </svg>
    );
    case 'profile': return (
      <svg {...p}>
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
      </svg>
    );
    case 'plus': return (
      <svg {...p} strokeWidth={2}>
        <path d="M12 5v14M5 12h14"/>
      </svg>
    );
    case 'back': return (
      <svg {...p}>
        <path d="M15 6l-6 6 6 6"/>
      </svg>
    );
    case 'close': return (
      <svg {...p}>
        <path d="M6 6l12 12M18 6L6 18"/>
      </svg>
    );
    case 'search': return (
      <svg {...p}>
        <circle cx="11" cy="11" r="6"/>
        <path d="M20 20l-4.5-4.5"/>
      </svg>
    );
    case 'filter': return (
      <svg {...p}>
        <path d="M3 6h18M6 12h12M10 18h4"/>
      </svg>
    );
    case 'more': return (
      <svg {...p}>
        <circle cx="12" cy="5" r="1.3" fill={color}/>
        <circle cx="12" cy="12" r="1.3" fill={color}/>
        <circle cx="12" cy="19" r="1.3" fill={color}/>
      </svg>
    );
    case 'calendar': return (
      <svg {...p}>
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M3 10h18M8 3v4M16 3v4"/>
      </svg>
    );
    case 'clock': return (
      <svg {...p}>
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 8v4l3 2"/>
      </svg>
    );
    case 'depth': return (
      // arrow pointing down into the earth
      <svg {...p}>
        <path d="M12 3v14"/>
        <path d="M7 12l5 5 5-5"/>
        <path d="M4 20h16"/>
      </svg>
    );
    case 'length': return (
      <svg {...p}>
        <path d="M4 12h16"/>
        <path d="M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3"/>
      </svg>
    );
    case 'drop': return (
      <svg {...p}>
        <path d="M12 3s6 6 6 11a6 6 0 11-12 0c0-5 6-11 6-11z"/>
      </svg>
    );
    case 'rope': return (
      <svg {...p}>
        <path d="M8 3c2 3-2 5 0 8s-2 5 0 8"/>
        <path d="M16 3c-2 3 2 5 0 8s2 5 0 8"/>
      </svg>
    );
    case 'star': return (
      <svg {...p}>
        <path d="M12 3l2.6 5.7L21 9.5l-4.8 4.3L17.5 21 12 17.8 6.5 21l1.3-7.2L3 9.5l6.4-.8L12 3z"/>
      </svg>
    );
    case 'star-filled': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l2.6 5.7L21 8.5l-4.8 4.3L17.5 20 12 16.8 6.5 20l1.3-7.2L3 8.5l6.4-.8L12 2z"/>
      </svg>
    );
    case 'pin': return (
      <svg {...p}>
        <path d="M12 22s-7-7-7-12a7 7 0 1114 0c0 5-7 12-7 12z"/>
        <circle cx="12" cy="10" r="2.5"/>
      </svg>
    );
    case 'camera': return (
      <svg {...p}>
        <path d="M4 7h3l2-2h6l2 2h3v12H4V7z"/>
        <circle cx="12" cy="13" r="3.5"/>
      </svg>
    );
    case 'people': return (
      <svg {...p}>
        <circle cx="9" cy="9" r="3"/>
        <circle cx="17" cy="10" r="2.5"/>
        <path d="M3 19c0-3 3-5 6-5s6 2 6 5"/>
        <path d="M15 19c0-2 2-4 4-4s2 1 2 2"/>
      </svg>
    );
    case 'warning': return (
      <svg {...p}>
        <path d="M12 3l10 18H2L12 3z"/>
        <path d="M12 10v5"/>
        <circle cx="12" cy="18" r="0.8" fill={color}/>
      </svg>
    );
    case 'weather': return (
      <svg {...p}>
        <path d="M6 15a4 4 0 010-8 6 6 0 0112 1 4 4 0 01-1 8H6z"/>
      </svg>
    );
    case 'gear': return (
      <svg {...p}>
        <path d="M7 3h10l-2 5h-6L7 3z"/>
        <path d="M9 8v12l3-2 3 2V8"/>
      </svg>
    );
    case 'check': return (
      <svg {...p} strokeWidth={2}>
        <path d="M5 12l5 5L20 7"/>
      </svg>
    );
    case 'edit': return (
      <svg {...p}>
        <path d="M4 20h4L19 9l-4-4L4 16v4z"/>
        <path d="M14 6l4 4"/>
      </svg>
    );
    case 'chevron-right': return (
      <svg {...p}>
        <path d="M9 6l6 6-6 6"/>
      </svg>
    );
    case 'chevron-down': return (
      <svg {...p}>
        <path d="M6 9l6 6 6-6"/>
      </svg>
    );
    case 'trend-up': return (
      <svg {...p}>
        <path d="M3 17l6-6 4 4 8-8"/>
        <path d="M14 7h7v7"/>
      </svg>
    );
    case 'flame': return (
      <svg {...p}>
        <path d="M12 3s-1 3-3 5-2 4-2 6a5 5 0 0010 0c0-3-3-5-3-7s1-3-2-4z"/>
      </svg>
    );
    case 'bars': return (
      <svg {...p}>
        <path d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    );
    case 'lock': return (
      <svg {...p}>
        <rect x="5" y="10" width="14" height="10" rx="2"/>
        <path d="M8 10V7a4 4 0 018 0v3"/>
      </svg>
    );
    case 'globe': return (
      <svg {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>
      </svg>
    );
    case 'tunnel': return (
      <svg {...p}>
        <path d="M4 20V12a8 8 0 0116 0v8"/>
        <path d="M4 20h16"/>
      </svg>
    );
    case 'pit': return (
      <svg {...p}>
        <ellipse cx="12" cy="5" rx="8" ry="2"/>
        <path d="M4 5v14c0 1 4 2 8 2s8-1 8-2V5"/>
        <path d="M8 6v12M16 6v12"/>
      </svg>
    );
    case 'maze': return (
      <svg {...p}>
        <path d="M3 3h18v18H3z"/>
        <path d="M3 9h12v6H9v-3h6"/>
        <path d="M15 3v6M21 15H15"/>
      </svg>
    );
    case 'chamber': return (
      <svg {...p}>
        <path d="M3 20c2-8 5-12 9-12s7 4 9 12"/>
        <path d="M3 20h18"/>
        <path d="M9 20v-4M15 20v-4"/>
      </svg>
    );
    case 'ice': return (
      <svg {...p}>
        <path d="M12 3v18M4 8l16 8M4 16l16-8"/>
        <path d="M9 5l3 3 3-3M9 19l3-3 3 3"/>
      </svg>
    );
    case 'upload': return (
      <svg {...p}>
        <path d="M12 16V4M7 9l5-5 5 5"/>
        <path d="M4 20h16"/>
      </svg>
    );
    case 'mountains': return (
      <svg {...p}>
        <path d="M3 20l5-9 4 5 3-4 6 8H3z"/>
      </svg>
    );
    default: return <svg {...p}><circle cx="12" cy="12" r="8"/></svg>;
  }
};

window.CLIcon = CLIcon;
