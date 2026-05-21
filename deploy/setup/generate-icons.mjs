// Generiert icon-192.png und icon-512.png für die PWA
// Aufruf: node setup/generate-icons.mjs
// Voraussetzung: npm install --save-dev sharp

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CaveLog Icon: dunkler Hintergrund, Höhleneingang in Amber, Seil, Lampen-Glow
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Hintergrund: warmes Dunkel -->
  <rect width="512" height="512" rx="96" fill="#1a120c"/>

  <!-- Äußere Höhlenwände (Amber) -->
  <path d="M 256 56 Q 110 56 86 216 L 86 456 L 426 456 L 426 216 Q 402 56 256 56 Z"
    fill="#f5a524" opacity="0.92"/>

  <!-- Innerer Höhlenkörper (dunkel) -->
  <path d="M 256 110 Q 140 110 130 224 L 130 456 L 382 456 L 382 224 Q 372 110 256 110 Z"
    fill="#0f0b08"/>

  <!-- Stalaktiten oben -->
  <polygon points="176,110 162,208 190,208" fill="#f5a524" opacity="0.75"/>
  <polygon points="220,102 204,214 236,214" fill="#f5a524" opacity="0.85"/>
  <polygon points="256,99 239,220 273,220" fill="#f5a524" opacity="0.90"/>
  <polygon points="292,102 276,214 308,214" fill="#f5a524" opacity="0.85"/>
  <polygon points="336,110 322,206 350,206" fill="#f5a524" opacity="0.75"/>

  <!-- Seil -->
  <path d="M 256 102 Q 259 230 253 330 Q 257 390 256 456"
    stroke="#c97d46" stroke-width="8" fill="none"
    stroke-linecap="round" stroke-dasharray="14 10"/>

  <!-- Lampen-Glow unten -->
  <circle cx="256" cy="390" r="36" fill="#f5a524" opacity="0.95"/>
  <circle cx="256" cy="390" r="72" fill="#f5a524" opacity="0.14"/>
  <circle cx="256" cy="390" r="118" fill="#f5a524" opacity="0.06"/>

  <!-- Glühen-Reflexe an den Wänden -->
  <ellipse cx="160" cy="350" rx="18" ry="30" fill="#f5a524" opacity="0.08" transform="rotate(-15 160 350)"/>
  <ellipse cx="352" cy="350" rx="18" ry="30" fill="#f5a524" opacity="0.08" transform="rotate(15 352 350)"/>
</svg>`;

async function run() {
  const buf = Buffer.from(svg);
  const out = path.join(__dirname, '..', 'public');

  for (const size of [192, 512]) {
    const dest = path.join(out, `icon-${size}.png`);
    await sharp(buf).resize(size, size).png({ compressionLevel: 9 }).toFile(dest);
    console.log(`✓ public/icon-${size}.png`);
  }
  console.log('\nFertig! Icons liegen in public/');
}

run().catch(err => { console.error('Fehler:', err.message); process.exit(1); });
