<?php
/**
 * Admin-Benutzer anlegen / Passwort setzen
 *
 * EINMALIG ausführen, danach LÖSCHEN oder aus Web-Root entfernen.
 *
 * Aufruf im Browser:
 *   http://localhost/CaveLog/setup/create-admin.php
 *   (Herd) oder direkt per CLI: php setup/create-admin.php
 *
 * Oder per CLI:
 *   cd /Users/Jochen/Sites/localhost/CaveLog
 *   php setup/create-admin.php
 */

// Zugangsdaten für den ersten Admin — VOR dem Ausführen anpassen!
const ADMIN_NAME   = 'Marco Kellner';
const ADMIN_HANDLE = 'marco';
const ADMIN_EMAIL  = 'marco@example.com';   // ← deine E-Mail
const ADMIN_PASS   = 'HIER_SICHERES_PASSWORT_EINSETZEN'; // ← ändern!

// ─────────────────────────────────────────────────────────

$cli = (php_sapi_name() === 'cli');

if (!$cli) {
    header('Content-Type: text/plain; charset=utf-8');
    // Einfacher IP-Guard — nur lokal
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if (!in_array($ip, ['127.0.0.1', '::1'], true)) {
        http_response_code(403);
        die("Nur lokal erreichbar.\n");
    }
}

if (ADMIN_PASS === 'HIER_SICHERES_PASSWORT_EINSETZEN') {
    die("FEHLER: Bitte zuerst das Passwort in create-admin.php anpassen!\n");
}

if (strlen(ADMIN_PASS) < 10) {
    die("FEHLER: Passwort muss mindestens 10 Zeichen haben.\n");
}

require_once __DIR__ . '/../lib/Database.php';
$cfg = require __DIR__ . '/../config/config.php';

echo "CaveLog — Admin anlegen\n";
echo "───────────────────────\n";

try {
    $db   = Database::get();
    $hash = password_hash(ADMIN_PASS, PASSWORD_BCRYPT, ['cost' => 12]);

    // Prüfen ob E-Mail schon existiert
    $existing = $db->prepare('SELECT id FROM users WHERE email = ? OR handle = ?');
    $existing->execute([ADMIN_EMAIL, ADMIN_HANDLE]);
    $row = $existing->fetch();

    if ($row) {
        // Update
        $db->prepare('UPDATE users SET name=?, password_hash=?, role="admin" WHERE id=?')
           ->execute([ADMIN_NAME, $hash, $row['id']]);
        echo "✓ Bestehender User aktualisiert (ID {$row['id']})\n";
    } else {
        // Neu anlegen
        $db->prepare("
            INSERT INTO users (handle, name, email, password_hash, role, prefs)
            VALUES (?, ?, ?, ?, 'admin', '{\"theme\":\"dark\",\"layout\":\"cards\",\"diffMode\":\"bars\"}')
        ")->execute([ADMIN_HANDLE, ADMIN_NAME, ADMIN_EMAIL, $hash]);
        echo "✓ Admin-User angelegt (ID " . $db->lastInsertId() . ")\n";
    }

    echo "\n";
    echo "Handle:  " . ADMIN_HANDLE . "\n";
    echo "E-Mail:  " . ADMIN_EMAIL . "\n";
    echo "Passwort: " . str_repeat('*', strlen(ADMIN_PASS)) . "\n";
    echo "\n";
    echo "⚠ Diese Datei jetzt LÖSCHEN oder aus dem Web-Root entfernen!\n";

} catch (PDOException $e) {
    echo "FEHLER: " . $e->getMessage() . "\n";
    echo "\nHinweis: DB-Verbindung prüfen (config/config.php) und\n";
    echo "schema.sql zuerst einspielen.\n";
}
