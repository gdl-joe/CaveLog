// RichText — Fließtext mit leichter Formatierung, für Höhlenbeschreibungen
// und Tourberichte.
//
// Ohne Zutun bleibt einfach alles erhalten, was man eintippt: Absätze durch
// Leerzeilen, Zeilenumbrüche innerhalb eines Absatzes. Wer mehr will, kann
// eine Handvoll Zeichen aus Markdown benutzen — mehr nicht, denn eine
// Höhlenbeschreibung braucht keine Tabellen und keine eingebetteten Bilder:
//
//   ## Zwischenüberschrift
//   - Aufzählungspunkt        (auch * oder •)
//   1. Nummerierte Liste
//   > Hinweis oder Zitat
//   **fett**  *kursiv*  `Maß`
//   ---                        (Trennlinie)
//
// Bewusst ohne dangerouslySetInnerHTML: Der Text wird in React-Elemente
// übersetzt, nicht in HTML. Damit kann aus einem Beschreibungstext niemals
// Markup werden — auch nicht aus einem versehentlich eingefügten <script>.

// ── Zeichenweise Auszeichnung innerhalb einer Zeile ───────
const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`)/g;

function inline(text, theme, keyBase) {
  const teile = String(text).split(INLINE).filter(t => t !== '' && t !== undefined);
  return teile.map((t, i) => {
    const k = `${keyBase}-${i}`;
    if ((t.startsWith('**') && t.endsWith('**')) || (t.startsWith('__') && t.endsWith('__'))) {
      return <strong key={k} style={{ fontWeight: 700, color: theme.text }}>{t.slice(2, -2)}</strong>;
    }
    if ((t.startsWith('*') && t.endsWith('*')) || (t.startsWith('_') && t.endsWith('_'))) {
      return <em key={k}>{t.slice(1, -1)}</em>;
    }
    if (t.startsWith('`') && t.endsWith('`')) {
      return (
        <code key={k} style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: '0.88em',
          background: theme.bgSubtle || theme.card || 'rgba(128,128,128,0.12)',
          padding: '1px 5px', borderRadius: 4,
        }}>{t.slice(1, -1)}</code>
      );
    }
    return <span key={k}>{t}</span>;
  });
}

// Zeilen mit einfachem Umbruch innerhalb eines Absatzes zusammenhalten
function zeilen(text, theme, keyBase) {
  return String(text).split('\n').flatMap((z, i) =>
    i === 0 ? inline(z, theme, `${keyBase}-${i}`)
            : [<br key={`${keyBase}-br-${i}`} />, ...inline(z, theme, `${keyBase}-${i}`)]
  );
}

export default function RichText({ text, theme, size = 14.5, style }) {
  if (!text || !String(text).trim()) return null;

  // Absätze trennen sich durch Leerzeilen
  const abschnitte = String(text).replace(/\r\n?/g, '\n').split(/\n{2,}/);
  const raus = [];

  abschnitte.forEach((abs, ai) => {
    const roh = abs.trim();
    if (!roh) return;

    // Trennlinie
    if (/^([-*_])\1{2,}$/.test(roh)) {
      raus.push(<hr key={`hr${ai}`} style={{
        border: 'none', borderTop: `1px solid ${theme.border || theme.line}`, margin: '18px 0',
      }} />);
      return;
    }

    // Überschrift
    const h = roh.match(/^(#{1,3})\s+(.*)$/);
    if (h && !roh.includes('\n')) {
      const stufe = h[1].length;
      raus.push(
        <div key={`h${ai}`} style={{
          fontSize: size + (stufe === 1 ? 4 : stufe === 2 ? 2 : 0.5),
          fontWeight: 700, color: theme.text,
          marginTop: raus.length ? 20 : 0, marginBottom: 7, lineHeight: 1.3,
        }}>{inline(h[2], theme, `h${ai}`)}</div>
      );
      return;
    }

    const zn = roh.split('\n');

    // Aufzählung — alle Zeilen beginnen mit einem Listenzeichen
    if (zn.every(z => /^\s*[-*•]\s+/.test(z))) {
      raus.push(
        <ul key={`ul${ai}`} style={{ margin: '0 0 12px', paddingLeft: 20, lineHeight: 1.65 }}>
          {zn.map((z, i) => (
            <li key={i} style={{ marginBottom: 3 }}>{inline(z.replace(/^\s*[-*•]\s+/, ''), theme, `ul${ai}-${i}`)}</li>
          ))}
        </ul>
      );
      return;
    }

    // Nummerierte Liste
    if (zn.every(z => /^\s*\d+[.)]\s+/.test(z))) {
      raus.push(
        <ol key={`ol${ai}`} style={{ margin: '0 0 12px', paddingLeft: 22, lineHeight: 1.65 }}>
          {zn.map((z, i) => (
            <li key={i} style={{ marginBottom: 3 }}>{inline(z.replace(/^\s*\d+[.)]\s+/, ''), theme, `ol${ai}-${i}`)}</li>
          ))}
        </ol>
      );
      return;
    }

    // Zitat oder Hinweis
    if (zn.every(z => /^\s*>\s?/.test(z))) {
      raus.push(
        <div key={`bq${ai}`} style={{
          borderLeft: `3px solid ${theme.accent}`, paddingLeft: 13, margin: '0 0 12px',
          color: theme.textMute, lineHeight: 1.65, fontStyle: 'italic',
        }}>{zeilen(zn.map(z => z.replace(/^\s*>\s?/, '')).join('\n'), theme, `bq${ai}`)}</div>
      );
      return;
    }

    // Gewöhnlicher Absatz
    raus.push(
      <p key={`p${ai}`} style={{ margin: '0 0 12px', lineHeight: 1.65 }}>
        {zeilen(roh, theme, `p${ai}`)}
      </p>
    );
  });

  // Die Klasse entfernt den Abstand unter dem letzten Absatz (Regel in index.css)
  return (
    <div className="cl-rich" style={{ fontSize: size, color: theme.text, ...style }}>
      {raus}
    </div>
  );
}

/** Kurzer Hinweis fürs Eingabefeld — überall gleich formuliert. */
export const FORMAT_HINWEIS =
  'Leerzeile = neuer Absatz · ## Überschrift · - Aufzählung · **fett** · > Hinweis';
