<?php
require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM suppliers ORDER BY name ASC");
            $suppliers = $stmt->fetchAll();
            echo json_encode(["success" => true, "data" => $suppliers]);
            break;

        case 'POST':
            $data = getJsonInput();

            if (isset($data['suppliers']) && is_array($data['suppliers'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO suppliers (id, name, phone, email, address, category, notes, image)
                    VALUES (:id, :name, :phone, :email, :address, :category, :notes, :image)
                    ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), email=VALUES(email), address=VALUES(address), category=VALUES(category), notes=VALUES(notes), image=VALUES(image)
                ");
                $pdo->beginTransaction();
                foreach ($data['suppliers'] as $s) {
                    $stmt->execute([
                        ':id' => $s['id'],
                        ':name' => $s['name'],
                        ':phone' => $s['phone'],
                        ':email' => $s['email'] ?? null,
                        ':address' => $s['address'] ?? null,
                        ':category' => $s['category'] ?? 'General',
                        ':notes' => $s['notes'] ?? null,
                        ':image' => $s['image'] ?? null
                    ]);
                }
                $pdo->commit();
                echo json_encode(["success" => true, "message" => "Proveedores sincronizados"]);
                break;
            }

            $id = $data['id'] ?? ('sup-' . round(microtime(true) * 1000));
            $stmt = $pdo->prepare("
                INSERT INTO suppliers (id, name, phone, email, address, category, notes, image)
                VALUES (:id, :name, :phone, :email, :address, :category, :notes, :image)
            ");
            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':phone' => $data['phone'],
                ':email' => $data['email'] ?? null,
                ':address' => $data['address'] ?? null,
                ':category' => $data['category'] ?? 'General',
                ':notes' => $data['notes'] ?? null,
                ':image' => $data['image'] ?? null
            ]);

            echo json_encode(["success" => true, "id" => $id, "message" => "Proveedor registrado"]);
            break;

        case 'PUT':
            $data = getJsonInput();
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID requerido"]);
                exit();
            }

            $stmt = $pdo->prepare("
                UPDATE suppliers SET
                    name = :name,
                    phone = :phone,
                    email = :email,
                    address = :address,
                    category = :category,
                    notes = :notes,
                    image = :image
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':phone' => $data['phone'],
                ':email' => $data['email'] ?? null,
                ':address' => $data['address'] ?? null,
                ':category' => $data['category'] ?? 'General',
                ':notes' => $data['notes'] ?? null,
                ':image' => $data['image'] ?? null
            ]);

            echo json_encode(["success" => true, "message" => "Proveedor actualizado"]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID requerido"]);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM suppliers WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(["success" => true, "message" => "Proveedor eliminado"]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "error" => "Método no permitido"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
