-- CaveLog SQLite-Schema
-- Wird automatisch von setup/init.php angelegt — kein manuelles Ausführen nötig

PRAGMA foreign_keys = ON;
PRAGMA journal_mode  = WAL;

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    handle        TEXT    UNIQUE NOT NULL,
    name          TEXT    NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'viewer'
                          CHECK (role IN ('admin','viewer')),
    prefs         TEXT,
    invite_token  TEXT,
    invited_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    last_login    TEXT,
    created_at    TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS caves (
    id              TEXT    PRIMARY KEY,
    name            TEXT    NOT NULL,
    region          TEXT,
    country         TEXT,
    lat             REAL,
    lng             REAL,
    depth_m         INTEGER,
    length_m        INTEGER,
    type            TEXT    CHECK (type IN ('Horizontal','Vertikal','Mixed','Labyrinth')),
    discovered_year INTEGER,
    notes           TEXT,
    created_by      INTEGER NOT NULL REFERENCES users(id),
    created_at      TEXT    DEFAULT (datetime('now')),
    updated_at      TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_caves_country ON caves(country);

CREATE TABLE IF NOT EXISTS trips (
    id           TEXT    PRIMARY KEY,
    cave_id      TEXT    NOT NULL REFERENCES caves(id),
    title        TEXT    NOT NULL,
    date         TEXT    NOT NULL,
    start_time   TEXT,
    end_time     TEXT,
    duration_min INTEGER,
    type         TEXT    CHECK (type IN ('Horizontal','Vertikal','Mixed','Labyrinth')),
    wet          TEXT    CHECK (wet IN ('Trocken','Teilweise','Nass')),
    rope         TEXT    CHECK (rope IN ('Ohne','Mit Seil','SRT')),
    diff_t       INTEGER,
    diff_k       INTEGER,
    diff_p       INTEGER,
    rating       INTEGER,
    depth_m      INTEGER,
    length_m     INTEGER,
    weather      TEXT,
    notes        TEXT,
    hero_icon    TEXT    DEFAULT 'tunnel',
    is_public    INTEGER NOT NULL DEFAULT 0,
    created_by   INTEGER NOT NULL REFERENCES users(id),
    created_at   TEXT    DEFAULT (datetime('now')),
    updated_at   TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_trips_date    ON trips(date);
CREATE INDEX IF NOT EXISTS idx_trips_cave_id ON trips(cave_id);

CREATE TABLE IF NOT EXISTS trip_team (
    trip_id        TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    member_name    TEXT NOT NULL,
    member_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (trip_id, member_name)
);

CREATE TABLE IF NOT EXISTS trip_gear (
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    gear    TEXT NOT NULL,
    PRIMARY KEY (trip_id, gear)
);

CREATE TABLE IF NOT EXISTS trip_hazards (
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    hazard  TEXT NOT NULL,
    PRIMARY KEY (trip_id, hazard)
);

CREATE TABLE IF NOT EXISTS photos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id    TEXT    NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    path       TEXT    NOT NULL,
    thumb_path TEXT,
    large_path TEXT,
    caption    TEXT,
    taken_at   TEXT,
    gps_lat    REAL,
    gps_lng    REAL,
    width      INTEGER,
    height     INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_photos_trip ON photos(trip_id, sort_order);
