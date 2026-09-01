<?php
require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT id, name, phone, email, password, role, points, created_at FROM users ORDER BY name ASC");
            $users = $stmt->fetchAll();

            // Cargar historial de puntos para cada cliente
            $histStmt = $pdo->prepare("SELECT date, description, points FROM user_point_history WHERE user_id = :user_id ORDER BY id DESC");
            foreach ($users as &$u) {
                $u['points'] = (int)$u['points'];
                $histStmt->execute([':user_id' => $u['id']]);
                $u['pointHistory'] = $histStmt->fetchAll();
                foreach ($u['pointHistory'] as &$h) {
                    $h['points'] = (int)$h['points'];
                }
            }

            echo json_encode(["success" => true, "data" => $users]);
            break;

        case 'POST':
            $data = getJsonInput();

            // Sincronización masiva de usuarios
            if (isset($data['users']) && is_array($data['users'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO users (id, name, phone, email, password, role, points)
                    VALUES (:id, :name, :phone, :email, :password, :role, :points)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        email = VALUES(email),
                        password = VALUES(password),
                        role = VALUES(role),
                        points = VALUES(points)
                ");
                $histStmt = $pdo->prepare("INSERT INTO user_point_history (user_id, date, description, points) VALUES (:user_id, :date, :description, :points)");

                $pdo->beginTransaction();
                foreach ($data['users'] as $u) {
                    $stmt->execute([
                        ':id' => $u['id'] ?? ('u-' . uniqid()),
                        ':name' => $u['name'],
                        ':phone' => $u['phone'],
                        ':email' => $u['email'] ?? null,
                        ':password' => $u['password'] ?? '123456',
                        ':role' => $u['role'] ?? 'cliente',
                        ':points' => $u['points'] ?? 0
                    ]);

                    if (!empty($u['pointHistory']) && is_array($u['pointHistory'])) {
                        // Limpiar previos y reinsertar
                        $del = $pdo->prepare("DELETE FROM user_point_history WHERE user_id = :uid");
                        $del->execute([':uid' => $u['id']]);

                        foreach ($u['pointHistory'] as $h) {
                            $histStmt->execute([
                                ':user_id' => $u['id'],
                                ':date' => $h['date'] ?? date('Y-m-d'),
                                ':description' => $h['description'] ?? 'Movimiento de puntos',
                                ':points' => (int)($h['points'] ?? 0)
                            ]);
                        }
                    }
                }
                $pdo->commit();
                echo json_encode(["success" => true, "message" => "Usuarios sincronizados"]);
                break;
            }

            // Registro individual
            if (empty($data['phone']) || empty($data['name'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Nombre y teléfono son requeridos"]);
                exit();
            }

            $id = $data['id'] ?? ('u-' . uniqid());
            $initialPoints = isset($data['points']) ? (int)$data['points'] : ($data['role'] === 'cliente' ? 200 : 0);

            $stmt = $pdo->prepare("
                INSERT INTO users (id, name, phone, email, password, role, points)
                VALUES (:id, :name, :phone, :email, :password, :role, :points)
            ");
            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':phone' => $data['phone'],
                ':email' => $data['email'] ?? null,
                ':password' => $data['password'] ?? '123456',
                ':role' => $data['role'] ?? 'cliente',
                ':points' => $initialPoints
            ]);

            if ($initialPoints > 0) {
                $hist = $pdo->prepare("INSERT INTO user_point_history (user_id, date, description, points) VALUES (:uid, :date, :desc, :pts)");
                $hist->execute([
                    ':uid' => $id,
                    ':date' => date('Y-m-d'),
                    ':desc' => 'Bono de bienvenida Club VIP Zabalegui',
                    ':pts' => $initialPoints
                ]);
            }

            echo json_encode(["success" => true, "id" => $id, "message" => "Usuario registrado con éxito"]);
            break;

        case 'PUT':
            $data = getJsonInput();
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID de usuario requerido"]);
                exit();
            }

            // Ajuste manual de puntos
            if (isset($data['adjustPoints'])) {
                $pts = (int)$data['adjustPoints'];
                $desc = $data['description'] ?? 'Ajuste manual de puntos gerencial';

                $pdo->beginTransaction();
                $update = $pdo->prepare("UPDATE users SET points = GREATEST(0, points + :pts) WHERE id = :id");
                $update->execute([':pts' => $pts, ':id' => $data['id']]);

                $hist = $pdo->prepare("INSERT INTO user_point_history (user_id, date, description, points) VALUES (:uid, :date, :desc, :pts)");
                $hist->execute([
                    ':uid' => $data['id'],
                    ':date' => date('Y-m-d'),
                    ':desc' => $desc,
                    ':pts' => $pts
                ]);
                $pdo->commit();

                echo json_encode(["success" => true, "message" => "Puntos ajustados"]);
                break;
            }

            // Actualización de datos generales
            $stmt = $pdo->prepare("
                UPDATE users SET
                    name = :name,
                    phone = :phone,
                    email = :email,
                    password = :password,
                    role = :role,
                    points = :points
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':phone' => $data['phone'],
                ':email' => $data['email'] ?? null,
                ':password' => $data['password'],
                ':role' => $data['role'] ?? 'cliente',
                ':points' => (int)($data['points'] ?? 0)
            ]);

            echo json_encode(["success" => true, "message" => "Usuario actualizado"]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID requerido para eliminar"]);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(["success" => true, "message" => "Usuario eliminado"]);
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
