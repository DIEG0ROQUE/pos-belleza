<?php
// ==========================================================
// CONFIGURACIÓN DE BASE DE DATOS MYSQL - HOSTINGER
// ==========================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de peticiones preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ----------------------------------------------------------
// Ajusta estos valores con los datos de tu base de datos en Hostinger:
// ----------------------------------------------------------
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_pos_belleza'); // Nombre de tu base de datos en Hostinger
define('DB_USER', 'u123456789_admin');       // Usuario de tu base de datos en Hostinger
define('DB_PASS', 'TuPasswordSegura123!');   // Contraseña de tu base de datos en Hostinger

function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "error" => "Error de conexión a la base de datos: " . $e->getMessage()
        ]);
        exit();
    }
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}
