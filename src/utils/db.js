// db.js - Base de Datos Simulada en LocalStorage para el Punto de Venta y Fidelización
// Contiene datos de semilla realistas (productos de belleza, ropa, maquillaje) y funciones helper.

const SEED_PRODUCTS = [
  {
    id: "prod-1",
    name: "Labial Matte Rose Gold",
    category: "Maquillaje",
    barcode: "75010011",
    price: 299,
    cost: 120,
    stock: 25,
    minStock: 5,
    pointsReward: 30,
    pointsCost: 300,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80"
  },
  {
    id: "prod-2",
    name: "Base de Maquillaje Fluida Hidratante",
    category: "Maquillaje",
    barcode: "75010022",
    price: 450,
    cost: 180,
    stock: 18,
    minStock: 4,
    pointsReward: 45,
    pointsCost: 450,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80"
  },
  {
    id: "prod-3",
    name: "Paleta de Sombras 'Golden Sunset' (18 colores)",
    category: "Maquillaje",
    barcode: "75010033",
    price: 680,
    cost: 290,
    stock: 12,
    minStock: 3,
    pointsReward: 70,
    pointsCost: 700,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"
  },
  {
    id: "prod-4",
    name: "Sérum Facial Ácido Hialurónico",
    category: "Belleza",
    barcode: "75010044",
    price: 380,
    cost: 150,
    stock: 30,
    minStock: 6,
    pointsReward: 40,
    pointsCost: 400,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"
  },
  {
    id: "prod-5",
    name: "Crema Hidratante Facial de Noche",
    category: "Belleza",
    barcode: "75010055",
    price: 520,
    cost: 210,
    stock: 15,
    minStock: 4,
    pointsReward: 55,
    pointsCost: 520,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&q=80"
  },
  {
    id: "prod-6",
    name: "Vestido Floral de Verano",
    category: "Ropa",
    barcode: "75010066",
    price: 899,
    cost: 380,
    stock: 8,
    minStock: 2,
    pointsReward: 90,
    pointsCost: 900,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80"
  },
  {
    id: "prod-7",
    name: "Blusa Satín Elegante Esmeralda",
    category: "Ropa",
    barcode: "75010077",
    price: 549,
    cost: 220,
    stock: 14,
    minStock: 3,
    pointsReward: 55,
    pointsCost: 550,
    image: "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=500&q=80"
  },
  {
    id: "prod-8",
    name: "Rímel Máscara de Pestañas 4D",
    category: "Maquillaje",
    barcode: "75010088",
    price: 189,
    cost: 70,
    stock: 40,
    minStock: 8,
    pointsReward: 20,
    pointsCost: 200,
    image: "https://images.unsplash.com/photo-1631214524020-5e18d9765176?w=500&q=80"
  },
  {
    id: "prod-9",
    name: "Loción Corporal de Vainilla y Coco",
    category: "Belleza",
    barcode: "75010099",
    price: 240,
    cost: 95,
    stock: 3, // stock bajo a propósito para alertas
    minStock: 5,
    pointsReward: 25,
    pointsCost: 240,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80"
  },
  {
    id: "prod-10",
    name: "Jeans High Waist Classic Blue",
    category: "Ropa",
    barcode: "75010010",
    price: 799,
    cost: 320,
    stock: 10,
    minStock: 3,
    pointsReward: 80,
    pointsCost: 800,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80"
  }
];

const SEED_USERS = [
  {
    id: "u-1",
    name: "Diana Laura (Gerente)",
    phone: "5551112222",
    email: "gerente@belleza.com",
    password: "admin123",
    role: "gerente",
    points: 0,
    pointHistory: []
  },
  {
    id: "u-2",
    name: "Carlos Rosas (Cajero)",
    phone: "5553334444",
    email: "cajero@belleza.com",
    password: "caja123",
    role: "cajero",
    points: 0,
    pointHistory: []
  },
  {
    id: "u-3",
    name: "Sofia Perez (Cliente Premium)",
    phone: "5551234567",
    email: "sofia@email.com",
    password: "sofia123",
    role: "cliente",
    points: 320,
    pointHistory: [
      { date: "2026-08-05", description: "Compra Tienda Centro", points: +120 },
      { date: "2026-08-09", description: "Compra Online", points: +300 },
      { date: "2026-08-10", description: "Canje: Labial Matte", points: -100 }
    ]
  },
  {
    id: "u-4",
    name: "Alejandro Gomez (Cliente)",
    phone: "5557654321",
    email: "alejandro@email.com",
    password: "ale123",
    role: "cliente",
    points: 85,
    pointHistory: [
      { date: "2026-08-11", description: "Compra de Apertura", points: +85 }
    ]
  }
];

const SEED_REWARDS = [
  { id: "rew-1", name: "Cupón $50 MXN de Descuento", pointsCost: 100, category: "Descuentos" },
  { id: "rew-2", name: "Rímel Máscara de Pestañas 4D", pointsCost: 200, category: "Productos" },
  { id: "rew-3", name: "Labial Matte Rose Gold", pointsCost: 300, category: "Productos" },
  { id: "rew-4", name: "Sérum Facial Ácido Hialurónico", pointsCost: 400, category: "Productos" },
  { id: "rew-5", name: "Cupón $250 MXN de Descuento", pointsCost: 450, category: "Descuentos" }
];

const SEED_SALES = [
  {
    id: "sale-1",
    date: "2026-08-07T14:30:00.000Z",
    cashierId: "u-2",
    cashierName: "Carlos Rosas",
    customerId: "u-3",
    customerName: "Sofia Perez",
    items: [
      { id: "prod-1", name: "Labial Matte Rose Gold", quantity: 2, price: 299 },
      { id: "prod-4", name: "Sérum Facial Ácido Hialurónico", quantity: 1, price: 380 }
    ],
    subtotal: 978,
    discount: 0,
    total: 978,
    paymentMethod: "Tarjeta",
    pointsEarned: 100,
    pointsUsed: 0
  },
  {
    id: "sale-2",
    date: "2026-08-08T18:15:00.000Z",
    cashierId: "u-2",
    cashierName: "Carlos Rosas",
    customerId: null,
    customerName: "Público General",
    items: [
      { id: "prod-6", name: "Vestido Floral de Verano", quantity: 1, price: 899 }
    ],
    subtotal: 899,
    discount: 0,
    total: 899,
    paymentMethod: "Efectivo",
    pointsEarned: 0,
    pointsUsed: 0
  },
  {
    id: "sale-3",
    date: "2026-08-10T11:00:00.000Z",
    cashierId: "u-1",
    cashierName: "Diana Laura",
    customerId: "u-4",
    customerName: "Alejandro Gomez",
    items: [
      { id: "prod-8", name: "Rímel Máscara de Pestañas 4D", quantity: 1, price: 189 },
      { id: "prod-2", name: "Base de Maquillaje Fluida Hidratante", quantity: 1, price: 450 }
    ],
    subtotal: 639,
    discount: 0,
    total: 639,
    paymentMethod: "Efectivo",
    pointsEarned: 65,
    pointsUsed: 0
  },
  {
    id: "sale-4",
    date: "2026-08-11T16:45:00.000Z",
    cashierId: "u-2",
    cashierName: "Carlos Rosas",
    customerId: "u-3",
    customerName: "Sofia Perez",
    items: [
      { id: "prod-7", name: "Blusa Satín Elegante Esmeralda", quantity: 1, price: 549 }
    ],
    subtotal: 549,
    discount: 100, // Usó puntos o cupón
    total: 449,
    paymentMethod: "Tarjeta",
    pointsEarned: 55,
    pointsUsed: 100
  },
  {
    id: "sale-5",
    date: "2026-08-12T13:20:00.000Z",
    cashierId: "u-1",
    cashierName: "Diana Laura",
    customerId: null,
    customerName: "Público General",
    items: [
      { id: "prod-3", name: "Paleta de Sombras 'Golden Sunset' (18 colores)", quantity: 1, price: 680 },
      { id: "prod-9", name: "Loción Corporal de Vainilla y Coco", quantity: 1, price: 240 }
    ],
    subtotal: 920,
    discount: 0,
    total: 920,
    paymentMethod: "Tarjeta",
    pointsEarned: 0,
    pointsUsed: 0
  }
];

// Inicializar localStorage si no existe
const initStorage = () => {
  if (!localStorage.getItem("pos_products")) {
    localStorage.setItem("pos_products", JSON.stringify(SEED_PRODUCTS));
  } else {
    // Migración: Asegurar campos isTrending e isPromo para que el gerente los controle
    try {
      const data = localStorage.getItem("pos_products");
      let products = JSON.parse(data);
      if (Array.isArray(products)) {
        let updated = false;
        products = products.map((p, idx) => {
          if (p.isTrending === undefined) {
            p.isTrending = idx < 3; // Primeros 3 son tendencias por defecto
            updated = true;
          }
          if (p.isPromo === undefined) {
            p.isPromo = idx >= 3 && idx < 5; // Siguientes 2 son promociones por defecto
            updated = true;
          }
          return p;
        });
        if (updated) {
          localStorage.setItem("pos_products", JSON.stringify(products));
        }
      }
    } catch (e) {
      console.error("Error al migrar campos de tendencias:", e);
    }
  }
  if (!localStorage.getItem("pos_users")) {
    localStorage.setItem("pos_users", JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem("pos_rewards")) {
    localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
  }
  if (!localStorage.getItem("pos_sales")) {
    localStorage.setItem("pos_sales", JSON.stringify(SEED_SALES));
  }
};

// Ejecutar inicialización
initStorage();

export const db = {
  // --- PRODUCTOS ---
  getProducts: () => {
    try {
      const data = localStorage.getItem("pos_products");
      if (!data) {
        localStorage.setItem("pos_products", JSON.stringify(SEED_PRODUCTS));
        return SEED_PRODUCTS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // Si no es un array, resetear
      localStorage.setItem("pos_products", JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    } catch (e) {
      console.error("Error al parsear pos_products, reseteando...", e);
      localStorage.setItem("pos_products", JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
  },

  saveProducts: (products) => {
    try {
      localStorage.setItem("pos_products", JSON.stringify(products));
    } catch (e) {
      console.error("Error al guardar pos_products", e);
    }
  },

  addProduct: (product) => {
    const products = db.getProducts();
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      stock: parseInt(product.stock) || 0,
      price: parseFloat(product.price) || 0,
      cost: parseFloat(product.cost) || 0,
      minStock: parseInt(product.minStock) || 3,
      pointsReward: parseInt(product.pointsReward) || Math.round(product.price * 0.1),
      pointsCost: parseInt(product.pointsCost) || Math.round(product.price * 10)
    };
    products.push(newProduct);
    db.saveProducts(products);
    return newProduct;
  },

  updateProduct: (updatedProduct) => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updatedProduct,
        stock: parseInt(updatedProduct.stock) || 0,
        price: parseFloat(updatedProduct.price) || 0,
        cost: parseFloat(updatedProduct.cost) || 0,
        minStock: parseInt(updatedProduct.minStock) || 3,
        pointsReward: parseInt(updatedProduct.pointsReward) || Math.round(updatedProduct.price * 0.1),
        pointsCost: parseInt(updatedProduct.pointsCost) || Math.round(updatedProduct.price * 10)
      };
      db.saveProducts(products);
      return true;
    }
    return false;
  },

  deleteProduct: (id) => {
    let products = db.getProducts();
    products = products.filter(p => p.id !== id);
    db.saveProducts(products);
  },

  // --- USUARIOS ---
  getUsers: () => {
    try {
      const data = localStorage.getItem("pos_users");
      if (!data) {
        localStorage.setItem("pos_users", JSON.stringify(SEED_USERS));
        return SEED_USERS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      localStorage.setItem("pos_users", JSON.stringify(SEED_USERS));
      return SEED_USERS;
    } catch (e) {
      console.error("Error al parsear pos_users, reseteando...", e);
      localStorage.setItem("pos_users", JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
  },

  saveUsers: (users) => {
    try {
      localStorage.setItem("pos_users", JSON.stringify(users));
    } catch (e) {
      console.error("Error al guardar pos_users", e);
    }
  },

  registerUser: (userData) => {
    const users = db.getUsers();
    // Validar teléfono duplicado
    if (users.find(u => u.phone === userData.phone)) {
      throw new Error("El número telefónico ya está registrado.");
    }
    const newUser = {
      id: `u-${Date.now()}`,
      name: userData.name,
      phone: userData.phone,
      email: userData.email || "",
      password: userData.password,
      role: userData.role || "cliente",
      points: 0,
      pointHistory: [
        { date: new Date().toISOString().split("T")[0], description: "Registro y bienvenida", points: 20 }
      ]
    };
    newUser.points = 20; // 20 puntos de bienvenida
    users.push(newUser);
    db.saveUsers(users);
    return newUser;
  },

  updateUserPoints: (userId, pointsDiff, description) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].points = Math.max(0, (users[index].points || 0) + pointsDiff);
      if (!users[index].pointHistory) users[index].pointHistory = [];
      users[index].pointHistory.unshift({
        date: new Date().toISOString().split("T")[0],
        description,
        points: pointsDiff
      });
      db.saveUsers(users);
      return users[index];
    }
    return null;
  },

  // --- VENTAS ---
  getSales: () => {
    try {
      const data = localStorage.getItem("pos_sales");
      if (!data) {
        localStorage.setItem("pos_sales", JSON.stringify(SEED_SALES));
        return SEED_SALES;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      localStorage.setItem("pos_sales", JSON.stringify(SEED_SALES));
      return SEED_SALES;
    } catch (e) {
      console.error("Error al parsear pos_sales, reseteando...", e);
      localStorage.setItem("pos_sales", JSON.stringify(SEED_SALES));
      return SEED_SALES;
    }
  },

  saveSales: (sales) => {
    try {
      localStorage.setItem("pos_sales", JSON.stringify(sales));
    } catch (e) {
      console.error("Error al guardar pos_sales", e);
    }
  },

  createSale: (saleData) => {
    const sales = db.getSales();
    const newSale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      cashierId: saleData.cashierId,
      cashierName: saleData.cashierName,
      customerId: saleData.customerId || null,
      customerName: saleData.customerName || "Público General",
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount || 0,
      total: saleData.total,
      paymentMethod: saleData.paymentMethod, // Efectivo, Tarjeta, Puntos
      pointsEarned: saleData.pointsEarned || 0,
      pointsUsed: saleData.pointsUsed || 0
    };

    // 1. Descontar Stock de Productos
    const products = db.getProducts();
    newSale.items.forEach(item => {
      const prod = products.find(p => p.id === item.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    db.saveProducts(products);

    // 2. Si hay cliente, ajustar sus puntos
    if (newSale.customerId) {
      if (newSale.pointsEarned > 0) {
        db.updateUserPoints(newSale.customerId, newSale.pointsEarned, `Compra folio #${newSale.id.slice(-6)}`);
      }
      if (newSale.pointsUsed > 0) {
        db.updateUserPoints(newSale.customerId, -newSale.pointsUsed, `Canje puntos folio #${newSale.id.slice(-6)}`);
      }
    }

    sales.push(newSale);
    db.saveSales(sales);
    return newSale;
  },

  // --- RECOMPENSAS ---
  getRewards: () => {
    try {
      const data = localStorage.getItem("pos_rewards");
      if (!data) {
        localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
        return SEED_REWARDS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
      return SEED_REWARDS;
    } catch (e) {
      console.error("Error al parsear pos_rewards, reseteando...", e);
      localStorage.setItem("pos_rewards", JSON.stringify(SEED_REWARDS));
      return SEED_REWARDS;
    }
  },

  redeemReward: (userId, rewardId) => {
    const rewards = db.getRewards();
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) throw new Error("Recompensa no encontrada");

    const users = db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("Usuario no encontrado");

    if (user.points < reward.pointsCost) {
      throw new Error("Puntos insuficientes para canjear esta recompensa");
    }

    // Actualizar puntos del usuario
    db.updateUserPoints(userId, -reward.pointsCost, `Canje: ${reward.name}`);
    return true;
  }
};
