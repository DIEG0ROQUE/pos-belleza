-- ========================================================
-- REINSERTAR LOS 10 PRODUCTOS ORIGINALES (MAQUILLAJE Y BELLEZA)
-- ========================================================
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
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `category` = VALUES(`category`),
    `price` = VALUES(`price`),
    `cost` = VALUES(`cost`),
    `stock` = VALUES(`stock`),
    `minStock` = VALUES(`minStock`),
    `pointsReward` = VALUES(`pointsReward`),
    `pointsCost` = VALUES(`pointsCost`),
    `image` = VALUES(`image`);
