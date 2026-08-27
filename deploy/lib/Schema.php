<?php
declare(strict_types=1);

/**
 * Schema — Soll/Ist-Abgleich der Datenbank.
 *
 * Zweck: Die App läuft live auf MySQL, lokal auf SQLite. Neue Spalten werden
 * hier zentral als Soll definiert und können über das Admin-Panel nachgezogen
 * werden — ohne phpMyAdmin, ohne FTP.
 *
 * Wichtig: Alle lesenden Stellen dürfen sich NICHT darauf verlassen, dass die
 * Migration bereits gelaufen ist. Deshalb `Schema::has()` benutzen, bevor eine
 * neue Spalte in einem Query auftaucht.
 */
class Schema
{
    /** Soll-Zustand: Spalten, die nach dem Ur-Schema dazugekommen sind. */
    private const REQUIRED = [
        'caves' => [
            'cover_path' => [
                'mysql'  => "VARCHAR(500) NULL COMMENT 'Höhlen-Titelbild (groß)'",
                'sqlite' => 'TEXT',
                'after'  => 'notes',
                'label'  => 'Höhlen-Titelbild (Pfad)',
            ],
            'cover_thumb' => [
                'mysql'  => "VARCHAR(500) NULL COMMENT 'Höhlen-Titelbild (Thumbnail)'",
                'sqlite' => 'TEXT',
                'after'  => 'cover_path',
                'label'  => 'Höhlen-Titelbild (Thumbnail)',
            ],
            // Woher die Daten dieser Höhle stammen. Wird bei fremden Quellen
            // sichtbar ausgewiesen — ohne diese Angabe lässt sich später nicht
            // mehr feststellen, was übernommen und was selbst erfasst wurde.
            'source' => [
                'mysql'  => "VARCHAR(120) NULL COMMENT 'Datenquelle, z. B. GrottoCenter'",
                'sqlite' => 'TEXT',
                'after'  => 'notes',
                'label'  => 'Datenquelle der Höhlendaten',
            ],
            'source_url' => [
                'mysql'  => "VARCHAR(500) NULL COMMENT 'Link zum Eintrag bei der Quelle'",
                'sqlite' => 'TEXT',
                'after'  => 'source',
                'label'  => 'Link zum Quelleintrag',
            ],
            'source_license' => [
                'mysql'  => "VARCHAR(120) NULL COMMENT 'Lizenz der übernommenen Daten'",
                'sqlite' => 'TEXT',
                'after'  => 'source_url',
                'label'  => 'Lizenz der Quelle',
            ],
        ],
        'photos' => [
            'full_path' => [
                'mysql'  => "VARCHAR(500) NULL COMMENT 'Vollbild-Variante (längste Kante 2048)'",
                'sqlite' => 'TEXT',
                'after'  => 'large_path',
                'label'  => 'Vollbild-Variante der Fotos',
            ],
        ],
        'users' => [
            'is_active' => [
                'mysql'  => 'TINYINT(1) NOT NULL DEFAULT 1',
                'sqlite' => 'INTEGER NOT NULL DEFAULT 1',
                'after'  => 'role',
                'label'  => 'Zugang aktiv/gesperrt',
            ],
            'invite_expires' => [
                'mysql'  => "DATETIME NULL COMMENT 'Ablauf des Einladungslinks'",
                'sqlite' => 'TEXT',
                'after'  => 'invite_token',
                'label'  => 'Ablauf des Einladungslinks',
            ],
        ],
    ];

    /**
     * Tabellen, die nach dem Ur-Schema dazugekommen sind. Werden angelegt,
     * falls sie fehlen — wie die Spalten oben über das Admin-Panel.
     */
    private const REQUIRED_TABLES = [
        'cave_plans' => [
            'label' => 'Pläne (Grundrisse, Schnitte, Kartenausschnitte)',
            'mysql' => "CREATE TABLE `cave_plans` (
                `id`         INT AUTO_INCREMENT PRIMARY KEY,
                `cave_id`    VARCHAR(64) NOT NULL,
                `title`      VARCHAR(180) NOT NULL,
                `kind`       VARCHAR(20) NOT NULL DEFAULT 'sonstiges',
                `path`       VARCHAR(500) NOT NULL,
                `thumb_path` VARCHAR(500) NULL COMMENT 'nur bei Bildern',
                `mime`       VARCHAR(60) NOT NULL,
                `bytes`      INT UNSIGNED NOT NULL DEFAULT 0,
                `width`      INT UNSIGNED NULL,
                `height`     INT UNSIGNED NULL,
                `sort_order` INT NOT NULL DEFAULT 0,
                `created_by` INT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`cave_id`) REFERENCES `caves`(`id`) ON DELETE CASCADE,
                INDEX (`cave_id`, `sort_order`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            'sqlite' => "CREATE TABLE cave_plans (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                cave_id    TEXT    NOT NULL REFERENCES caves(id) ON DELETE CASCADE,
                title      TEXT    NOT NULL,
                kind       TEXT    NOT NULL DEFAULT 'sonstiges',
                path       TEXT    NOT NULL,
                thumb_path TEXT,
                mime       TEXT    NOT NULL,
                bytes      INTEGER NOT NULL DEFAULT 0,
                width      INTEGER,
                height     INTEGER,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_by INTEGER,
                created_at TEXT    DEFAULT (datetime('now'))
            )",
        ],
    ];

    /** @var array<string, string[]> Tabellenname → Spaltennamen */
    private static array $cache = [];

    /** Spaltennamen einer Tabelle (leeres Array, wenn die Tabelle fehlt). */
    public static function columns(string $table): array
    {
        if (isset(self::$cache[$table])) return self::$cache[$table];

        $db = Database::get();
        $cols = [];
        try {
            if (Database::isSQLite()) {
                // Tabellenname kommt ausschließlich aus REQUIRED — kein Nutzer-Input.
                foreach ($db->query('PRAGMA table_info(' . self::quote($table) . ')') as $row) {
                    $cols[] = (string)$row['name'];
                }
            } else {
                foreach ($db->query('SHOW COLUMNS FROM ' . self::quote($table)) as $row) {
                    $cols[] = (string)$row['Field'];
                }
            }
        } catch (Throwable $e) {
            $cols = [];
        }

        return self::$cache[$table] = $cols;
    }

    public static function has(string $table, string $column): bool
    {
        return in_array($column, self::columns($table), true);
    }

    /** Gibt es die Tabelle? (Spaltenliste leer = nicht vorhanden) */
    public static function hasTable(string $table): bool
    {
        return self::columns($table) !== [];
    }

    /** Schneidet eine Wunschliste auf die tatsächlich vorhandenen Spalten zu. */
    public static function onlyExisting(string $table, array $columns): array
    {
        $have = self::columns($table);
        return array_values(array_filter($columns, static fn($c) => in_array($c, $have, true)));
    }

    /**
     * Was fehlt gegenüber dem Soll?
     * @return array<int, array{table:string, column:string, label:string}>
     */
    public static function missing(): array
    {
        $out = [];
        foreach (self::REQUIRED_TABLES as $table => $spec) {
            if (!self::hasTable($table)) {
                $out[] = ['table' => $table, 'column' => '(ganze Tabelle)', 'label' => $spec['label']];
            }
        }
        foreach (self::REQUIRED as $table => $columns) {
            if (!self::columns($table)) continue;   // Tabelle gibt es nicht → nichts zu tun
            foreach ($columns as $name => $spec) {
                if (!self::has($table, $name)) {
                    $out[] = ['table' => $table, 'column' => $name, 'label' => $spec['label']];
                }
            }
        }
        return $out;
    }

    /**
     * Fehlende Spalten anlegen.
     * @return array{applied: string[], failed: array<int, array{column:string, error:string}>}
     */
    public static function migrate(): array
    {
        $db      = Database::get();
        $sqlite  = Database::isSQLite();
        $applied = [];
        $failed  = [];

        // Tabellen vor Spalten — eine neue Spalte kann sich auf eine neue
        // Tabelle beziehen, umgekehrt nie.
        foreach (self::REQUIRED_TABLES as $table => $spec) {
            if (self::hasTable($table)) continue;
            try {
                $db->exec($sqlite ? $spec['sqlite'] : $spec['mysql']);
                $applied[] = $table . ' (Tabelle)';
                unset(self::$cache[$table]);
            } catch (Throwable $e) {
                $failed[] = ['column' => $table, 'error' => $e->getMessage()];
            }
        }

        foreach (self::REQUIRED as $table => $columns) {
            if (!self::columns($table)) continue;
            foreach ($columns as $name => $spec) {
                if (self::has($table, $name)) continue;

                $sql = 'ALTER TABLE ' . self::quote($table) . ' ADD COLUMN ' . self::quote($name)
                     . ' ' . ($sqlite ? $spec['sqlite'] : $spec['mysql']);
                // AFTER kennt nur MySQL; SQLite hängt neue Spalten immer hinten an.
                if (!$sqlite && !empty($spec['after']) && self::has($table, $spec['after'])) {
                    $sql .= ' AFTER ' . self::quote($spec['after']);
                }

                try {
                    $db->exec($sql);
                    $applied[] = "$table.$name";
                    unset(self::$cache[$table]);
                } catch (Throwable $e) {
                    $failed[] = ['column' => "$table.$name", 'error' => $e->getMessage()];
                }
            }
        }

        self::$cache = [];
        return ['applied' => $applied, 'failed' => $failed];
    }

    /** Bezeichner quoten — MySQL-Backticks bzw. SQLite-Doppelquotes. */
    private static function quote(string $ident): string
    {
        $clean = preg_replace('/[^A-Za-z0-9_]/', '', $ident) ?? '';
        return Database::isSQLite() ? '"' . $clean . '"' : '`' . $clean . '`';
    }
}
