// theme.jsx — Farbpaletten + Typo für CaveLog

const CL_THEMES = {
  // Dunkel: tiefe Höhle, warmes Lampenlicht
  dark: {
    name: 'Dunkel',
    bg:        '#0f0b08',
    bgElev:    '#1a120c',
    bgCard:    '#1f1610',
    bgCardHi:  '#2a1e14',
    border:    'rgba(245, 165, 36, 0.12)',
    borderHi:  'rgba(245, 165, 36, 0.25)',
    text:      '#f5e8c9',
    textMute:  '#9a876a',
    textDim:   '#5a4a38',
    accent:    '#f5a524',   // Lampenlicht-Amber
    accentDim: '#a06b10',
    accentSoft:'rgba(245, 165, 36, 0.14)',
    danger:    '#e8553a',
    success:   '#7cb342',
    wet:       '#4db8d4',
    rope:      '#c97d46',
    statusBarDark: true,
  },
  // Amber: höhlen-bernstein, mittlere Tiefe
  amber: {
    name: 'Amber',
    bg:        '#241509',
    bgElev:    '#2e1c0f',
    bgCard:    '#3a2414',
    bgCardHi:  '#472d19',
    border:    'rgba(255, 193, 100, 0.18)',
    borderHi:  'rgba(255, 193, 100, 0.35)',
    text:      '#fce9c2',
    textMute:  '#bd9b66',
    textDim:   '#7a5f36',
    accent:    '#ffbb47',
    accentDim: '#cc8a1a',
    accentSoft:'rgba(255, 193, 100, 0.18)',
    danger:    '#ff7050',
    success:   '#9dc960',
    wet:       '#5ecbe6',
    rope:      '#e0935a',
    statusBarDark: true,
  },
  // Hell: Tagesoberfläche
  light: {
    name: 'Hell',
    bg:        '#faf6ee',
    bgElev:    '#f3ecdc',
    bgCard:    '#ffffff',
    bgCardHi:  '#fbf3e0',
    border:    'rgba(90, 60, 20, 0.12)',
    borderHi:  'rgba(90, 60, 20, 0.25)',
    text:      '#2a1a0a',
    textMute:  '#7a5a38',
    textDim:   '#b0987a',
    accent:    '#b8721a',
    accentDim: '#8a560c',
    accentSoft:'rgba(184, 114, 26, 0.12)',
    danger:    '#c83a20',
    success:   '#5a8a28',
    wet:       '#2a8ab0',
    rope:      '#9a5a22',
    statusBarDark: false,
  },
};

// Sofort nutzbar in CSS custom-props, aber wir verwenden JS-Objekte direkt.
window.CL_THEMES = CL_THEMES;
