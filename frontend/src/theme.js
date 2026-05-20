// Design Tokens — Outdoor-Naturpalette für CaveLog Calm
// Hell (Default): warmes Off-White, Moos-Grün, Terracotta, Ocker

export const CL_THEMES = {
  light: {
    name: 'Hell',
    bg:          '#f1f3ec',
    bgElev:      '#fafbf6',
    bgCard:      '#fafbf6',
    bgCardHi:    '#e6ebde',
    bgSubtle:    '#dfe4d4',
    border:      '#cdd3bf',
    borderHi:    '#a4ad94',
    text:        '#1a2620',
    textMute:    '#5d6a5e',
    textDim:     '#94a094',
    accent:      '#2f5d3d',
    accentDim:   '#1f4429',
    accentSoft:  '#d4e1cc',
    warm:        '#b85d3a',
    warmDim:     '#8c421f',
    warmSoft:    '#f1d9c8',
    ochre:       '#c08a2e',
    ochreSoft:   '#f0e0b8',
    danger:      '#a14b2a',
    success:     '#4f7a3e',
    wet:         '#3f6a82',
    rope:        '#8a5a30',
    diffNeutral: '#2f5d3d',
    statusBarDark: false,
  },
  dark: {
    name: 'Dunkel',
    bg:          '#131a16',
    bgElev:      '#1c2520',
    bgCard:      '#1f2925',
    bgCardHi:    '#26312c',
    bgSubtle:    '#2a3530',
    border:      '#2c3631',
    borderHi:    '#475048',
    text:        '#e8eee6',
    textMute:    '#8d978d',
    textDim:     '#5a635c',
    accent:      '#7fbf8a',
    accentDim:   '#5a9968',
    accentSoft:  '#26352c',
    warm:        '#d8825a',
    warmDim:     '#a55a36',
    warmSoft:    '#3a261d',
    ochre:       '#dba858',
    ochreSoft:   '#3a2f1c',
    danger:      '#c47158',
    success:     '#90a878',
    wet:         '#7298ad',
    rope:        '#c79872',
    diffNeutral: '#7fbf8a',
    statusBarDark: true,
  },
};

export function getTheme(name) {
  return CL_THEMES[name] || CL_THEMES.light;
}

export function stageBg(themeName) {
  return themeName === 'dark'
    ? 'radial-gradient(ellipse at top, #1d2220 0%, #0d100e 85%)'
    : 'radial-gradient(ellipse at top, #fbfbf7 0%, #e2e6da 85%)';
}
