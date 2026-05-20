<?php
// Konfiguration — Werte aus .env oder direkt hier eintragen
// Für Produktion: Datei außerhalb des Web-Roots ablegen oder .env nutzen

return [
    'db_host'      => $_ENV['DB_HOST'] ?? 'localhost',
    'db_name'      => $_ENV['DB_NAME'] ?? 'cavelog',
    'db_user'      => $_ENV['DB_USER'] ?? 'root',
    'db_pass'      => $_ENV['DB_PASS'] ?? '',

    // Mapy.cz API-Key (wird ins Frontend injiziert)
    'mapy_key'     => $_ENV['MAPY_API_KEY'] ?? '',

    // App-Einstellungen
    'app_name'     => 'CaveLog',
    'app_url'      => $_ENV['APP_URL'] ?? 'http://localhost/CaveLog',
    'debug'        => ($_ENV['APP_DEBUG'] ?? 'false') === 'true',

    // Upload
    'upload_dir'   => __DIR__ . '/../uploads',
    'upload_url'   => '/uploads',
    'max_upload_mb'=> 10,

    // Session
    'session_name' => 'cl_session',
];
