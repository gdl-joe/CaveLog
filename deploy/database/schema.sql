-- CaveLog Datenbank-Schema
-- MySQL 8.0+
-- Zeichensatz: utf8mb4, Collation: utf8mb4_unicode_ci

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Benutzer
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `handle`        VARCHAR(32) UNIQUE NOT NULL,
  `name`          VARCHAR(120) NOT NULL,
  `email`         VARCHAR(180) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role`          ENUM('admin','viewer') NOT NULL DEFAULT 'viewer',
  `prefs`         JSON COMMENT '{"theme":"dark","layout":"cards","diffMode":"bars"}',
  `invite_token`  VARCHAR(64) NULL COMMENT 'Magic-Link für Erstanmeldung',
  `invited_by`    INT NULL,
  `last_login`    DATETIME NULL,
  `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Höhlen
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `caves` (
  `id`             VARCHAR(64) PRIMARY KEY COMMENT 'URL-slug, z.B. falkensteiner-hoehle',
  `name`           VARCHAR(180) NOT NULL,
  `region`         VARCHAR(180),
  `country`        CHAR(2) COMMENT 'ISO 3166-1 alpha-2: DE/AT/CH/...',
  `lat`            DECIMAL(9,6) COMMENT 'Breitengrad, 5 Nachkommastellen',
  `lng`            DECIMAL(9,6) COMMENT 'Längengrad, 5 Nachkommastellen',
  `depth_m`        INT UNSIGNED COMMENT 'Maximale Tiefe in Metern',
  `length_m`       INT UNSIGNED COMMENT 'Gesamtlänge in Metern',
  `type`           ENUM('Horizontal','Vertikal','Mixed','Labyrinth'),
  `discovered_year` SMALLINT UNSIGNED,
  `notes`          TEXT,
  `created_by`     INT NOT NULL,
  `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  INDEX (`country`),
  INDEX (`lat`, `lng`),
  INDEX (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Befahrungen (Trips)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trips` (
  `id`            VARCHAR(64) PRIMARY KEY COMMENT 'z.B. t-2026-04-11-schwarzmoos',
  `cave_id`       VARCHAR(64) NOT NULL,
  `title`         VARCHAR(240) NOT NULL,
  `date`          DATE NOT NULL,
  `start_time`    TIME,
  `end_time`      TIME,
  `duration_min`  INT UNSIGNED COMMENT 'Berechnete Dauer in Minuten',
  `type`          ENUM('Horizontal','Vertikal','Mixed','Labyrinth'),
  `wet`           ENUM('Trocken','Teilweise','Nass'),
  `rope`          ENUM('Ohne','Mit Seil','SRT'),
  `diff_t`        TINYINT UNSIGNED COMMENT 'Technisch 1–5',
  `diff_k`        TINYINT UNSIGNED COMMENT 'Körperlich 1–5',
  `diff_p`        TINYINT UNSIGNED COMMENT 'Psychisch 1–5',
  `rating`        TINYINT UNSIGNED COMMENT 'Persönliche Bewertung 1–5',
  `depth_m`       INT UNSIGNED COMMENT 'Erreichte Tiefe',
  `length_m`      INT UNSIGNED COMMENT 'Zurückgelegte Strecke',
  `weather`       VARCHAR(240),
  `notes`         TEXT,
  `hero_icon`     ENUM('pit','tunnel','chamber','maze','ice') DEFAULT 'tunnel',
  `is_public`     TINYINT(1) NOT NULL DEFAULT 0,
  `created_by`    INT NOT NULL,
  `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`cave_id`) REFERENCES `caves`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  INDEX (`date`),
  INDEX (`cave_id`),
  INDEX (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Team-Mitglieder pro Befahrung
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trip_team` (
  `trip_id`        VARCHAR(64) NOT NULL,
  `member_name`    VARCHAR(120) NOT NULL,
  `member_user_id` INT NULL COMMENT 'NULL wenn externer Teilnehmer',
  PRIMARY KEY (`trip_id`, `member_name`),
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`member_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Ausrüstung pro Befahrung
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trip_gear` (
  `trip_id` VARCHAR(64) NOT NULL,
  `gear`    VARCHAR(120) NOT NULL,
  PRIMARY KEY (`trip_id`, `gear`),
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Gefahren pro Befahrung
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trip_hazards` (
  `trip_id` VARCHAR(64) NOT NULL,
  `hazard`  VARCHAR(240) NOT NULL,
  PRIMARY KEY (`trip_id`, `hazard`(191)),
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Fotos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `photos` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `trip_id`     VARCHAR(64) NOT NULL,
  `path`        VARCHAR(500) NOT NULL COMMENT 'Relativer Pfad: /uploads/trips/{id}/foto.jpg',
  `thumb_path`  VARCHAR(500) COMMENT 'Thumbnail 400px',
  `large_path`  VARCHAR(500) COMMENT 'Groß 1200px',
  `caption`     TEXT,
  `taken_at`    DATETIME COMMENT 'EXIF-Datum',
  `gps_lat`     DECIMAL(9,6),
  `gps_lng`     DECIMAL(9,6),
  `width`       INT UNSIGNED,
  `height`      INT UNSIGNED,
  `sort_order`  INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON DELETE CASCADE,
  INDEX (`trip_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Sessions (alternativ zu PHP-Sessions für API-Tokens)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
  `id`         VARCHAR(128) PRIMARY KEY,
  `user_id`    INT NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `ip`         VARCHAR(45),
  `user_agent` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX (`user_id`),
  INDEX (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Demo-Daten (optional, zum Entwickeln entfernen)
-- --------------------------------------------------------

-- Admin-User: marco / password = "cavelog2026" (bcrypt)
INSERT IGNORE INTO `users` (`handle`, `name`, `email`, `password_hash`, `role`, `prefs`) VALUES
('marco', 'Marco Kellner', 'marco@example.com',
 '$2y$12$ExampleHashHereChangeBeforeProduction1234567890ABCDEF',
 'admin',
 '{"theme":"dark","layout":"cards","diffMode":"bars"}');

-- Höhlen
INSERT IGNORE INTO `caves` (`id`, `name`, `region`, `country`, `lat`, `lng`, `depth_m`, `length_m`, `type`, `discovered_year`, `created_by`) VALUES
('hermannshoehle',   'Hermannshöhle',                   'Harz, Niedersachsen',          'DE', 51.734200, 10.562100,   45,   2100, 'Mixed',      1866, 1),
('rieseneishoehle',  'Rieseneishöhle',                  'Dachstein, Oberösterreich',     'AT', 47.512000, 13.694000,  407,   4500, 'Vertikal',   1910, 1),
('schwarzmoos',      'Schwarzmooskogel-Höhlensystem',   'Totes Gebirge, Steiermark',     'AT', 47.728000, 13.814000, 1291, 138000, 'Vertikal',   1982, 1),
('falkensteiner',    'Falkensteiner Höhle',             'Schwäbische Alb, BW',           'DE', 48.485000,  9.553000,   25,   4200, 'Horizontal', 1823, 1),
('barenhoehle',      'Bärenhöhle bei Sonnenbühl',       'Schwäbische Alb, BW',           'DE', 48.398000,  9.225000,   12,    271, 'Horizontal', 1834, 1),
('holloch',          'Hölloch',                         'Muotathal, Schwyz',             'CH', 46.983300,  8.850000,  939, 205000, 'Labyrinth',  1875, 1);

-- Befahrungen
INSERT IGNORE INTO `trips` (`id`, `cave_id`, `title`, `date`, `start_time`, `end_time`, `duration_min`, `type`, `wet`, `rope`, `diff_t`, `diff_k`, `diff_p`, `rating`, `depth_m`, `length_m`, `weather`, `notes`, `hero_icon`, `created_by`) VALUES
('t-2026-04-11', 'schwarzmoos',    'Schacht P38 bis -310m',              '2026-04-11', '08:30', '19:45', 675,  'Vertikal',   'Teilweise', 'SRT',      5, 4, 3, 5, 310,  820,  'Schneefall, -4°C Eingang',  'Abstieg durch den Haupteinstieg. P38 war mit Wassereintrag, Stau am Knoten. Biwak auf -280m in der großen Halle.', 'pit',     1),
('t-2026-03-22', 'falkensteiner',  'Durchgang bis zum 2. Siphon',        '2026-03-22', '10:00', '15:30', 330,  'Horizontal', 'Nass',      'Ohne',     2, 3, 2, 4,  25, 1800,  'Trocken, 8°C',              'Vom Eingang bis zum 2. Siphon. Wasserstand ungewöhnlich niedrig.', 'tunnel',  1),
('t-2026-03-08', 'barenhoehle',    'Schauhöhlen-Rundgang + Forschungsteil','2026-03-08','13:15', '16:00', 165, 'Horizontal', 'Trocken',   'Ohne',     1, 1, 1, 3,  12,  340,  'Regen, 4°C',                'Entspannte Tour mit Gästen.', 'chamber', 1),
('t-2026-02-14', 'holloch',        'Silvretta-Galerie Biwak',            '2026-02-14', '07:00', '23:30', 990,  'Labyrinth',  'Teilweise', 'Mit Seil', 3, 5, 4, 5, 480, 6200,  'Klar, -8°C',                '16 Stunden Tour mit Biwak-Pause. CO2-Werte leicht erhöht.', 'maze',    1),
('t-2026-01-28', 'hermannshoehle', 'Winterbefahrung Nordteil',           '2026-01-28', '09:30', '14:15', 285,  'Mixed',      'Trocken',   'Mit Seil', 2, 2, 2, 4,  38, 1100,  'Schnee, -6°C',              'Eingangsbereich vereist. Innen angenehme 8°C.', 'ice',     1),
('t-2025-11-05', 'rieseneishoehle','Eisdom-Fotoexpedition',              '2025-11-05', '06:45', '17:20', 635,  'Vertikal',   'Trocken',   'SRT',      4, 4, 3, 5, 220,  950,  'Sonnig, -2°C',              'Fotosession für den neuen Bildband. Temperatur konstant -1°C.', 'ice',     1);
