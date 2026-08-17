// theme.js — CaveLog DESKTOP palettes (eigene Desktop-Welt, dunkel-zuerst)
// Drei Richtungen, umschaltbar via Prefs. Default: "Carbide".

export const CLD_PALETTES = {
  carbide: {
    key: 'carbide',
    name: 'Carbide',
    desc: 'Obsidian + Karbidlampen-Amber',
    bg:        '#0a0c0f',
    bg2:       '#0f1318',
    panel:     '#12161c',
    card:      '#161b22',
    cardHi:    '#1c232b',
    line:      'rgba(255,255,255,0.07)',
    lineHi:    'rgba(255,255,255,0.15)',
    text:      '#f3efe6',
    textMute:  '#97a0a8',
    textDim:   '#5a646d',
    accent:    '#ffb43e',   // Karbidlampe
    accentDeep:'#c97e16',
    accentSoft:'rgba(255,180,62,0.13)',
    cool:      '#54c6d6',   // Höhlenwasser
    coolSoft:  'rgba(84,198,214,0.14)',
    rope:      '#d98a4f',
    danger:    '#ff6a47',
    success:   '#8fc96a',
    star:      '#ffb43e',
    heroGrade: 'linear-gradient(180deg, rgba(10,12,15,0) 0%, rgba(10,12,15,0.35) 55%, rgba(10,12,15,0.96) 100%)',
  },
  sump: {
    key: 'sump',
    name: 'Sump',
    desc: 'Kaltes Wasser-Blau, Tiefe',
    bg:        '#06101a',
    bg2:       '#0a1622',
    panel:     '#0d1a28',
    card:      '#10202f',
    cardHi:    '#16293a',
    line:      'rgba(120,200,230,0.09)',
    lineHi:    'rgba(120,200,230,0.20)',
    text:      '#e8f1f5',
    textMute:  '#8aa3b2',
    textDim:   '#4e6675',
    accent:    '#4fd0e0',   // Wasser-Leuchten
    accentDeep:'#2596a6',
    accentSoft:'rgba(79,208,224,0.13)',
    cool:      '#7fb0ff',
    coolSoft:  'rgba(127,176,255,0.14)',
    rope:      '#e0a85a',
    danger:    '#ff7a5c',
    success:   '#7fd0a0',
    star:      '#9fe8f2',
    heroGrade: 'linear-gradient(180deg, rgba(6,16,26,0) 0%, rgba(6,16,26,0.35) 55%, rgba(6,16,26,0.96) 100%)',
  },
  ember: {
    key: 'ember',
    name: 'Ember',
    desc: 'Warmer Fels, Glut-Orange',
    bg:        '#100d0a',
    bg2:       '#17120d',
    panel:     '#1a1410',
    card:      '#201912',
    cardHi:    '#2a2017',
    line:      'rgba(255,170,110,0.08)',
    lineHi:    'rgba(255,170,110,0.18)',
    text:      '#f5ece0',
    textMute:  '#a8978a',
    textDim:   '#6b594c',
    accent:    '#ff7a3c',   // Glut
    accentDeep:'#c4521c',
    accentSoft:'rgba(255,122,60,0.14)',
    cool:      '#5cc0c4',
    coolSoft:  'rgba(92,192,196,0.13)',
    rope:      '#cf9258',
    danger:    '#ff5a47',
    success:   '#9ec16a',
    star:      '#ffb27a',
    heroGrade: 'linear-gradient(180deg, rgba(16,13,10,0) 0%, rgba(16,13,10,0.35) 55%, rgba(16,13,10,0.96) 100%)',
  },
};

// Palette + optionaler freier Akzent → fertiges Theme-Objekt
export function buildTheme(palette, accent) {
  const base = CLD_PALETTES[palette] || CLD_PALETTES.carbide;
  if (accent) {
    return { ...base, accent, accentDeep: accent, accentSoft: accent + '22', star: accent, heroGrade: base.heroGrade };
  }
  return base;
}
