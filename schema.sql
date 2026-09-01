-- ==========================================================
-- BASE DE DATOS POS BELLEZA ZABALEGUI - HOSTINGER MYSQL
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. TABLA: users (Gerente, Cajeros y Clientes VIP)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('gerente', 'cajero', 'cliente') NOT NULL DEFAULT 'cliente',
  `points` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. TABLA: user_point_history (Historial de Puntos VIP)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_point_history` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `points` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_points` (`user_id`),
  CONSTRAINT `fk_user_points` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. TABLA: products (Inventario de Productos)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `barcode` VARCHAR(50) NOT NULL UNIQUE,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `minStock` INT NOT NULL DEFAULT 3,
  `pointsReward` INT NOT NULL DEFAULT 0,
  `pointsCost` INT NOT NULL DEFAULT 0,
  `image` LONGTEXT DEFAULT NULL,
  `isSpaceRental` TINYINT(1) NOT NULL DEFAULT 0,
  `isTrending` TINYINT(1) NOT NULL DEFAULT 0,
  `isPromo` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. TABLA: sales (Tickets de Venta y Transacciones)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales` (
  `id` VARCHAR(50) NOT NULL,
  `date` DATETIME NOT NULL,
  `cashierId` VARCHAR(50) NOT NULL,
  `cashierName` VARCHAR(100) NOT NULL,
  `customerId` VARCHAR(50) DEFAULT NULL,
  `customerName` VARCHAR(100) NOT NULL DEFAULT 'Público General',
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `paymentMethod` VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
  `cashReceived` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `change` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `pointsEarned` INT NOT NULL DEFAULT 0,
  `pointsUsed` INT NOT NULL DEFAULT 0,
  `shiftId` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sale_customer` (`customerId`),
  KEY `idx_sale_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. TABLA: sale_items (Detalle de Productos por Ticket)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `sale_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `isSpaceRental` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_sale_items` (`sale_id`),
  CONSTRAINT `fk_sale_items` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. TABLA: rewards (Catálogo de Recompensas VIP)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rewards` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Productos',
  `pointsCost` INT NOT NULL DEFAULT 1000,
  `description` TEXT DEFAULT NULL,
  `image` LONGTEXT DEFAULT NULL,
  `linkedProductId` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. TABLA: shifts (Control de Turnos y Cortes de Caja)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `shifts` (
  `id` VARCHAR(50) NOT NULL,
  `cashierName` VARCHAR(100) NOT NULL,
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME DEFAULT NULL,
  `openingBalance` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `closingBalance` DECIMAL(10,2) DEFAULT NULL,
  `expectedBalance` DECIMAL(10,2) DEFAULT NULL,
  `cashSales` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `nonCashSales` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `totalSales` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discrepancy` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'closed') NOT NULL DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. TABLA: expenses (Gastos del Negocio)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. TABLA: suppliers (Directorio de Proveedores)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `image` LONGTEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DATOS INICIALES Y SEMILLA
-- ==========================================================

-- Usuarios de prueba
INSERT INTO `users` (`id`, `name`, `phone`, `email`, `password`, `role`, `points`) VALUES
('u-1', 'Diana Laura (Gerente)', '5551112222', 'admin@belleza.com', 'admin123', 'gerente', 0),
('u-2', 'Carlos Rosas (Cajero)', '5553334444', 'cajero@belleza.com', 'caja123', 'cajero', 0),
('u-3', 'Sofia Perez (Cliente Premium)', '5551234567', 'sofia@email.com', 'sofia123', 'cliente', 3200),
('u-4', 'Alejandro Gomez (Cliente)', '5557654321', 'alejandro@email.com', 'ale123', 'cliente', 850)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Historial de puntos inicial
INSERT INTO `user_point_history` (`user_id`, `date`, `description`, `points`) VALUES
('u-3', '2026-08-05', 'Compra Tienda Centro', 1200),
('u-3', '2026-08-09', 'Compra Online', 3000),
('u-3', '2026-08-10', 'Canje: Labial Matte', -1000),
('u-4', '2026-08-11', 'Compra de Apertura', 850);

-- Catálogo de productos inicial
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `price`, `cost`, `stock`, `minStock`, `pointsReward`, `pointsCost`, `image`, `isSpaceRental`, `isTrending`, `isPromo`) VALUES
('prod-1', 'Labial Matte Rose Gold', 'Maquillaje', '75010011', 299.00, 120.00, 25, 5, 30, 2990, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80', 0, 1, 0),
('prod-2', 'Base de Maquillaje Fluida Hidratante', 'Maquillaje', '75010022', 450.00, 180.00, 18, 4, 45, 4500, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80', 0, 1, 0),
('prod-3', 'Paleta de Sombras Golden Sunset (18 colores)', 'Maquillaje', '75010033', 680.00, 290.00, 12, 3, 70, 6800, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80', 0, 1, 0),
('prod-4', 'Sérum Facial Ácido Hialurónico', 'Belleza', '75010044', 380.00, 150.00, 30, 6, 40, 3800, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80', 0, 0, 1),
('prod-5', 'Crema Hidratante Facial de Noche', 'Belleza', '75010055', 520.00, 210.00, 15, 4, 55, 5200, 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&q=80', 0, 0, 1),
('prod-6', 'Vestido Floral de Verano', 'Ropa', '75010066', 899.00, 380.00, 8, 2, 90, 8990, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80', 0, 0, 0),
('prod-7', 'Blusa Satín Elegante Esmeralda', 'Ropa', '75010077', 549.00, 220.00, 14, 3, 55, 5490, 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=500&q=80', 0, 0, 0),
('prod-8', 'Rímel Máscara de Pestañas 4D', 'Maquillaje', '75010088', 189.00, 80.00, 40, 8, 20, 1890, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80', 0, 0, 0),
('prod-9', 'Loción Corporal de Vainilla y Coco', 'Belleza', '75010099', 240.00, 95.00, 22, 5, 25, 2400, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80', 0, 0, 0),
('prod-10', 'Pantalón Culotte Lino Beige', 'Ropa', '75010100', 750.00, 320.00, 10, 2, 75, 7500, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80', 0, 0, 0)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Catálogo de Recompensas VIP inicial
INSERT INTO `rewards` (`id`, `name`, `category`, `pointsCost`, `description`, `image`, `linkedProductId`) VALUES
('rew-1', 'Cupón $50 MXN de Descuento', 'Cupones', 500, 'Válido en cualquier compra mínima de $200 MXN en tienda física o en línea.', 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80', NULL),
('rew-2', 'Rímel Máscara de Pestañas 4D', 'Productos', 1890, 'Efecto alargador y volumen resistente al agua. Tono negro intenso.', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80', 'prod-8'),
('rew-3', 'Labial Matte Rose Gold', 'Productos', 2990, 'Color de larga duración enriquecido con vitamina E y aceites naturales.', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80', 'prod-1'),
('rew-4', 'Sérum Facial Ácido Hialurónico', 'Productos', 3800, 'Hidratación profunda antiedad y luminosidad para todo tipo de piel.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80', 'prod-4'),
('rew-5', 'Cupón $250 MXN de Descuento', 'Cupones', 2500, 'Descuento directo en tu ticket de compra para miembros VIP.', 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&q=80', NULL),
('rew-6', 'Paleta de Sombras Golden Sunset', 'Productos', 6800, '18 tonos cálidos, mates y satinados de altísima pigmentación.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80', 'prod-3')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Proveedores iniciales
INSERT INTO `suppliers` (`id`, `name`, `phone`, `email`, `address`, `category`, `notes`, `image`) VALUES
('sup-1', 'Distribuidora Belleza Mexicana S.A.', '9515568822', 'ventas@bellezamex.com', 'Av. Reforma 402, Oaxaca, Centro', 'Maquillaje & Cosméticos', 'Proveedor principal de labiales, esmaltes y cosméticos de temporada.', 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=150&q=80'),
('sup-2', 'Moda y Estilo Textil del Sur', '9514483311', 'pedidos@modatextilsur.com', 'Independencia 702, Oaxaca, Centro', 'Ropa & Vestidos', 'Surtido de blusas y vestidos florales. Entregan cada miércoles.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&q=80')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Gastos iniciales
INSERT INTO `expenses` (`id`, `date`, `category`, `description`, `amount`, `notes`) VALUES
('exp-1', '2026-08-15 12:00:00', 'Renta', 'Renta mensual de local comercial (Armenta y López 1025)', 8500.00, 'Mes de Agosto liquidado completo'),
('exp-2', '2026-08-20 10:30:00', 'Sueldos', 'Pago de quincena a empleado de mostrador', 3200.00, 'Primera quincena de Agosto'),
('exp-3', '2026-08-25 17:00:00', 'Servicios', 'Recibo de energía eléctrica CFE', 1150.00, 'Consumo bimestral'),
('exp-4', '2026-08-26 15:45:00', 'Internet', 'Pago mensual Telmex Infinitum', 549.00, 'Paquete de 150 Megas'),
('exp-5', '2026-08-28 11:15:00', 'Proveedor', 'Compra lote labiales Matte - Distribuidora Belleza Mexicana', 4500.00, 'Factura #1032')
ON DUPLICATE KEY UPDATE `id`=VALUES(`id`);

COMMIT;
