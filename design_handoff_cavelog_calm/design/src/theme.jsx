// theme.jsx — Outdoor-Naturpalette für CaveLog Calm
// Grundstimmung: Moos/Tannengrün als Primärfarbe, Terracotta als warmer Komplementärakzent

const CL_THEMES = {
  // Hell (Default): warmes Off-White mit Grünstich, sattes Moos als Primär
  light: {
    name: 'Hell',
    bg:        '#f1f3ec',     // warmes Off-White, leicht grünstichig
    bgElev:    '#fafbf6',
    bgCard:    '#fafbf6',
    bgCardHi:  '#e6ebde',
    bgSubtle:  '#dfe4d4',
    border:    '#cdd3bf',
    borderHi:  '#a4ad94',
    text:      '#1a2620',
    textMute:  '#5d6a5e',
    textDim:   '#94a094',
    // Primär: sattes Moos/Tannengrün — kräftiger als vorher
    accent:    '#2f5d3d',
    accentDim: '#1f4429',
    accentSoft:'#d4e1cc',
    // Komplementär: warmes Terracotta — kommt aus Erde/Lampenlicht
    warm:      '#b85d3a',
    warmDim:   '#8c421f',
    warmSoft:  '#f1d9c8',
    // Sekundär-Akzent: Ocker für Sonne/Helm/Highlights
    ochre:     '#c08a2e',
    ochreSoft: '#f0e0b8',
    danger:    '#a14b2a',
    success:   '#4f7a3e',
    wet:       '#3f6a82',
    rope:      '#8a5a30',
    diffNeutral: '#2f5d3d',
    statusBarDark: false,
  },
  // Dunkel: tiefes Tannengrün, warme Lampenlicht-Akzente
  dark: {
    name: 'Dunkel',
    bg:        '#131a16',
    bgElev:    '#1c2520',
    bgCard:    '#1f2925',
    bgCardHi:  '#26312c',
    bgSubtle:  '#2a3530',
    border:    '#2c3631',
    borderHi:  '#475048',
    text:      '#e8eee6',
    textMute:  '#8d978d',
    textDim:   '#5a635c',
    // Primär: helles, lebendiges Salbei/Tannengrün
    accent:    '#7fbf8a',
    accentDim: '#5a9968',
    accentSoft:'#26352c',
    // Komplementär: warmes Kupfer/Terracotta — wie Lampenlicht
    warm:      '#d8825a',
    warmDim:   '#a55a36',
    warmSoft:  '#3a261d',
    ochre:     '#dba858',
    ochreSoft: '#3a2f1c',
    danger:    '#c47158',
    success:   '#90a878',
    wet:       '#7298ad',
    rope:      '#c79872',
    diffNeutral: '#7fbf8a',
    statusBarDark: true,
  },
};

window.CL_THEMES = CL_THEMES;
