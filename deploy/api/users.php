<?php
require_once __DIR__ . '/bootstrap.php';

/**
 * Nutzerverwaltung — ausschließlich für Admins.
 *
 * GET    /api/users        Liste aller Nutzer (inkl. offener Einladungslinks)
 * POST   /api/users        Neuen Nutzer anlegen → gibt Einladungslink zurück
 * PATCH  /api/users/:id    Rolle/Name/E-Mail ändern, sperren, neu einladen
 * DELETE /api/users/:id    Nutzer löschen
 *
 * Zugänge entstehen nur hier — es gibt keine öffentliche Registrierung.
 * Das Passwort setzt die eingeladene Person selbst über den Einladungslink.
 */

$me     = Auth::requireAdmin();
$db     = Database::get();
$method = $_SERVER['REQUEST_METHOD'];

$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$last   = $parts[count($parts) - 1];
$userId = ($last !== 'users' && ctype_digit($last)) ? (int)$last : null;

const INVITE_DAYS = 14;

// ── GET /api/users ────────────────────────────────────────
if ($method === 'GET' && !$userId) {
    $rows = $db->query('SELECT * FROM users ORDER BY role ASC, name ASC')->fetchAll();
    Response::json(array_map('publicUser', $rows));
}

// ── POST /api/users — anlegen + einladen ──────────────────
if ($method === 'POST' && !$userId) {
    Auth::verifyCsrf();
    $b = getBody();

    $name  = trim((string)($b['name']  ?? ''));
    $email = strtolower(trim((string)($b['email'] ?? '')));
    $role  = ($b['role'] ?? 'viewer') === 'admin' ? 'admin' : 'viewer';

    if ($name === '')                                   Response::error('Bitte einen Namen angeben.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))     Response::error('Bitte eine gültige E-Mail-Adresse angeben.');

    $exists = $db->prepare('SELECT id FROM users WHERE email = ?');
    $exists->execute([$email]);
    if ($exists->fetch()) Response::error('Diese E-Mail-Adresse wird bereits verwendet.');

    $token   = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + INVITE_DAYS * 86400);

    // Platzhalter-Hash: gültiges Format, aber niemandem bekannt. Der Zugang wird
    // erst nutzbar, wenn die eingeladene Person über den Link ein Passwort setzt.
    $hash = password_hash(bin2hex(random_bytes(32)), PASSWORD_BCRYPT, ['cost' => 12]);

    $cols = ['handle', 'name', 'email', 'password_hash', 'role', 'prefs', 'invite_token', 'invited_by'];
    $vals = [uniqueHandle($db, $name), $name, $email, $hash, $role,
             '{"theme":"light","layout":"cards","diffMode":"bars"}', $token, $me['id']];

    if (Schema::has('users', 'invite_expires')) { $cols[] = 'invite_expires'; $vals[] = $expires; }

    $sql = 'INSERT INTO users (' . implode(',', $cols) . ') VALUES (' . rtrim(str_repeat('?,', count($cols)), ',') . ')';
    try {
        $db->prepare($sql)->execute($vals);
    } catch (Throwable $e) {
        Response::error('Nutzer konnte nicht angelegt werden.', 500);
    }

    $row = $db->prepare('SELECT * FROM users WHERE id = ?');
    $row->execute([(int)$db->lastInsertId()]);
    Response::json(publicUser($row->fetch()), 201);
}

// ── PATCH /api/users/:id ──────────────────────────────────
if ($method === 'PATCH' && $userId) {
    Auth::verifyCsrf();
    $b      = getBody();
    $target = findUser($db, $userId);

    $sets = [];
    $vals = [];

    // Rolle
    if (isset($b['role'])) {
        $role = $b['role'] === 'admin' ? 'admin' : 'viewer';
        if ($userId === (int)$me['id'] && $role !== 'admin') {
            Response::error('Du kannst dir die Verwaltungsrechte nicht selbst entziehen.', 409);
        }
        if ($role !== 'admin' && $target['role'] === 'admin' && countActiveAdmins($db, $userId) === 0) {
            Response::error('Es muss mindestens ein Bearbeiter übrig bleiben.', 409);
        }
        $sets[] = 'role = ?'; $vals[] = $role;
    }

    // Name
    if (isset($b['name'])) {
        $name = trim((string)$b['name']);
        if ($name === '') Response::error('Bitte einen Namen angeben.');
        $sets[] = 'name = ?'; $vals[] = $name;
    }

    // E-Mail
    if (isset($b['email'])) {
        $email = strtolower(trim((string)$b['email']));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) Response::error('Bitte eine gültige E-Mail-Adresse angeben.');
        $dup = $db->prepare('SELECT id FROM users WHERE email = ? AND id <> ?');
        $dup->execute([$email, $userId]);
        if ($dup->fetch()) Response::error('Diese E-Mail-Adresse wird bereits verwendet.');
        $sets[] = 'email = ?'; $vals[] = $email;
    }

    // Sperren / entsperren
    if (isset($b['is_active']) && Schema::has('users', 'is_active')) {
        $active = (bool)$b['is_active'];
        if (!$active && $userId === (int)$me['id']) {
            Response::error('Du kannst deinen eigenen Zugang nicht sperren.', 409);
        }
        if (!$active && $target['role'] === 'admin' && countActiveAdmins($db, $userId) === 0) {
            Response::error('Es muss mindestens ein Bearbeiter übrig bleiben.', 409);
        }
        $sets[] = 'is_active = ?'; $vals[] = $active ? 1 : 0;
    }

    // Neuer Einladungslink (dient zugleich als Passwort-Reset).
    // Das bisherige Passwort bleibt gültig, bis der Link eingelöst wird.
    if (!empty($b['new_invite'])) {
        $sets[] = 'invite_token = ?'; $vals[] = bin2hex(random_bytes(32));
        if (Schema::has('users', 'invite_expires')) {
            $sets[] = 'invite_expires = ?'; $vals[] = date('Y-m-d H:i:s', time() + INVITE_DAYS * 86400);
        }
    }

    // Offene Einladung zurückziehen
    if (!empty($b['revoke_invite'])) {
        $sets[] = 'invite_token = ?'; $vals[] = null;
        if (Schema::has('users', 'invite_expires')) { $sets[] = 'invite_expires = ?'; $vals[] = null; }
    }

    if (!$sets) Response::error('Keine Änderung angegeben.');

    $vals[] = $userId;
    $db->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($vals);

    Response::json(publicUser(findUser($db, $userId)));
}

// ── DELETE /api/users/:id ─────────────────────────────────
if ($method === 'DELETE' && $userId) {
    Auth::verifyCsrf();
    $target = findUser($db, $userId);

    if ($userId === (int)$me['id'])  Response::error('Du kannst dich nicht selbst löschen.', 409);
    if ($target['role'] === 'admin' && countActiveAdmins($db, $userId) === 0) {
        Response::error('Es muss mindestens ein Bearbeiter übrig bleiben.', 409);
    }

    // Befahrungen bleiben erhalten — created_by zeigt sonst ins Leere.
    $trips = $db->prepare('SELECT COUNT(*) FROM trips WHERE created_by = ?');
    $trips->execute([$userId]);
    if ((int)$trips->fetchColumn() > 0) {
        Response::error('Dieser Nutzer hat Befahrungen angelegt und kann nicht gelöscht werden. Sperre den Zugang stattdessen.', 409);
    }

    $db->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);
    Response::json(['ok' => true]);
}

Response::error('Method not allowed', 405);

// ── Helpers ───────────────────────────────────────────────

function findUser(PDO $db, int $id): array
{
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) Response::notFound('Nutzer nicht gefunden.');
    return $row;
}

/** Zahl der aktiven Admins, optional ohne einen bestimmten Nutzer. */
function countActiveAdmins(PDO $db, ?int $exceptId = null): int
{
    $sql    = "SELECT COUNT(*) FROM users WHERE role = 'admin'";
    $params = [];
    if (Schema::has('users', 'is_active')) $sql .= ' AND is_active = 1';
    if ($exceptId !== null) { $sql .= ' AND id <> ?'; $params[] = $exceptId; }
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return (int)$stmt->fetchColumn();
}

function uniqueHandle(PDO $db, string $name): string
{
    $base = preg_replace('/[^a-z0-9]/', '', strtolower(strtr($name, ['ä'=>'ae','ö'=>'oe','ü'=>'ue','ß'=>'ss'])));
    if ($base === '') $base = 'hoehlenfreund';
    $base = substr($base, 0, 24);

    $stmt = $db->prepare('SELECT id FROM users WHERE handle = ?');
    for ($i = 0; $i < 100; $i++) {
        $try = '@' . $base . ($i ? $i : '');
        $stmt->execute([$try]);
        if (!$stmt->fetch()) return $try;
    }
    return '@' . $base . bin2hex(random_bytes(3));
}

/** Nutzerzeile → API-Form: ohne Hash, mit abgeleitetem Status und Einladungslink. */
function publicUser(array $u): array
{
    $expires  = $u['invite_expires'] ?? null;
    $pending  = !empty($u['invite_token']) && (!$expires || strtotime((string)$expires) > time());
    $active   = !array_key_exists('is_active', $u) || (int)$u['is_active'] === 1;
    $neverIn  = empty($u['last_login']);

    if (!$active)                 $status = 'blocked';
    elseif ($pending && $neverIn) $status = 'invited';   // Einladung offen
    elseif ($pending)             $status = 'reset';     // Zurücksetzen offen
    else                          $status = 'active';

    return [
        'id'         => (int)$u['id'],
        'handle'     => $u['handle'],
        'name'       => $u['name'],
        'email'      => $u['email'],
        'role'       => $u['role'],
        'is_active'  => $active,
        'status'     => $status,
        'last_login' => $u['last_login'] ?? null,
        'created_at' => $u['created_at'] ?? null,
        'invite_url'     => $pending ? inviteUrl((string)$u['invite_token']) : null,
        'invite_expires' => $pending ? $expires : null,
    ];
}

/** Absoluter Einladungslink — funktioniert auch, wenn die App in einem Unterordner liegt. */
function inviteUrl(string $token): string
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
          || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
          || (($_SERVER['HTTP_X_FORWARDED_SSL']   ?? '') === 'on');
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

    // /unterordner/api/users → /unterordner/
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $pos  = strpos($path, '/api/');
    $base = $pos !== false ? substr($path, 0, $pos + 1) : '/';

    return ($https ? 'https' : 'http') . '://' . $host . $base . '?invite=' . $token;
}
