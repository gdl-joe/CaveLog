<?php
require_once __DIR__ . '/bootstrap.php';

/**
 * Einladung einlösen — der einzige Endpunkt, der ohne Anmeldung erreichbar ist.
 *
 * GET  /api/invite?token=…   Token prüfen → Name/E-Mail für die Begrüßung
 * POST /api/invite           { token, password } → Passwort setzen und anmelden
 *
 * Der Token wird beim Einlösen verbraucht. Er ersetzt zugleich den
 * „Passwort vergessen"-Weg: Ein Admin erzeugt einen neuen Link im Admin-Panel.
 */

$method = $_SERVER['REQUEST_METHOD'];
$db     = Database::get();

// ── GET /api/invite?token=… ───────────────────────────────
if ($method === 'GET') {
    $user = findByToken($db, (string)($_GET['token'] ?? ''));
    Response::json([
        'valid' => true,
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role'],
        // Erstanmeldung oder Passwort-Reset? Ändert nur die Ansprache im UI.
        'first' => empty($user['last_login']),
    ]);
}

// ── POST /api/invite ──────────────────────────────────────
if ($method === 'POST') {
    Auth::verifyCsrf();
    $b = getBody();

    $user = findByToken($db, (string)($b['token'] ?? ''));
    $pw   = (string)($b['password'] ?? '');

    if (strlen($pw) < 10)     Response::error('Das Passwort muss mindestens 10 Zeichen lang sein.');
    if (strlen($pw) > 200)    Response::error('Das Passwort ist zu lang.');

    $sets = ['password_hash = ?', 'invite_token = ?'];
    $vals = [password_hash($pw, PASSWORD_BCRYPT, ['cost' => 12]), null];
    if (Schema::has('users', 'invite_expires')) { $sets[] = 'invite_expires = ?'; $vals[] = null; }

    $vals[] = (int)$user['id'];
    $db->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);

    Auth::loginAs((int)$user['id']);

    $me = Auth::user();
    unset($me['password_hash']);
    Response::json(['user' => $me, 'csrf' => Auth::csrf()]);
}

Response::error('Method not allowed', 405);

// ── Helpers ───────────────────────────────────────────────

/** Token auflösen — oder mit einer bewusst unspezifischen Meldung abbrechen. */
function findByToken(PDO $db, string $token): array
{
    $invalid = 'Dieser Einladungslink ist ungültig oder abgelaufen. Bitte lass dir einen neuen schicken.';

    if (strlen($token) !== 64 || !ctype_xdigit($token)) Response::error($invalid, 404);

    $stmt = $db->prepare('SELECT * FROM users WHERE invite_token = ? LIMIT 1');
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) Response::error($invalid, 404);

    if (!empty($user['invite_expires']) && strtotime((string)$user['invite_expires']) < time()) {
        Response::error($invalid, 404);
    }
    if (array_key_exists('is_active', $user) && (int)$user['is_active'] !== 1) {
        Response::error('Dieser Zugang ist gesperrt. Bitte wende dich an den Betreiber.', 403);
    }

    return $user;
}
