import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import './index.css';

// Die App ist gestartet — der Merker der Selbstheilung (siehe index.html)
// darf weg, damit sie beim nächsten echten Problem wieder greift.
try { sessionStorage.removeItem('cl_selbstheilung'); } catch { /* egal */ }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Fängt Anzeigefehler ab — sonst bliebe die Seite einfach weiß */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
