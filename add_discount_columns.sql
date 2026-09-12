-- ========================================================
-- AGREGAR COLUMNAS DE DESCUENTO Y OFERTAS A PRODUCTOS
-- ========================================================

ALTER TABLE `products` 
  ADD COLUMN IF NOT EXISTS `hasDiscount` TINYINT(1) DEFAULT 0 AFTER `isPromo`,
  ADD COLUMN IF NOT EXISTS `discountType` VARCHAR(20) DEFAULT 'percentage' AFTER `hasDiscount`,
  ADD COLUMN IF NOT EXISTS `discountValue` DECIMAL(10,2) DEFAULT 0 AFTER `discountType`;
