<?php
require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM rewards ORDER BY pointsCost ASC");
            $rewards = $stmt->fetchAll();
            foreach ($rewards as &$r) {
                $r['pointsCost'] = (int)$r['pointsCost'];
            }
            echo json_encode(["success" => true, "data" => $rewards]);
            break;

        case 'POST':
            $data = getJsonInput();

            // Canjear recompensa por un usuario
            if (isset($data['action']) && $data['action'] === 'redeem') {
                $userId = $data['userId'];
                $rewardId = $data['rewardId'];

                $pdo->beginTransaction();
                $uStmt = $pdo->prepare("SELECT points FROM users WHERE id = :id");
                $uStmt->execute([':id' => $userId]);
                $user = $uStmt->fetch();

                $rStmt = $pdo->prepare("SELECT name, pointsCost FROM rewards WHERE id = :id");
                $rStmt->execute([':id' => $rewardId]);
                $reward = $rStmt->fetch();

                if (!$user || !$reward) {
                    throw new Exception("Usuario o recompensa no encontrados");
                }

                if ((int)$user['points'] < (int)$reward['pointsCost']) {
                    throw new Exception("Puntos insuficientes para este canje");
                }

                $cost = (int)$reward['pointsCost'];
                $deduct = $pdo->prepare("UPDATE users SET points = points - :cost WHERE id = :id");
                $deduct->execute([':cost' => $cost, ':id' => $userId]);

                $hist = $pdo->prepare("INSERT INTO user_point_history (user_id, date, description, points) VALUES (:uid, :date, :desc, :pts)");
                $hist->execute([
                    ':uid' => $userId,
                    ':date' => date('Y-m-d'),
                    ':desc' => 'Canje de Premio: ' . $reward['name'],
                    ':pts' => -$cost
                ]);

                $pdo->commit();
                echo json_encode(["success" => true, "message" => "Premio canjeado con éxito"]);
                break;
            }

            // Sincronización masiva de recompensas
            if (isset($data['rewards']) && is_array($data['rewards'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO rewards (id, name, category, pointsCost, description, image, linkedProductId)
                    VALUES (:id, :name, :category, :pointsCost, :description, :image, :linkedProductId)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        category = VALUES(category),
                        pointsCost = VALUES(pointsCost),
                        description = VALUES(description),
                        image = VALUES(image),
                        linkedProductId = VALUES(linkedProductId)
                ");

                $pdo->beginTransaction();
                foreach ($data['rewards'] as $r) {
                    $stmt->execute([
                        ':id' => $r['id'] ?? ('rew-' . uniqid()),
                        ':name' => $r['name'],
                        ':category' => $r['category'] ?? 'Productos',
                        ':pointsCost' => (int)$r['pointsCost'],
                        ':description' => $r['description'] ?? null,
                        ':image' => $r['image'] ?? null,
                        ':linkedProductId' => $r['linkedProductId'] ?? null
                    ]);
                }
                $pdo->commit();
                echo json_encode(["success" => true, "message" => "Recompensas sincronizadas"]);
                break;
            }

            // Crear recompensa individual
            $id = $data['id'] ?? ('rew-' . uniqid());
            $stmt = $pdo->prepare("
                INSERT INTO rewards (id, name, category, pointsCost, description, image, linkedProductId)
                VALUES (:id, :name, :category, :pointsCost, :description, :image, :linkedProductId)
            ");
            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':category' => $data['category'] ?? 'Productos',
                ':pointsCost' => (int)$data['pointsCost'],
                ':description' => $data['description'] ?? null,
                ':image' => $data['image'] ?? null,
                ':linkedProductId' => $data['linkedProductId'] ?? null
            ]);

            echo json_encode(["success" => true, "id" => $id, "message" => "Recompensa creada"]);
            break;

        case 'PUT':
            $data = getJsonInput();
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID requerido"]);
                exit();
            }

            $stmt = $pdo->prepare("
                UPDATE rewards SET
                    name = :name,
                    category = :category,
                    pointsCost = :pointsCost,
                    description = :description,
                    image = :image,
                    linkedProductId = :linkedProductId
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':category' => $data['category'] ?? 'Productos',
                ':pointsCost' => (int)$data['pointsCost'],
                ':description' => $data['description'] ?? null,
                ':image' => $data['image'] ?? null,
                ':linkedProductId' => $data['linkedProductId'] ?? null
            ]);

            echo json_encode(["success" => true, "message" => "Recompensa actualizada"]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID requerido"]);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM rewards WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(["success" => true, "message" => "Recompensa eliminada"]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "error" => "Método no permitido"]);
            break;
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
