<?php
// CaveLog Konfiguration
// Für lokale Anpassungen: .env-Datei anlegen (siehe .env.example)

return [

    // ── Datenbank-Treiber ────────────────────────────────────
    // 'sqlite'  → keine Installation nötig, funktioniert sofort
    // 'mysql'   → separater MySQL-Server erforderlich
    'db_driver'    => $_ENV['DB_DRIVER'] ?? 'sqlite',

    // SQLite: Pfad zur Datenbankdatei
    'sqlite_path'  => __DIR__ . '/../db/cavelog.db',

    // MySQL: Zugangsdaten (nur relevant wenn db_driver = 'mysql')
    'db_host'      => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'db_name'      => $_ENV['DB_NAME'] ?? 'cavelog',
    'db_user'      => $_ENV['DB_USER'] ?? 'root',
    'db_pass'      => $_ENV['DB_PASS'] ?? '',

    // ── Mapy.cz ──────────────────────────────────────────────
    // Account anlegen auf https://developer.mapy.com
    // Ohne Key: OpenStreetMap als Fallback
    'mapy_key'     => $_ENV['MAPY_API_KEY'] ?? '',

    // ── App ───────────────────────────────────────────────────
    'app_name'     => 'CaveLog',
    'app_url'      => $_ENV['APP_URL'] ?? 'http://localhost/CaveLog',
    'debug'        => ($_ENV['APP_DEBUG'] ?? 'false') === 'true',

    // ── Upload ────────────────────────────────────────────────
    'upload_dir'   => __DIR__ . '/../uploads',
    'upload_url'   => '/uploads',
    'max_upload_mb'=> 10,

    // ── Session ───────────────────────────────────────────────
    'session_name' => 'cl_session',
];
