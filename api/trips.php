<?php
require_once __DIR__ . '/bootstrap.php';

$user   = Auth::require();
$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$tripId = $parts[count($parts) - 1] !== 'trips' ? $parts[count($parts) - 1] : null;
$db     = Database::get();

// ── GET /api/trips ────────────────────────────────────────
if ($method === 'GET' && !$tripId) {
    $limit  = min((int)($_GET['limit'] ?? 20), 100);
    $offset = max((int)($_GET['offset'] ?? 0), 0);
    $caveId = $_GET['cave'] ?? null;

    $where = $caveId ? 'WHERE t.cave_id = ?' : '';
    $params = $caveId ? [$caveId] : [];

    $total = $db->prepare("SELECT COUNT(*) FROM trips t $where");
    $total->execute($params);
    $totalCount = (int)$total->fetchColumn();

    $sql = "
        SELECT t.*, c.name AS cave_name, c.region AS cave_region, c.country AS cave_country,
               (SELECT COUNT(*) FROM photos p WHERE p.trip_id = t.id) AS photo_count
        FROM trips t
        JOIN caves c ON c.id = t.cave_id
        $where
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT ? OFFSET ?
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute(array_merge($params, [$limit, $offset]));
    $trips = $stmt->fetchAll();

    foreach ($trips as &$t) {
        $t = enrichTrip($t, $db);
    }

    Response::paginated($trips, $totalCount, $limit, $offset);
}

// ── GET /api/trips/:id ───────────────────────────────────
if ($method === 'GET' && $tripId) {
    $stmt = $db->prepare("
        SELECT t.*, c.name AS cave_name, c.region AS cave_region, c.country AS cave_country, c.lat, c.lng
        FROM trips t JOIN caves c ON c.id = t.cave_id
        WHERE t.id = ?
    ");
    $stmt->execute([$tripId]);
    $trip = $stmt->fetch();
    if (!$trip) Response::notFound('Befahrung nicht gefunden');
    Response::json(enrichTrip($trip, $db));
}

// ── POST /api/trips ───────────────────────────────────────
if ($method === 'POST' && !$tripId) {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $b = getBody();

    $id = 't-' . date('Y-m-d') . '-' . slugify($b['cave_id'] ?? 'unbekannt') . '-' . substr(uniqid(), -4);

    $db->prepare("
        INSERT INTO trips (id, cave_id, title, date, start_time, end_time, duration_min,
            type, wet, rope, diff_t, diff_k, diff_p, rating, depth_m, length_m,
            weather, notes, hero_icon, is_public, created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ")->execute([
        $id,
        $b['cave_id'] ?? '', $b['title'] ?? '', $b['date'] ?? date('Y-m-d'),
        $b['start_time'] ?? null, $b['end_time'] ?? null,
        isset($b['start_time'], $b['end_time']) ? calcDuration($b['start_time'], $b['end_time']) : null,
        $b['type'] ?? null, $b['wet'] ?? null, $b['rope'] ?? null,
        $b['diff_t'] ?? null, $b['diff_k'] ?? null, $b['diff_p'] ?? null,
        $b['rating'] ?? null, $b['depth_m'] ?? null, $b['length_m'] ?? null,
        $b['weather'] ?? null, $b['notes'] ?? null,
        $b['hero_icon'] ?? 'tunnel', (int)($b['is_public'] ?? 0), $user['id'],
    ]);

    // Team / Gear / Hazards
    if (!empty($b['team'])) insertList($db, 'trip_team', $id, 'member_name', $b['team']);
    if (!empty($b['gear'])) insertList($db, 'trip_gear', $id, 'gear', $b['gear']);
    if (!empty($b['hazards'])) insertList($db, 'trip_hazards', $id, 'hazard', $b['hazards']);

    $stmt = $db->prepare('SELECT t.*, c.name AS cave_name, c.region AS cave_region FROM trips t JOIN caves c ON c.id = t.cave_id WHERE t.id = ?');
    $stmt->execute([$id]);
    Response::json(enrichTrip($stmt->fetch(), $db), 201);
}

// ── PATCH /api/trips/:id ──────────────────────────────────
if ($method === 'PATCH' && $tripId) {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $b = getBody();
    $allowed = ['title','date','start_time','end_time','type','wet','rope','diff_t','diff_k','diff_p','rating','depth_m','length_m','weather','notes','hero_icon','is_public'];
    $set = [];
    $vals = [];
    foreach ($allowed as $col) {
        if (array_key_exists($col, $b)) {
            $set[] = "$col = ?";
            $vals[] = $b[$col];
        }
    }
    if ($set) {
        $vals[] = $tripId;
        $db->prepare("UPDATE trips SET " . implode(', ', $set) . " WHERE id = ?")->execute($vals);
    }
    // Team / Gear / Hazards separat speichern (eigene Tabellen)
    if (isset($b['team']))    insertList($db, 'trip_team',    $tripId, 'member_name', $b['team']);
    if (isset($b['gear']))    insertList($db, 'trip_gear',    $tripId, 'gear',        $b['gear']);
    if (isset($b['hazards'])) insertList($db, 'trip_hazards', $tripId, 'hazard',      $b['hazards']);

    $stmt = $db->prepare('SELECT t.*, c.name AS cave_name FROM trips t JOIN caves c ON c.id = t.cave_id WHERE t.id = ?');
    $stmt->execute([$tripId]);
    Response::json(enrichTrip($stmt->fetch(), $db));
}

// ── DELETE /api/trips/:id ─────────────────────────────────
if ($method === 'DELETE' && $tripId) {
    Auth::requireAdmin();
    Auth::verifyCsrf();
    $db->prepare('DELETE FROM trips WHERE id = ?')->execute([$tripId]);
    Response::json(['ok' => true]);
}

Response::error('Method not allowed', 405);

// ── Helpers ───────────────────────────────────────────────

function enrichTrip(array $t, PDO $db): array
{
    $t['difficulty'] = ['t' => (int)$t['diff_t'], 'k' => (int)$t['diff_k'], 'p' => (int)$t['diff_p']];
    $t['team']       = $db->prepare('SELECT member_name FROM trip_team WHERE trip_id = ?');
    $t['team']->execute([$t['id']]); $t['team'] = $t['team']->fetchAll(PDO::FETCH_COLUMN);
    $t['gear']       = $db->prepare('SELECT gear FROM trip_gear WHERE trip_id = ?');
    $t['gear']->execute([$t['id']]); $t['gear'] = $t['gear']->fetchAll(PDO::FETCH_COLUMN);
    $t['hazards']    = $db->prepare('SELECT hazard FROM trip_hazards WHERE trip_id = ?');
    $t['hazards']->execute([$t['id']]); $t['hazards'] = $t['hazards']->fetchAll(PDO::FETCH_COLUMN);
    $t['photos']     = (int)($t['photo_count'] ?? 0);
    // Erstes Foto als Cover-Thumbnail
    $p = $db->prepare('SELECT thumb_path, path FROM photos WHERE trip_id = ? ORDER BY sort_order, id LIMIT 1');
    $p->execute([$t['id']]);
    $photo = $p->fetch();
    $t['cover_photo'] = $photo ? ($photo['thumb_path'] ?? $photo['path']) : null;
    return $t;
}

function insertList(PDO $db, string $table, string $tripId, string $col, array $items): void
{
    $db->prepare("DELETE FROM $table WHERE trip_id = ?")->execute([$tripId]);
    $stmt = $db->prepare("INSERT IGNORE INTO $table (trip_id, $col) VALUES (?, ?)");
    foreach ($items as $v) $stmt->execute([$tripId, $v]);
}

function calcDuration(string $start, string $end): int
{
    [$sh, $sm] = explode(':', $start);
    [$eh, $em] = explode(':', $end);
    $mins = ($eh * 60 + $em) - ($sh * 60 + $sm);
    return $mins < 0 ? $mins + 1440 : $mins; // +24h wenn über Mitternacht
}
