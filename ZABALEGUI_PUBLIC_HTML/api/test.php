<?php
require_once 'config.php';

try {
    $pdo = getDBConnection();
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM products");
    $prodCount = $stmt->fetch()['total'];

    $userStmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $userCount = $userStmt->fetch()['total'];

    echo json_encode([
        "success" => true,
        "connected" => true,
        "message" => "Conexion 100% exitosa a MySQL en Hostinger",
        "database" => DB_NAME,
        "user" => DB_USER,
        "products_count" => (int)$prodCount,
        "users_count" => (int)$userCount
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "connected" => false,
        "error" => "Error al conectar a MySQL: " . $e->getMessage(),
        "hint" => "Revisa la contrasena en api/config.php"
    ]);
}
