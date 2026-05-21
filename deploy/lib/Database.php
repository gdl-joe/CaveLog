<?php
declare(strict_types=1);

class Database
{
    private static ?PDO $instance = null;

    public static function get(): PDO
    {
        if (self::$instance !== null) return self::$instance;

        $cfg = require __DIR__ . '/../config/config.php';

        if (($cfg['db_driver'] ?? 'sqlite') === 'sqlite') {
            $path = $cfg['sqlite_path'] ?? __DIR__ . '/../db/cavelog.db';
            $dir  = dirname($path);
            if (!is_dir($dir)) mkdir($dir, 0755, true);

            self::$instance = new PDO('sqlite:' . $path, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            self::$instance->exec('PRAGMA foreign_keys = ON');
            self::$instance->exec('PRAGMA journal_mode  = WAL');
        } else {
            $dsn = "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset=utf8mb4";
            self::$instance = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        }

        return self::$instance;
    }

    public static function driver(): string
    {
        $cfg = require __DIR__ . '/../config/config.php';
        return $cfg['db_driver'] ?? 'sqlite';
    }

    public static function isSQLite(): bool
    {
        return self::driver() === 'sqlite';
    }
}
