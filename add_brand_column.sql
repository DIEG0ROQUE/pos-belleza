-- ========================================================
-- AGREGAR COLUMNA 'brand' (MARCA) A LA TABLA DE PRODUCTOS
-- ========================================================

-- 1. Agregar columna brand si no existe
ALTER TABLE `products` ADD COLUMN `brand` VARCHAR(100) NULL DEFAULT '' AFTER `category`;

-- 2. (Opcional) Asignar marcas automáticamente a los productos que tienen el nombre en la descripción
UPDATE `products` SET `brand` = 'SINLESS BEAUTY' WHERE `name` LIKE '%SINLESS%';
UPDATE `products` SET `brand` = 'pink UP' WHERE `name` LIKE '%pink UP%';
UPDATE `products` SET `brand` = 'ULTRAMO' WHERE `name` LIKE '%ULTRAMO%';
UPDATE `products` SET `brand` = 'ITALIA DELUXE' WHERE `name` LIKE '%ITALIA DELUXE%' OR `name` LIKE '%italia delux%';
UPDATE `products` SET `brand` = 'by apple' WHERE `name` LIKE '%by apple%';
UPDATE `products` SET `brand` = 'SANIYE' WHERE `name` LIKE '%SANIYE%';
UPDATE `products` SET `brand` = 'PROSA' WHERE `name` LIKE '%PROSA%' OR `name` LIKE '%prosa%';
UPDATE `products` SET `brand` = 'ANANDA' WHERE `name` LIKE '%ANANDA%';
UPDATE `products` SET `brand` = 'AND' WHERE `name` LIKE '%AND-%' OR `name` LIKE '%AND %';
UPDATE `products` SET `brand` = 'BISSU' WHERE `name` LIKE '%BISSU%';
