-- CaveLog — ausstehende Schema-Änderungen für bestehende Installationen
--
-- NORMALFALL: Diese Datei wird NICHT gebraucht. Melde dich in der App als
-- Bearbeiter an → Verwaltung → System → „Datenbank aktualisieren". Das legt
-- die Spalten selbst an, für MySQL wie für SQLite.
--
-- Diese Datei ist nur der Notweg über phpMyAdmin (MySQL). Bereits vorhandene
-- Spalten quittiert MySQL mit „Duplicate column name" — dann ist an dieser
-- Stelle nichts zu tun; die übrigen Anweisungen trotzdem ausführen.

-- ── Höhlen-Titelbild ─────────────────────────────────────
ALTER TABLE `caves` ADD COLUMN `cover_path`  VARCHAR(500) NULL COMMENT 'Höhlen-Titelbild (groß)'      AFTER `notes`;
ALTER TABLE `caves` ADD COLUMN `cover_thumb` VARCHAR(500) NULL COMMENT 'Höhlen-Titelbild (Thumbnail)' AFTER `cover_path`;

-- ── Zuschauer-Zugänge: sperren und Einladungen ───────────
ALTER TABLE `users` ADD COLUMN `is_active`      TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Zugang aktiv (0 = gesperrt)' AFTER `role`;
ALTER TABLE `users` ADD COLUMN `invite_expires` DATETIME NULL COMMENT 'Ablauf des Einladungslinks'                  AFTER `invite_token`;

-- ── Vollbild-Fassung der Fotos ───────────────────────────
-- Nach dieser Änderung in der App unter Verwaltung → System
-- „Fotos nachbearbeiten" ausführen; erst das erzeugt die Dateien.
ALTER TABLE `photos` ADD COLUMN `full_path` VARCHAR(500) NULL COMMENT 'Vollbild, längste Kante 2048px' AFTER `large_path`;
