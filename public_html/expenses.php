<?php
require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM expenses ORDER BY date DESC");
            $expenses = $stmt->fetchAll();
            foreach ($expenses as &$exp) {
                $exp['amount'] = (float)$exp['amount'];
            }
            echo json_encode(["success" => true, "data" => $expenses]);
            break;

        case 'POST':
            $data = getJsonInput();

            if (isset($data['expenses']) && is_array($data['expenses'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO expenses (id, date, category, description, amount, notes)
                    VALUES (:id, :date, :category, :description, :amount, :notes)
                    ON DUPLICATE KEY UPDATE category=VALUES(category), description=VALUES(description), amount=VALUES(amount), notes=VALUES(notes)
                ");
                $pdo->beginTransaction();
                foreach ($data['expenses'] as $e) {
                    $stmt->execute([
                        ':id' => $e['id'],
                        ':date' => $e['date'] ?? date('Y-m-d H:i:s'),
                        ':category' => $e['category'] ?? 'General',
                        ':description' => $e['description'] ?? '',
                        ':amount' => (float)($e['amount'] ?? 0),
                        ':notes' => $e['notes'] ?? ''
                    ]);
                }
                $pdo->commit();
                echo json_encode(["success" => true, "message" => "Gastos sincronizados"]);
                break;
            }

            $id = $data['id'] ?? ('exp-' . round(microtime(true) * 1000));
            $stmt = $pdo->prepare("
                INSERT INTO expenses (id, date, category, description, amount, notes)
                VALUES (:id, :date, :category, :description, :amount, :notes)
            ");
            $stmt->execute([
                ':id' => $id,
                ':date' => $data['date'] ?? date('Y-m-d H:i:s'),
                ':category' => $data['category'] ?? 'General',
                ':description' => $data['description'] ?? '',
                ':amount' => (float)($data['amount'] ?? 0),
                ':notes' => $data['notes'] ?? ''
            ]);

            echo json_encode(["success" => true, "id" => $id, "message" => "Gasto registrado"]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID requerido"]);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(["success" => true, "message" => "Gasto eliminado"]);
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
