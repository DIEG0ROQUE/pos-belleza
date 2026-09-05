<?php
require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Intentar agregar la columna brand automáticamente si aún no existe
try {
    $pdo->exec("ALTER TABLE products ADD COLUMN brand VARCHAR(100) NULL DEFAULT ''");
} catch (Exception $e) {
    // Si ya existe la columna, ignora el error
}

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM products ORDER BY name ASC");
            $products = $stmt->fetchAll();
            
            // Formatear tipos
            foreach ($products as &$p) {
                $p['price'] = (float)$p['price'];
                $p['cost'] = (float)$p['cost'];
                $p['stock'] = (int)$p['stock'];
                $p['minStock'] = (int)$p['minStock'];
                $p['pointsReward'] = (int)$p['pointsReward'];
                $p['pointsCost'] = (int)$p['pointsCost'];
                $p['brand'] = (string)($p['brand'] ?? '');
                $p['isSpaceRental'] = (bool)$p['isSpaceRental'];
                $p['isTrending'] = (bool)$p['isTrending'];
                $p['isPromo'] = (bool)$p['isPromo'];
            }
            
            echo json_encode(["success" => true, "data" => $products]);
            break;

        case 'POST':
            $data = getJsonInput();
            
            // Si es un array de productos (sincronización masiva)
            if (isset($data['products']) && is_array($data['products'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO products (id, name, category, brand, barcode, price, cost, stock, minStock, pointsReward, pointsCost, image, isSpaceRental, isTrending, isPromo)
                    VALUES (:id, :name, :category, :brand, :barcode, :price, :cost, :stock, :minStock, :pointsReward, :pointsCost, :image, :isSpaceRental, :isTrending, :isPromo)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        category = VALUES(category),
                        brand = VALUES(brand),
                        price = VALUES(price),
                        cost = VALUES(cost),
                        stock = VALUES(stock),
                        minStock = VALUES(minStock),
                        pointsReward = VALUES(pointsReward),
                        pointsCost = VALUES(pointsCost),
                        image = VALUES(image),
                        isSpaceRental = VALUES(isSpaceRental),
                        isTrending = VALUES(isTrending),
                        isPromo = VALUES(isPromo)
                ");
                
                $pdo->beginTransaction();
                foreach ($data['products'] as $p) {
                    $stmt->execute([
                        ':id' => $p['id'] ?? ('prod-' . uniqid()),
                        ':name' => $p['name'],
                        ':category' => $p['category'] ?? 'General',
                        ':brand' => $p['brand'] ?? '',
                        ':barcode' => $p['barcode'],
                        ':price' => $p['price'] ?? 0,
                        ':cost' => $p['cost'] ?? 0,
                        ':stock' => $p['stock'] ?? 0,
                        ':minStock' => $p['minStock'] ?? 3,
                        ':pointsReward' => $p['pointsReward'] ?? 0,
                        ':pointsCost' => $p['pointsCost'] ?? 0,
                        ':image' => $p['image'] ?? null,
                        ':isSpaceRental' => !empty($p['isSpaceRental']) ? 1 : 0,
                        ':isTrending' => !empty($p['isTrending']) ? 1 : 0,
                        ':isPromo' => !empty($p['isPromo']) ? 1 : 0
                    ]);
                }
                $pdo->commit();
                echo json_encode(["success" => true, "message" => "Productos sincronizados"]);
                break;
            }

            // Producto individual
            $id = $data['id'] ?? ('prod-' . uniqid());
            $stmt = $pdo->prepare("
                INSERT INTO products (id, name, category, brand, barcode, price, cost, stock, minStock, pointsReward, pointsCost, image, isSpaceRental, isTrending, isPromo)
                VALUES (:id, :name, :category, :brand, :barcode, :price, :cost, :stock, :minStock, :pointsReward, :pointsCost, :image, :isSpaceRental, :isTrending, :isPromo)
            ");
            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':category' => $data['category'] ?? 'General',
                ':brand' => $data['brand'] ?? '',
                ':barcode' => $data['barcode'],
                ':price' => $data['price'] ?? 0,
                ':cost' => $data['cost'] ?? 0,
                ':stock' => $data['stock'] ?? 0,
                ':minStock' => $data['minStock'] ?? 3,
                ':pointsReward' => $data['pointsReward'] ?? 0,
                ':pointsCost' => $data['pointsCost'] ?? 0,
                ':image' => $data['image'] ?? null,
                ':isSpaceRental' => !empty($data['isSpaceRental']) ? 1 : 0,
                ':isTrending' => !empty($data['isTrending']) ? 1 : 0,
                ':isPromo' => !empty($data['isPromo']) ? 1 : 0
            ]);

            echo json_encode(["success" => true, "id" => $id, "message" => "Producto creado"]);
            break;

        case 'PUT':
            $data = getJsonInput();
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID de producto requerido"]);
                exit();
            }

            $stmt = $pdo->prepare("
                UPDATE products SET
                    name = :name,
                    category = :category,
                    brand = :brand,
                    barcode = :barcode,
                    price = :price,
                    cost = :cost,
                    stock = :stock,
                    minStock = :minStock,
                    pointsReward = :pointsReward,
                    pointsCost = :pointsCost,
                    image = :image,
                    isSpaceRental = :isSpaceRental,
                    isTrending = :isTrending,
                    isPromo = :isPromo
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':category' => $data['category'] ?? 'General',
                ':brand' => $data['brand'] ?? '',
                ':barcode' => $data['barcode'],
                ':price' => $data['price'] ?? 0,
                ':cost' => $data['cost'] ?? 0,
                ':stock' => $data['stock'] ?? 0,
                ':minStock' => $data['minStock'] ?? 3,
                ':pointsReward' => $data['pointsReward'] ?? 0,
                ':pointsCost' => $data['pointsCost'] ?? 0,
                ':image' => $data['image'] ?? null,
                ':isSpaceRental' => !empty($data['isSpaceRental']) ? 1 : 0,
                ':isTrending' => !empty($data['isTrending']) ? 1 : 0,
                ':isPromo' => !empty($data['isPromo']) ? 1 : 0
            ]);

            echo json_encode(["success" => true, "message" => "Producto actualizado"]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "ID requerido para eliminar"]);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(["success" => true, "message" => "Producto eliminado"]);
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
