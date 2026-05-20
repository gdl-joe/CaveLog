<?php
require_once __DIR__ . '/bootstrap.php';

Auth::requireAdmin();
Auth::verifyCsrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') Response::error('Method not allowed', 405);

$tripId = $_POST['trip_id'] ?? '';
if (!$tripId) Response::error('trip_id fehlt');

$cfg = require __DIR__ . '/../config/config.php';
$uploadDir = $cfg['upload_dir'] . '/trips/' . preg_replace('/[^a-z0-9\-]/', '', $tripId) . '/';

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

// Thumbnails erstellen (GD)
$thumbPath = $uploadDir . 'thumb_' . $name;
$largePath = $uploadDir . 'large_' . $name;
$created = [];

if (extension_loaded('gd')) {
    $src = match($mime) {
        'image/jpeg' => @imagecreatefromjpeg($dest),
        'image/png'  => @imagecreatefrompng($dest),
        default      => false,
    };
    if ($src) {
        [$w, $h] = [imagesx($src), imagesy($src)];
        $created['thumb'] = makeThumb($src, $w, $h, 400, $thumbPath);
        $created['large'] = makeThumb($src, $w, $h, 1200, $largePath);
        imagedestroy($src);
    }
}

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
$relPath = '/uploads/trips/' . basename(dirname($dest)) . '/' . $name;
$db->prepare("
    INSERT INTO photos (trip_id, path, thumb_path, large_path, gps_lat, gps_lng, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order),0)+1 FROM photos p2 WHERE p2.trip_id = ?))
")->execute([
    $tripId, $relPath,
    $created['thumb'] ? str_replace($uploadDir, dirname($relPath).'/', $thumbPath) : null,
    $created['large'] ? str_replace($uploadDir, dirname($relPath).'/', $largePath) : null,
    $gps['lat'] ?? null, $gps['lng'] ?? null, $tripId,
]);

Response::json(['url' => $relPath, 'gps' => $gps], 201);

function makeThumb($src, int $w, int $h, int $maxSize, string $dest): bool
{
    if ($w <= $maxSize && $h <= $maxSize) return false;
    $ratio = min($maxSize / $w, $maxSize / $h);
    $nw = (int)($w * $ratio);
    $nh = (int)($h * $ratio);
    $thumb = imagecreatetruecolor($nw, $nh);
    imagecopyresampled($thumb, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
    imagejpeg($thumb, $dest, 88);
    imagedestroy($thumb);
    return true;
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
