<?php
require_once __DIR__ . '/bootstrap.php';

Auth::requireAdmin();
$db     = Database::get();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT id, handle, name, email, role, last_login, created_at FROM users ORDER BY created_at ASC");
    Response::json($stmt->fetchAll());
}

Response::error('Method not allowed', 405);
