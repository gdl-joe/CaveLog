<?php
/**
 * CaveLog Setup — Einmaliger Browser-Assistent
 * Aufrufen: https://deine-domain.de/setup/init.php
 * Nach der Einrichtung diese Datei per FTP loeschen!
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');

$errors = [];
$done   = false;
$msg    = '';

$checks = [
    'PHP >= 8.0'        => version_compare(PHP_VERSION, '8.0.0', '>='),
    'PDO'               => extension_loaded('pdo'),
    'PDO SQLite'        => extension_loaded('pdo_sqlite'),
    'GD (fuer Fotos)'   => extension_loaded('gd'),
    'config.php lesbar' => file_exists(__DIR__ . '/../config/config.php'),
];
$ready = !in_array(false, $checks, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $ready) {
    $name  = trim($_POST['name']  ?? '');
    $email = trim($_POST['email'] ?? '');
    $pw    = $_POST['password']   ?? '';
    $pw2   = $_POST['password2']  ?? '';

    if (!$name)  $errors[] = 'Name darf nicht leer sein.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Ungueltige E-Mail-Adresse.';
    if (strlen($pw) < 10) $errors[] = 'Passwort muss mindestens 10 Zeichen haben.';
    if ($pw !== $pw2)     $errors[] = 'Passwoerter stimmen nicht ueberein.';

    if (empty($errors)) {
        try {
            $cfg  = require __DIR__ . '/../config/config.php';
            $path = $cfg['sqlite_path'] ?? __DIR__ . '/../db/cavelog.db';
            $dir  = dirname($path);
            if (!is_dir($dir)) mkdir($dir, 0755, true);

            $htFile = $dir . '/.htaccess';
            if (!file_exists($htFile)) file_put_contents($htFile, "Require all denied\n");

            $pdo = new PDO('sqlite:' . $path, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $pdo->exec('PRAGMA foreign_keys = ON');
            $pdo->exec('PRAGMA journal_mode  = WAL');

            $schema = file_get_contents(__DIR__ . '/../database/schema.sqlite.sql');
            foreach (array_filter(array_map('trim', explode(';', $schema))) as $sql) {
                if ($sql && $sql[0] !== '-') $pdo->exec($sql);
            }

            $hash   = password_hash($pw, PASSWORD_BCRYPT, ['cost' => 12]);
            $handle = '@' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
            $prefs  = '{"theme":"light","layout":"cards","diffMode":"bars"}';

            $existing = $pdo->prepare('SELECT id FROM users WHERE email = ?');
            $existing->execute([$email]);
            $row = $existing->fetch();

            if ($row) {
                $pdo->prepare("UPDATE users SET name=?,password_hash=?,role='admin',prefs=? WHERE id=?")
                    ->execute([$name, $hash, $prefs, $row['id']]);
                $msg = 'Bestehender Account aktualisiert.';
            } else {
                $pdo->prepare("INSERT INTO users (handle,name,email,password_hash,role,prefs) VALUES (?,?,?,?,'admin',?)")
                    ->execute([$handle, $name, $email, $hash, $prefs]);
                $msg = 'Admin-Account angelegt.';
            }
            $done = true;
        } catch (Throwable $e) {
            $errors[] = 'Fehler: ' . $e->getMessage();
        }
    }
}

$green = '#2f5d3d'; $orange = '#b85d3a'; $bg = '#f1f3ec'; $card = '#fafbf6'; $border = '#cdd3bf';
$text = '#1a2620'; $mute = '#5d6a5e';
?>
<!DOCTYPE html><html lang="de"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CaveLog Setup</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,Inter,sans-serif;background:<?=$bg?>;color:<?=$text?>;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{background:<?=$card?>;border:1px solid <?=$border?>;border-radius:14px;padding:32px 28px;max-width:480px;width:100%}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.logo-icon{width:48px;height:48px;background:#d4e1cc;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px}
.logo-text{font-size:22px;font-weight:700;letter-spacing:-0.5px}
.logo-text span{color:<?=$green?>}
h2{font-size:18px;font-weight:600;margin-bottom:8px}
p{font-size:13px;color:<?=$mute?>;line-height:1.5;margin-bottom:16px}
.cr{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid <?=$border?>;font-size:12px;color:<?=$mute?>}
.cr:last-child{border:none}
.badge{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.ok{background:#d4e1cc;color:<?=$green?>}.fail{background:#f1d9c8;color:<?=$orange?>}
label{display:block;font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;color:<?=$mute?>;margin-bottom:5px;margin-top:14px}
input{width:100%;padding:11px 13px;border:1px solid <?=$border?>;border-radius:8px;background:#fff;font-size:14px;color:<?=$text?>;outline:none;font-family:inherit}
input:focus{border-color:<?=$green?>}
.btn{margin-top:20px;width:100%;padding:13px;background:<?=$green?>;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}
.btn:hover{background:#1f4429}
.errs{background:#f1d9c8;border:1px solid #e0b090;border-radius:8px;padding:12px 14px;margin-top:14px}
.errs li{font-size:13px;color:<?=$orange?>;margin-left:16px}
.success{text-align:center;padding:16px 0}
.next{background:#d4e1cc22;border:1px solid <?=$border?>;border-radius:8px;padding:14px;margin-top:18px}
.next h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:<?=$mute?>;margin-bottom:10px}
.next li{font-size:13px;margin-left:16px;margin-bottom:5px;line-height:1.5}
.next strong{color:<?=$orange?>}
code{background:<?=$border?>44;padding:1px 5px;border-radius:3px;font-size:12px}
</style></head><body>
<div class="card">
<div class="logo"><div class="logo-icon">⛰️</div><div class="logo-text">Cave<span>Log</span> Setup</div></div>
<?php if($done): ?>
<div class="success"><div style="font-size:52px;margin-bottom:14px">✅</div>
<h2>Fertig!</h2><p><?=htmlspecialchars($msg)?><br>Du kannst dich jetzt einloggen.</p></div>
<div class="next"><h3>Jetzt noch wichtig</h3><ol>
<li><strong>Diese Datei sofort loeschen!</strong><br>Oeffne dein FTP-Programm und loesche <code>setup/init.php</code></li>
<li>Gehe zu deiner Domain und melde dich an</li>
<li>Viel Spass beim Dokumentieren &#x26F0;&#xFE0F;</li>
</ol></div>
<?php elseif(!$ready): ?>
<h2>System-Pruefung</h2><p>Folgende Voraussetzungen fehlen:</p>
<?php foreach($checks as $l=>$r): ?><div class="cr"><div class="badge <?=$r?'ok':'fail'?>"><?=$r?'✓':'✗'?></div><span><?=$l?></span></div><?php endforeach; ?>
<p style="margin-top:14px;color:<?=$orange?>">Bitte wende dich an deinen Hoster, um fehlende PHP-Erweiterungen zu aktivieren.</p>
<?php else: ?>
<h2>Admin-Account einrichten</h2>
<p>Gib deine Zugangsdaten ein. Die Datenbank wird automatisch angelegt — kein MySQL noetig.</p>
<?php foreach($checks as $l=>$r): ?><div class="cr"><div class="badge <?=$r?'ok':'fail'?>"><?=$r?'✓':'✗'?></div><span><?=$l?></span></div><?php endforeach; ?>
<?php if(!empty($errors)): ?><ul class="errs"><?php foreach($errors as $e): ?><li><?=htmlspecialchars($e)?></li><?php endforeach; ?></ul><?php endif; ?>
<form method="POST">
<label>Dein Name</label><input type="text" name="name" placeholder="z.B. Marco Kellner" value="<?=htmlspecialchars($_POST['name']??'')?>" required>
<label>E-Mail (wird zum Einloggen verwendet)</label><input type="email" name="email" placeholder="deine@email.de" value="<?=htmlspecialchars($_POST['email']??'')?>" required>
<label>Passwort (mind. 10 Zeichen)</label><input type="password" name="password" placeholder="Mindestens 10 Zeichen" required>
<label>Passwort bestaetigen</label><input type="password" name="password2" placeholder="Nochmals eingeben" required>
<button type="submit" class="btn">CaveLog einrichten &#x2192;</button>
</form>
<p style="margin-top:14px;font-size:11px;color:<?=$mute?>">Die Datenbank wird automatisch unter <code>db/cavelog.db</code> angelegt.</p>
<?php endif; ?>
</div></body></html>
