<?php
require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM shifts ORDER BY startTime DESC");
            $shifts = $stmt->fetchAll();
            foreach ($shifts as &$s) {
                $s['openingBalance'] = (float)$s['openingBalance'];
                $s['closingBalance'] = isset($s['closingBalance']) ? (float)$s['closingBalance'] : null;
                $s['expectedBalance'] = isset($s['expectedBalance']) ? (float)$s['expectedBalance'] : null;
                $s['cashSales'] = (float)$s['cashSales'];
                $s['nonCashSales'] = (float)$s['nonCashSales'];
                $s['totalSales'] = (float)$s['totalSales'];
                $s['discrepancy'] = (float)$s['discrepancy'];
            }
            echo json_encode(["success" => true, "data" => $shifts]);
            break;

        case 'POST':
            $data = getJsonInput();

            // Sincronización masiva
            if (isset($data['shifts']) && is_array($data['shifts'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO shifts (id, cashierName, startTime, endTime, openingBalance, closingBalance, expectedBalance, cashSales, nonCashSales, totalSales, discrepancy, status)
                    VALUES (:id, :cashierName, :startTime, :endTime, :openingBalance, :closingBalance, :expectedBalance, :cashSales, :nonCashSales, :totalSales, :discrepancy, :status)
                    ON DUPLICATE KEY UPDATE
                        endTime = VALUES(endTime),
                        closingBalance = VALUES(closingBalance),
                        expectedBalance = VALUES(expectedBalance),
                        cashSales = VALUES(cashSales),
                        nonCashSales = VALUES(nonCashSales),
                        totalSales = VALUES(totalSales),
                        discrepancy = VALUES(discrepancy),
                        status = VALUES(status)
                ");

                $pdo->beginTransaction();
                foreach ($data['shifts'] as $s) {
                    $stmt->execute([
                        ':id' => $s['id'],
                        ':cashierName' => $s['cashierName'],
                        ':startTime' => $s['startTime'],
                        ':endTime' => $s['endTime'] ?? null,
                        ':openingBalance' => (float)($s['openingBalance'] ?? 0),
                        ':closingBalance' => isset($s['closingBalance']) ? (float)$s['closingBalance'] : null,
                        ':expectedBalance' => isset($s['expectedBalance']) ? (float)$s['expectedBalance'] : null,
                        ':cashSales' => (float)($s['cashSales'] ?? 0),
                        ':nonCashSales' => (float)($s['nonCashSales'] ?? 0),
                        ':totalSales' => (float)($s['totalSales'] ?? 0),
                        ':discrepancy' => (float)($s['discrepancy'] ?? 0),
                        ':status' => $s['status'] ?? 'active'
                    ]);
                }
                $pdo->commit();
                echo json_encode(["success" => true, "message" => "Turnos sincronizados"]);
                break;
            }

            // Guardar / Cerrar turno individual
            $id = $data['id'] ?? ('shift-' . round(microtime(true) * 1000));
            $stmt = $pdo->prepare("
                INSERT INTO shifts (id, cashierName, startTime, endTime, openingBalance, closingBalance, expectedBalance, cashSales, nonCashSales, totalSales, discrepancy, status)
                VALUES (:id, :cashierName, :startTime, :endTime, :openingBalance, :closingBalance, :expectedBalance, :cashSales, :nonCashSales, :totalSales, :discrepancy, :status)
                ON DUPLICATE KEY UPDATE
                    endTime = VALUES(endTime),
                    closingBalance = VALUES(closingBalance),
                    expectedBalance = VALUES(expectedBalance),
                    cashSales = VALUES(cashSales),
                    nonCashSales = VALUES(nonCashSales),
                    totalSales = VALUES(totalSales),
                    discrepancy = VALUES(discrepancy),
                    status = VALUES(status)
            ");
            $stmt->execute([
                ':id' => $id,
                ':cashierName' => $data['cashierName'],
                ':startTime' => $data['startTime'] ?? date('Y-m-d H:i:s'),
                ':endTime' => $data['endTime'] ?? null,
                ':openingBalance' => (float)($data['openingBalance'] ?? 0),
                ':closingBalance' => isset($data['closingBalance']) ? (float)$data['closingBalance'] : null,
                ':expectedBalance' => isset($data['expectedBalance']) ? (float)$data['expectedBalance'] : null,
                ':cashSales' => (float)($data['cashSales'] ?? 0),
                ':nonCashSales' => (float)($data['nonCashSales'] ?? 0),
                ':totalSales' => (float)($data['totalSales'] ?? 0),
                ':discrepancy' => (float)($data['discrepancy'] ?? 0),
                ':status' => $data['status'] ?? 'active'
            ]);

            echo json_encode(["success" => true, "id" => $id, "message" => "Turno guardado"]);
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
