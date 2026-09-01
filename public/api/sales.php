<?php
require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM sales ORDER BY date DESC");
            $sales = $stmt->fetchAll();

            $itemStmt = $pdo->prepare("SELECT product_id as id, name, quantity, price, isSpaceRental FROM sale_items WHERE sale_id = :sale_id");

            foreach ($sales as &$s) {
                $s['subtotal'] = (float)$s['subtotal'];
                $s['discount'] = (float)$s['discount'];
                $s['total'] = (float)$s['total'];
                $s['cashReceived'] = (float)$s['cashReceived'];
                $s['change'] = (float)$s['change'];
                $s['pointsEarned'] = (int)$s['pointsEarned'];
                $s['pointsUsed'] = (int)$s['pointsUsed'];

                $itemStmt->execute([':sale_id' => $s['id']]);
                $items = $itemStmt->fetchAll();
                foreach ($items as &$it) {
                    $it['quantity'] = (int)$it['quantity'];
                    $it['price'] = (float)$it['price'];
                    $it['isSpaceRental'] = (bool)$it['isSpaceRental'];
                }
                $s['items'] = $items;
            }

            echo json_encode(["success" => true, "data" => $sales]);
            break;

        case 'POST':
            $data = getJsonInput();

            // Sincronización masiva de ventas
            if (isset($data['sales']) && is_array($data['sales'])) {
                $saleInsert = $pdo->prepare("
                    INSERT INTO sales (id, date, cashierId, cashierName, customerId, customerName, subtotal, discount, total, paymentMethod, cashReceived, `change`, pointsEarned, pointsUsed, shiftId)
                    VALUES (:id, :date, :cashierId, :cashierName, :customerId, :customerName, :subtotal, :discount, :total, :paymentMethod, :cashReceived, :change, :pointsEarned, :pointsUsed, :shiftId)
                    ON DUPLICATE KEY UPDATE customerId = VALUES(customerId), customerName = VALUES(customerName), pointsEarned = VALUES(pointsEarned)
                ");
                $itemInsert = $pdo->prepare("
                    INSERT INTO sale_items (sale_id, product_id, name, quantity, price, isSpaceRental)
                    VALUES (:sale_id, :product_id, :name, :quantity, :price, :isSpaceRental)
                ");

                $pdo->beginTransaction();
                foreach ($data['sales'] as $s) {
                    $saleInsert->execute([
                        ':id' => $s['id'],
                        ':date' => $s['date'] ?? date('Y-m-d H:i:s'),
                        ':cashierId' => $s['cashierId'] ?? 'u-1',
                        ':cashierName' => $s['cashierName'] ?? 'Cajero',
                        ':customerId' => $s['customerId'] ?? null,
                        ':customerName' => $s['customerName'] ?? 'Público General',
                        ':subtotal' => $s['subtotal'] ?? $s['total'],
                        ':discount' => $s['discount'] ?? 0,
                        ':total' => $s['total'],
                        ':paymentMethod' => $s['paymentMethod'] ?? 'Efectivo',
                        ':cashReceived' => $s['cashReceived'] ?? $s['total'],
                        ':change' => $s['change'] ?? 0,
                        ':pointsEarned' => $s['pointsEarned'] ?? 0,
                        ':pointsUsed' => $s['pointsUsed'] ?? 0,
                        ':shiftId' => $s['shiftId'] ?? null
                    ]);

                    if (!empty($s['items'])) {
                        $del = $pdo->prepare("DELETE FROM sale_items WHERE sale_id = :sid");
                        $del->execute([':sid' => $s['id']]);

                        foreach ($s['items'] as $item) {
                            $itemInsert->execute([
                                ':sale_id' => $s['id'],
                                ':product_id' => $item['id'] ?? 'unknown',
                                ':name' => $item['name'] ?? 'Producto',
                                ':quantity' => $item['quantity'] ?? 1,
                                ':price' => $item['price'] ?? 0,
                                ':isSpaceRental' => !empty($item['isSpaceRental']) ? 1 : 0
                            ]);
                        }
                    }
                }
                $pdo->commit();
                echo json_encode(["success" => true, "message" => "Ventas sincronizadas"]);
                break;
            }

            // Venta individual en vivo desde POS
            $saleId = $data['id'] ?? ('sale-' . round(microtime(true) * 1000));
            $date = $data['date'] ?? date('Y-m-d H:i:s');
            $pointsEarned = (int)($data['pointsEarned'] ?? round(($data['total'] ?? 0) * 10));

            $pdo->beginTransaction();

            // 1. Insertar venta
            $stmt = $pdo->prepare("
                INSERT INTO sales (id, date, cashierId, cashierName, customerId, customerName, subtotal, discount, total, paymentMethod, cashReceived, `change`, pointsEarned, pointsUsed, shiftId)
                VALUES (:id, :date, :cashierId, :cashierName, :customerId, :customerName, :subtotal, :discount, :total, :paymentMethod, :cashReceived, :change, :pointsEarned, :pointsUsed, :shiftId)
            ");
            $stmt->execute([
                ':id' => $saleId,
                ':date' => $date,
                ':cashierId' => $data['cashierId'] ?? 'u-1',
                ':cashierName' => $data['cashierName'] ?? 'Cajero',
                ':customerId' => $data['customerId'] ?? null,
                ':customerName' => $data['customerName'] ?? 'Público General',
                ':subtotal' => $data['subtotal'] ?? $data['total'],
                ':discount' => $data['discount'] ?? 0,
                ':total' => $data['total'],
                ':paymentMethod' => $data['paymentMethod'] ?? 'Efectivo',
                ':cashReceived' => $data['cashReceived'] ?? $data['total'],
                ':change' => $data['change'] ?? 0,
                ':pointsEarned' => $pointsEarned,
                ':pointsUsed' => (int)($data['pointsUsed'] ?? 0),
                ':shiftId' => $data['shiftId'] ?? null
            ]);

            // 2. Insertar items y descontar stock
            $itemStmt = $pdo->prepare("
                INSERT INTO sale_items (sale_id, product_id, name, quantity, price, isSpaceRental)
                VALUES (:sale_id, :product_id, :name, :quantity, :price, :isSpaceRental)
            ");
            $stockStmt = $pdo->prepare("UPDATE products SET stock = GREATEST(0, stock - :qty) WHERE id = :id");

            if (!empty($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $itemStmt->execute([
                        ':sale_id' => $saleId,
                        ':product_id' => $item['id'],
                        ':name' => $item['name'],
                        ':quantity' => (int)$item['quantity'],
                        ':price' => (float)$item['price'],
                        ':isSpaceRental' => !empty($item['isSpaceRental']) ? 1 : 0
                    ]);

                    $stockStmt->execute([
                        ':qty' => (int)$item['quantity'],
                        ':id' => $item['id']
                    ]);
                }
            }

            // 3. Si hay cliente asociado, sumar puntos e insertar historial
            if (!empty($data['customerId']) && $pointsEarned > 0) {
                $userPts = $pdo->prepare("UPDATE users SET points = points + :pts WHERE id = :uid");
                $userPts->execute([':pts' => $pointsEarned, ':uid' => $data['customerId']]);

                $hist = $pdo->prepare("INSERT INTO user_point_history (user_id, date, description, points) VALUES (:uid, :date, :desc, :pts)");
                $hist->execute([
                    ':uid' => $data['customerId'],
                    ':date' => substr($date, 0, 10),
                    ':desc' => 'Compra Folio #' . strtoupper(substr($saleId, -8)),
                    ':pts' => $pointsEarned
                ]);
            }

            $pdo->commit();

            echo json_encode([
                "success" => true,
                "id" => $saleId,
                "pointsEarned" => $pointsEarned,
                "message" => "Venta procesada exitosamente"
            ]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID requerido para cancelar venta"]);
                exit();
            }

            $pdo->beginTransaction();
            // Restaurar stock
            $items = $pdo->prepare("SELECT product_id, quantity FROM sale_items WHERE sale_id = :sid");
            $items->execute([':sid' => $id]);
            $restoreStock = $pdo->prepare("UPDATE products SET stock = stock + :qty WHERE id = :pid");
            while ($row = $items->fetch()) {
                $restoreStock->execute([':qty' => $row['quantity'], ':pid' => $row['product_id']]);
            }

            // Eliminar venta
            $stmt = $pdo->prepare("DELETE FROM sales WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $pdo->commit();

            echo json_encode(["success" => true, "message" => "Venta cancelada y stock restaurado"]);
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
