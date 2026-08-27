// Adressen prüfen, bevor sie in ein href wandern.
//
// Ein Link, dessen Ziel aus den Daten kommt, darf nicht alles sein dürfen:
// `javascript:…` im href führt beim Klick Code im Namen des Lesers aus. Bei
// den Höhlenquellen ist das keine graue Theorie — die Adresse stammt aus einer
// fremden Sammlung, und angeklickt wird sie von Betrachtern.
//
// Erlaubt sind deshalb nur http und https sowie seiteneigene Pfade.

/** Gibt die Adresse zurück, wenn sie gefahrlos verlinkt werden kann — sonst null. */
export function safeUrl(u) {
  const s = String(u ?? '').trim();
  if (!s) return null;

  // „//fremde.tld" ist eine vollwertige Adresse auf eine fremde Stelle — der
  // Browser ergänzt nur das Protokoll. Muss vor der Prüfung unten raus, denn
  // dort erbt sie das Protokoll der Seite und käme als http: durch.
  if (s.startsWith('//')) return null;

  // Eigene Pfade (/uploads/…) — kein Schema, kann nichts ausführen.
  if (s.startsWith('/')) return s;

  try {
    const p = new URL(s, window.location.origin);
    return (p.protocol === 'http:' || p.protocol === 'https:') ? s : null;
  } catch {
    return null;   // gar keine gültige Adresse
  }
}
