// API-Client — alle Requests an das PHP-Backend

// Relativer Pfad — funktioniert im Root UND in Unterordnern
// /cavelog_fabian/ + 'api/trips' = /cavelog_fabian/api/trips
const BASE = 'api';

let _csrf = null;

async function getCsrf() {
  if (_csrf) return _csrf;
  const res = await fetch(`${BASE}/auth/csrf`, { credentials: 'include' });
  const data = await res.json();
  _csrf = data.csrf;
  return _csrf;
}

// Zentraler Request-Handler
async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };

  if (['POST', 'PATCH', 'DELETE'].includes(method)) {
    headers['X-CSRF-Token'] = await getCsrf();
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Bei 401 CSRF-Token zurücksetzen (Session abgelaufen)
  if (res.status === 401) { _csrf = null; }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error || `Fehler ${res.status}`;
    throw Object.assign(new Error(msg), { status: res.status, data });
  }

  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────
  me:     ()               => request('GET',  '/auth/me'),
  login:  async (email, pw) => {
    const res = await request('POST', '/auth/login', { email, password: pw });
    // Session wurde regeneriert → neuen CSRF-Token aus der Antwort übernehmen
    if (res?.csrf) _csrf = res.csrf;
    return res;
  },
  logout: ()               => request('POST', '/auth/logout'),

  // ── Trips ─────────────────────────────────────────────────
  getTrips:   (p = {})     => request('GET',    `/trips?${new URLSearchParams(p)}`),
  getTrip:    (id)         => request('GET',    `/trips/${id}`),
  createTrip: (data)       => request('POST',   '/trips', data),
  updateTrip: (id, data)   => request('PATCH',  `/trips/${id}`, data),
  deleteTrip: (id)         => request('DELETE', `/trips/${id}`),

  // ── Caves ─────────────────────────────────────────────────
  getCaves:   (p = {})     => request('GET',    `/caves?${new URLSearchParams(p)}`),
  getCave:    (id)         => request('GET',    `/caves/${id}`),
  createCave: (data)       => request('POST',   '/caves', data),
  updateCave: (id, data)   => request('PATCH',  `/caves/${id}`, data),

  // ── Stats ─────────────────────────────────────────────────
  getStats:   ()           => request('GET',    '/stats'),

  // ── Nutzerverwaltung (nur Bearbeiter) ─────────────────────
  getUsers:   ()          => request('GET',    '/users'),
  createUser: (data)      => request('POST',   '/users', data),          // → { invite_url, … }
  updateUser: (id, data)  => request('PATCH',  `/users/${id}`, data),
  deleteUser: (id)        => request('DELETE', `/users/${id}`),

  // ── Einladung einlösen (ohne Anmeldung) ───────────────────
  checkInvite:  (token)       => request('GET',  `/invite?token=${encodeURIComponent(token)}`),
  redeemInvite: async (token, password) => {
    const res = await request('POST', '/invite', { token, password });
    if (res?.csrf) _csrf = res.csrf;   // Sitzung wurde neu aufgesetzt
    return res;
  },

  // ── System (nur Bearbeiter) ───────────────────────────────
  getSystem:  ()        => request('GET',  '/system'),
  migrateDb:  ()        => request('POST', '/system/migrate'),
  cleanupFiles: (paths) => request('POST', '/system/cleanup', { paths }),
  // Erzeugt fehlende Vollbild-Ableitungen — paketweise, damit der Server nicht
  // ins Zeitlimit läuft. Antwort enthält `remaining`; so lange erneut aufrufen.
  processPhotos: (batch = 5, after = 0) => request('POST', '/system/photos', { batch, after }),

  // ── Pläne einer Höhle (Grundrisse, Schnitte, Karten) ──────
  getPlans:   (caveId)     => request('GET',    `/plans?cave_id=${encodeURIComponent(caveId)}`),
  updatePlan: (id, data)   => request('PATCH',  `/plans?id=${id}`, data),
  deletePlan: (id)         => request('DELETE', `/plans?id=${id}`),
  uploadPlan: async (caveId, file, { title = '', kind = 'sonstiges' } = {}) => {
    const fd = new FormData();
    fd.append('cave_id', caveId);
    fd.append('kind', kind);
    if (title) fd.append('title', title);
    fd.append('plan', file);
    const res = await fetch(`${BASE}/plans`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': await getCsrf() },
      body: fd,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw Object.assign(new Error(data?.error || `Fehler ${res.status}`), { status: res.status });
    return data;
  },

  // ── Fotos ─────────────────────────────────────────────────
  getPhotos:   (tripId)       => request('GET',    `/photos?trip_id=${encodeURIComponent(tripId)}`),
  deletePhoto: (id)           => request('DELETE', `/photos?id=${id}`),
  makePhotoCover: (id)        => request('PATCH',  `/photos?id=${id}`, { make_cover: true }),

  // ── Upload ────────────────────────────────────────────────
  uploadPhoto: (tripId, file) => {
    const fd = new FormData();
    fd.append('trip_id', tripId);
    fd.append('photo', file);
    return fetch(`${BASE}/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': _csrf || '' },
      body: fd,
    }).then(r => r.json());
  },

  // Höhlen-Titelbild hochladen
  uploadCaveCover: (caveId, file) => {
    const fd = new FormData();
    fd.append('cave_id', caveId);
    fd.append('photo', file);
    return fetch(`${BASE}/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': _csrf || '' },
      body: fd,
    }).then(r => r.json());
  },
};
