// ErrorBoundary — fängt Fehler beim Rendern ab.
//
// Ohne diesen Auffangschirm hinterlässt ein Fehler in React eine komplett weiße
// Seite: Der Baum wird abgeräumt, aber nichts tritt an seine Stelle. Für eine
// PWA auf dem Handy ist das die schlechteste aller Rückmeldungen — man sieht
// nicht einmal, ob die App überhaupt geladen wurde.
//
// Statt Weiß erscheint hier eine lesbare Meldung samt Fehlertext und zwei
// Auswegen: neu laden oder den Zwischenspeicher der App verwerfen. Letzteres
// hilft, wenn nach einer neuen Fassung noch alte Dateien im Cache des Service
// Workers liegen.
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // Bleibt in der Browser-Konsole stehen, falls jemand nachsehen möchte.
    console.error('CaveLog — Fehler beim Anzeigen:', error, info);
  }

  reload = () => window.location.reload();

  // Service-Worker-Registrierung und alle Caches verwerfen, dann neu laden.
  resetCaches = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch { /* im Zweifel trotzdem neu laden */ }
    window.location.reload();
  };

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    const box = {
      minHeight: '100vh', width: '100%', background: '#12161c', color: '#f3efe6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, boxSizing: 'border-box',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    };
    const btn = (primary) => ({
      appearance: 'none', border: primary ? 'none' : '1px solid rgba(255,255,255,0.18)',
      background: primary ? '#ffb43e' : 'transparent', color: primary ? '#12161c' : '#97a0a8',
      borderRadius: 10, padding: '13px 16px', fontSize: 14, fontWeight: primary ? 700 : 500,
      cursor: 'pointer', fontFamily: 'inherit', width: '100%', marginBottom: 9,
    });

    return (
      <div style={box}>
        <div style={{ maxWidth: 460, width: '100%' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            color: '#ff6a47', marginBottom: 10 }}>Fehler</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}>
            Die Ansicht konnte nicht aufgebaut werden
          </h1>
          <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.6, color: '#97a0a8' }}>
            Deine Daten sind davon nicht betroffen — es ist nur die Anzeige.
            Meist hilft ein Neuladen. Bleibt es dabei, verwirf den Zwischenspeicher:
            Dann holt die App alle Dateien frisch vom Server.
          </p>

          <button style={btn(true)} onClick={this.reload}>Neu laden</button>
          <button style={btn(false)} onClick={this.resetCaches}>Zwischenspeicher verwerfen und neu laden</button>

          <details style={{ marginTop: 18 }}>
            <summary style={{ cursor: 'pointer', fontSize: 12.5, color: '#5a646d' }}>
              Technische Einzelheiten
            </summary>
            <pre style={{
              marginTop: 10, padding: 12, borderRadius: 9, background: '#0a0c0f',
              border: '1px solid rgba(255,255,255,0.07)', color: '#97a0a8',
              fontSize: 11, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              maxHeight: 260, overflow: 'auto', fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            }}>
              {String(error && (error.stack || error.message || error))}
              {info?.componentStack ? '\n\nBetroffene Ansicht:' + info.componentStack : ''}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
