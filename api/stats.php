<?php
require_once __DIR__ . '/bootstrap.php';

Auth::require();
$db = Database::get();

// Aggregierte KPIs
$kpi = $db->query("
    SELECT
        COUNT(*)                              AS total_trips,
        COUNT(DISTINCT cave_id)               AS total_caves,
        COALESCE(SUM(depth_m), 0)             AS total_depth,
        COALESCE(SUM(length_m), 0)            AS total_length,
        COALESCE(SUM(duration_min), 0)        AS total_minutes,
        COALESCE(MAX(depth_m), 0)             AS max_depth,
        MIN(date)                             AS first_trip,
        MAX(date)                             AS last_trip
    FROM trips
")->fetch();

// Letzte 12 Monate
$monthly = $db->query("
    SELECT DATE_FORMAT(date, '%Y-%m') AS month,
           COUNT(*)                   AS trips,
           COALESCE(SUM(duration_min)/60, 0) AS hours,
           COALESCE(SUM(depth_m), 0)  AS depth
    FROM trips
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY month
    ORDER BY month ASC
")->fetchAll();

// Typen-Verteilung
$types = $db->query("
    SELECT type, COUNT(*) AS count
    FROM trips WHERE type IS NOT NULL
    GROUP BY type ORDER BY count DESC
")->fetchAll();

// Top-5 Höhlen
$topCaves = $db->query("
    SELECT c.id, c.name, c.region, COUNT(t.id) AS visits
    FROM caves c
    JOIN trips t ON t.cave_id = c.id
    GROUP BY c.id ORDER BY visits DESC LIMIT 5
")->fetchAll();

// Jahres-Heatmap (letzte 365 Tage)
$heatmap = $db->query("
    SELECT date, COUNT(*) AS count
    FROM trips
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
    GROUP BY date
")->fetchAll();

Response::json([
    'kpi'      => $kpi,
    'monthly'  => $monthly,
    'types'    => $types,
    'topCaves' => $topCaves,
    'heatmap'  => $heatmap,
]);
