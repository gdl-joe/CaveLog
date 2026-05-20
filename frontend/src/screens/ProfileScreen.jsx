// Profil-Screen — CaveLog Calm: sauberer Header, CLRow-Sections
import { useState } from 'react';
import { api } from '../api.js';
import { CLStatTile, CLSection, CLRow } from '../atoms.jsx';

const TEAM_KEY = 'cl_team_members';
function loadTeam() {
  try { return JSON.parse(localStorage.getItem(TEAM_KEY) || '[]'); } catch { return []; }
}
function saveTeam(list) {
  try { localStorage.setItem(TEAM_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export default function ProfileScreen({ theme, prefs, user, trips = [], caves = [], onChangeTheme, onChangeLayout, onChangeDiffMode, onLogout }) {
  const u          = user || {};
  const maxDepth   = trips.length ? Math.max(...trips.map(t => t.depth || 0)) : 0;
  const totalHours = Math.round(trips.reduce((s, t) => s + (t.duration || 0), 0) / 60);

  const [team,       setTeamState]   = useState(loadTeam);
  const [newName,    setNewName]     = useState('');
  const [userList,   setUserList]    = useState(null);
  const [userLoading,setUserLoading] = useState(false);

  const addMember = () => {
    const name = newName.trim();
    if (!name || team.includes(name)) return;
    const next = [...team, name];
    setTeamState(next); saveTeam(next); setNewName('');
  };
  const removeMember = (name) => {
    const next = team.filter(n => n !== name);
    setTeamState(next); saveTeam(next);
  };

  const openUsers = async () => {
    setUserList([]); setUserLoading(true);
    try { setUserList(await api.getUsers()); } catch { setUserList([]); }
    finally { setUserLoading(false); }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ trips, caves, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `cavelog-export-${new Date().toISOString().slice(0,10)}.json` });
    a.click(); URL.revokeObjectURL(url);
  };

  const themeLabel   = { light: 'Hell', dark: 'Dunkel' }[prefs.theme]   || 'Hell';
  const layoutLabel  = { cards: 'Karten', compact: 'Liste', timeline: 'Achse' }[prefs.layout] || 'Karten';
  const diffLabel    = { bars: 'Balken', dots: 'Punkte', numeric: 'Zahl' }[prefs.diffMode] || 'Balken';

  const initials = (u.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ padding: '20px 18px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.warm} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 600, color: theme.bg, letterSpacing: 0.5,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: theme.text, lineHeight: 1.1 }}>{u.name || 'Benutzer'}</div>
          <div style={{ fontSize: 12, color: theme.warm, marginTop: 3, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {u.handle || ''}
          </div>
          <div style={{ marginTop: 6, display: 'inline-block',
            padding: '2px 8px', borderRadius: 999,
            background: theme.accentSoft, border: `1px solid ${theme.accent}33`,
            fontSize: 10, fontWeight: 600, color: theme.accent, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            {u.role || 'Admin'}
          </div>
        </div>
      </div>

      {/* KPI-Strip */}
      <div style={{ padding: '0 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <CLStatTile label="Trips"   value={trips.length} theme={theme} accent="primary" />
        <CLStatTile label="Höhlen"  value={new Set(trips.map(t => t.caveId)).size} theme={theme} accent="warm" />
        <CLStatTile label="Stunden" value={totalHours || '—'} unit="h" theme={theme} accent="ochre" />
      </div>

      {/* Darstellung */}
      <CLSection title="Darstellung" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <CLRow label="Theme"         value={themeLabel}  theme={theme} onClick={() => onChangeTheme(prefs.theme === 'light' ? 'dark' : 'light')} />
          <CLRow label="Listen-Layout" value={layoutLabel} theme={theme} onClick={() => {
            const opts = ['cards','compact','timeline'];
            onChangeLayout(opts[(opts.indexOf(prefs.layout) + 1) % opts.length]);
          }} />
          <CLRow label="Schwierigkeit" value={diffLabel}   theme={theme} last onClick={() => {
            const opts = ['bars','dots','numeric'];
            onChangeDiffMode(opts[(opts.indexOf(prefs.diffMode) + 1) % opts.length]);
          }} />
        </div>
      </CLSection>

      {/* Team-Mitglieder */}
      <CLSection title="Team-Mitglieder" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 11, color: theme.textMute, marginBottom: 10 }}>
            Stehen bei „Neue Befahrung" zur Auswahl.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {team.map(name => (
              <div key={name} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 999,
                background: theme.accentSoft, border: `1px solid ${theme.accent}33`,
                fontSize: 12, color: theme.text,
              }}>
                {name}
                <button onClick={() => removeMember(name)} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: 14, color: theme.textMute, lineHeight: 1 }}>×</button>
              </div>
            ))}
            {team.length === 0 && <span style={{ fontSize: 12, color: theme.textDim }}>Noch leer.</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Name eingeben…" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMember()}
              style={{ flex: 1, appearance: 'none', outline: 'none', padding: '8px 10px', borderRadius: 8, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 13, fontFamily: 'inherit' }} />
            <button onClick={addMember} style={{ appearance: 'none', border: 'none', background: theme.accent, borderRadius: 8, padding: '8px 14px', color: theme.bg, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>+</button>
          </div>
        </div>
      </CLSection>

      {/* Export */}
      <CLSection title="Export" theme={theme}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <CLRow label="JSON-Export" hint="Alle Trips und Höhlen" theme={theme} onClick={exportJSON} />
          <CLRow label="Nutzer verwalten" hint={`${trips.length} Trips`} theme={theme} last onClick={openUsers} />
        </div>
      </CLSection>

      {/* Konto / Abmelden */}
      <CLSection title="" theme={theme} padTop={8}>
        <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <CLRow label="Abmelden" theme={theme} onClick={onLogout} danger last />
        </div>
        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 10, color: theme.textDim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.4 }}>
          CaveLog · v0.2
        </div>
      </CLSection>

      {/* Nutzer-Modal */}
      {userList !== null && (
        <div onClick={() => setUserList(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 412, margin: '0 auto', background: theme.bgElev, borderRadius: '20px 20px 0 0', padding: '20px 0 32px', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 14px', borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: theme.text }}>Nutzer</div>
              <button onClick={() => setUserList(null)} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20, color: theme.textMute, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {userLoading ? (
                <div style={{ padding: 24, textAlign: 'center', color: theme.textMute, fontSize: 13 }}>Lädt…</div>
              ) : userList.map((u, i) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.warm})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: theme.bg, flexShrink: 0 }}>
                    {u.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: theme.textMute }}>{u.email}</div>
                  </div>
                  <div style={{
                    padding: '2px 7px', borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                    background: u.role === 'admin' ? theme.accentSoft : theme.bgSubtle,
                    color:      u.role === 'admin' ? theme.accent     : theme.textMute,
                    border: `1px solid ${u.role === 'admin' ? theme.accent + '33' : theme.border}`,
                  }}>{u.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
