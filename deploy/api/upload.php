<?php
require_once __DIR__ . '/bootstrap.php';

Auth::requireAdmin();
Auth::verifyCsrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') Response::error('Method not allowed', 405);

$tripId = $_POST['trip_id'] ?? '';
$caveId = $_POST['cave_id'] ?? '';
if (!$tripId && !$caveId) Response::error('trip_id oder cave_id fehlt');

$cfg = require __DIR__ . '/../config/config.php';
$isCave = $caveId !== '';                                   // Höhlen-Titelbild statt Befahrungsfoto
$safeId = preg_replace('/[^a-z0-9\-]/', '', $isCave ? $caveId : $tripId);
$uploadDir = $cfg['upload_dir'] . '/' . ($isCave ? 'caves' : 'trips') . '/' . $safeId . '/';

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    Response::error('Upload-Verzeichnis konnte nicht erstellt werden', 500);
}

$file = $_FILES['photo'] ?? null;
if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
    Response::error('Datei-Upload fehlgeschlagen');
}

// Typ prüfen
$allowedMime = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
if (!in_array($mime, $allowedMime, true)) {
    Response::error('Nur JPEG, PNG und HEIC erlaubt');
}

// Größe prüfen
$maxBytes = $cfg['max_upload_mb'] * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    Response::error("Maximale Dateigröße: {$cfg['max_upload_mb']} MB");
}

// Dateiname sicher machen
$ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$ext  = $ext === 'jpg' ? 'jpg' : ($ext === 'png' ? 'png' : 'jpg');
$name = bin2hex(random_bytes(8)) . '.' . $ext;
$dest = $uploadDir . $name;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    Response::error('Speichern fehlgeschlagen', 500);
}

// Ableitungen erstellen (thumb/large/full) — siehe lib/Images.php
$derived = Images::derive($dest);
$created = $derived['created'] ?? [];
$dimW    = $derived['width']   ?? null;
$dimH    = $derived['height']  ?? null;

// EXIF-GPS auslesen
$gps = null;
if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
    $exif = @exif_read_data($dest);
    if ($exif && isset($exif['GPSLatitude'])) {
        $gps = [
            'lat' => exifToDecimal($exif['GPSLatitude'], $exif['GPSLatitudeRef'] ?? 'N'),
            'lng' => exifToDecimal($exif['GPSLongitude'], $exif['GPSLongitudeRef'] ?? 'E'),
        ];
    }
}

// DB-Eintrag
$db = Database::get();
$relBase  = '/uploads/' . ($isCave ? 'caves' : 'trips') . '/' . $safeId;
$relPath  = $relBase . '/' . $name;
$thumbRel = !empty($created['thumb']) ? $relBase . '/thumb_' . $name : null;
$largeRel = !empty($created['large']) ? $relBase . '/large_' . $name : null;
$fullRel  = !empty($created['full'])  ? $relBase . '/full_'  . $name : null;

if ($isCave) {
    // Höhlen-Titelbild speichern — braucht die Spalten aus der Migration.
    if (!Schema::has('caves', 'cover_path') || !Schema::has('caves', 'cover_thumb')) {
        Response::error('Die Datenbank ist noch nicht auf dem neuesten Stand. Bitte im Admin-Bereich unter „System" die Datenbank aktualisieren.', 409);
    }
    // Das Titelbild wird groß dargestellt → beste verfügbare Ableitung.
    $coverRel = $fullRel ?? $largeRel ?? $relPath;
    $db->prepare("UPDATE caves SET cover_path = ?, cover_thumb = ? WHERE id = ?")
       ->execute([$coverRel, $thumbRel ?? $relPath, $caveId]);
    Response::json(['url' => $coverRel, 'thumb' => $thumbRel ?? $relPath], 201);
} else {
    // full_path und die Maße gibt es erst nach der Migration — tolerant bleiben.
    $cols = ['trip_id', 'path', 'thumb_path', 'large_path', 'gps_lat', 'gps_lng'];
    $vals = [$tripId, $relPath, $thumbRel, $largeRel, $gps['lat'] ?? null, $gps['lng'] ?? null];

    if (Schema::has('photos', 'full_path')) { $cols[] = 'full_path'; $vals[] = $fullRel; }
    if ($dimW && Schema::has('photos', 'width'))  { $cols[] = 'width';  $vals[] = $dimW; }
    if ($dimH && Schema::has('photos', 'height')) { $cols[] = 'height'; $vals[] = $dimH; }

    $list         = implode(', ', $cols);
    $placeholders = rtrim(str_repeat('?, ', count($cols)), ', ');
    $vals[] = $tripId;   // für die sort_order-Unterabfrage

    $db->prepare("
        INSERT INTO photos ($list, sort_order)
        VALUES ($placeholders, (SELECT COALESCE(MAX(sort_order),0)+1 FROM photos p2 WHERE p2.trip_id = ?))
    ")->execute($vals);

    Response::json(['url' => $relPath, 'gps' => $gps, 'width' => $dimW, 'height' => $dimH], 201);
}

function exifToDecimal(array $coord, string $hemi): float
{
    $d = eval_fraction($coord[0]);
    $m = eval_fraction($coord[1]) / 60;
    $s = eval_fraction($coord[2]) / 3600;
    $val = $d + $m + $s;
    return ($hemi === 'S' || $hemi === 'W') ? -$val : $val;
}

function eval_fraction(string $f): float
{
    [$n, $d] = array_pad(explode('/', $f), 2, 1);
    return $d == 0 ? 0.0 : (float)$n / (float)$d;
}
