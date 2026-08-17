<?php
declare(strict_types=1);

class Auth
{
    private static ?array $user = null;

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => 0,
                'path'     => '/',
                'secure'   => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }
    }

    public static function user(): ?array
    {
        if (self::$user !== null) return self::$user;
        Auth::start();
        if (empty($_SESSION['user_id'])) return null;
        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $row = $stmt->fetch();
        if (!$row) return null;

        // Gesperrte Zugänge fliegen sofort aus der laufenden Sitzung.
        if (array_key_exists('is_active', $row) && (int)$row['is_active'] !== 1) {
            self::logout();
            return null;
        }

        // Datensparsamkeit: interne Felder verlassen den Server nicht.
        unset($row['password_hash'], $row['invite_token'], $row['invite_expires'], $row['invited_by']);
        if (!empty($row['prefs'])) {
            $row['prefs'] = json_decode((string)$row['prefs'], true);
        }
        return self::$user = $row;
    }

    public static function require(): array
    {
        $u = self::user();
        if (!$u) {
            http_response_code(401);
            echo json_encode(['error' => 'Nicht angemeldet']);
            exit;
        }
        return $u;
    }

    public static function requireAdmin(): array
    {
        $u = self::require();
        if ($u['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        return $u;
    }

    public static function login(string $email, string $password): bool
    {
        Auth::start();
        $db = Database::get();
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        if (!$row || !password_verify($password, $row['password_hash'])) return false;
        if (array_key_exists('is_active', $row) && (int)$row['is_active'] !== 1) return false;
        self::establish($db, (int)$row['id']);
        return true;
    }

    /**
     * Anmeldung ohne Passwortprüfung — ausschließlich nach dem Einlösen eines
     * Einladungs-Tokens (siehe api/invite.php). Der Aufrufer hat den Token
     * bereits verifiziert.
     */
    public static function loginAs(int $userId): void
    {
        Auth::start();
        self::establish(Database::get(), $userId);
    }

    private static function establish(PDO $db, int $userId): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        unset($_SESSION['csrf']);   // frischer Token für die neue Sitzung
        $db->prepare('UPDATE users SET last_login = ? WHERE id = ?')->execute([date('Y-m-d H:i:s'), $userId]);
        self::$user = null;
    }

    public static function logout(): void
    {
        Auth::start();
        $_SESSION = [];
        session_destroy();
        self::$user = null;
    }

    public static function csrf(): string
    {
        Auth::start();
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf'];
    }

    public static function verifyCsrf(): void
    {
        Auth::start();
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf_token'] ?? '');
        if (!hash_equals($_SESSION['csrf'] ?? '', $token)) {
            http_response_code(403);
            echo json_encode(['error' => 'CSRF-Token ungültig']);
            exit;
        }
    }
}
