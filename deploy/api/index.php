<?php
// API-Router — leitet /api/xxx an die zugehörige Datei weiter

require_once __DIR__ . '/bootstrap.php';

$path  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = array_values(array_filter(explode('/', $path)));

// Endpunkt ermitteln: /api/{endpoint}/...
$apiPos = array_search('api', $parts);
$endpoint = $parts[$apiPos + 1] ?? '';

$endpoints = [
    'auth'   => __DIR__ . '/auth.php',
    'trips'  => __DIR__ . '/trips.php',
    'caves'  => __DIR__ . '/caves.php',
    'stats'  => __DIR__ . '/stats.php',
    'upload' => __DIR__ . '/upload.php',
    'photos' => __DIR__ . '/photos.php',
    'users'  => __DIR__ . '/users.php',
    'invite' => __DIR__ . '/invite.php',   // ohne Anmeldung erreichbar
    'system' => __DIR__ . '/system.php',
    'plans'  => __DIR__ . '/plans.php',
    'grottocenter' => __DIR__ . '/grottocenter.php',
    // Einstellungen fürs Frontend, als JavaScript (ohne Anmeldung)
    'client-config'    => __DIR__ . '/client-config.php',
    'client-config.js' => __DIR__ . '/client-config.php',
];

if (isset($endpoints[$endpoint])) {
    require $endpoints[$endpoint];
} else {
    Response::notFound("Unbekannter Endpunkt: $endpoint");
}
