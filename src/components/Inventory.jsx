// Inventory.jsx - Control de Inventario y Entrada de Mercancía
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, PackageOpen, AlertTriangle, Check, RefreshCw, Printer, Download, Tag, X, Sparkles, FolderPlus } from "lucide-react";
import * as XLSX from "xlsx";
import { db } from "../utils/db";

export default function Inventory({ currentUser, products, onRefreshProducts, showToast }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [brandFilter, setBrandFilter] = useState("Todas");
  
  // Listas dinámicas
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);

  // Modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Modal de Entrada Rápida de Stock
  const [showStockEntryModal, setShowStockEntryModal] = useState(false);
  const [stockEntryProduct, setStockEntryProduct] = useState(null);
  const [stockAddAmount, setStockAddAmount] = useState("");

  // Modales para Crear Nueva Categoría y Nueva Marca
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  // Estado para la etiqueta que se está imprimiendo
  const [printingLabelProduct, setPrintingLabelProduct] = useState(null);

  // Estado para los productos seleccionados mediante checkbox
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Campos de formulario para Producto
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Maquillaje");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("3");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState("");
  const [isSpaceRental, setIsSpaceRental] = useState(false);

  // Cargar categorías y marcas al iniciar o cuando cambien los productos
  useEffect(() => {
    refreshCategoriesAndBrands();
  }, [products]);

  const refreshCategoriesAndBrands = () => {
    setCategoriesList(db.getCategories());
    setBrandsList(db.getBrands());
  };

  const generateUniqueBarcode = () => {
    let code = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      code = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10 dígitos
      isUnique = !products.some(p => p.barcode === code);
      attempts++;
    }
    return code;
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setCategory(categoriesList[0] || "Maquillaje");
    setBrand("");
    setPrice("");
    setCost("");
    setStock("");
    setMinStock("3");
    setBarcode(generateUniqueBarcode());
    setImage("https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"); // Placeholder estético
    setIsSpaceRental(false);
    setShowProductModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category || "Maquillaje");
    setBrand(prod.brand || "");
    setPrice(prod.price.toString());
    setCost(prod.cost.toString());
    setStock(prod.stock.toString());
    setMinStock(prod.minStock.toString());
    setBarcode(prod.barcode);
    setImage(prod.image);
    setIsSpaceRental(prod.isSpaceRental || false);
    setShowProductModal(true);
  };

  // Crear categoría al vuelo
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showToast("Ingresa un nombre para la categoría.", "error");
      return;
    }
    const clean = newCategoryName.trim();
    const updated = db.addCategory(clean);
    setCategoriesList(updated);
    setCategory(clean); // Seleccionar de inmediato en el formulario
    setNewCategoryName("");
    setShowNewCategoryModal(false);
    showToast(`Categoría "${clean}" creada con éxito.`, "success");
  };

  // Crear marca al vuelo
  const handleCreateBrand = (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      showToast("Ingresa un nombre para la marca.", "error");
      return;
    }
    const clean = newBrandName.trim();
    const updated = db.addBrand(clean);
    setBrandsList(updated);
    setBrand(clean); // Seleccionar de inmediato en el formulario
    setNewBrandName("");
    setShowNewBrandModal(false);
    showToast(`Marca "${clean}" registrada con éxito.`, "success");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setImage(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e, shouldPrintLabel = false) => {
    if (e) e.preventDefault();

    if (!name || !price || !cost || !stock || !barcode) {
      showToast("Llene todos los campos marcados con (*)", "error");
      return;
    }

    const productData = {
      name,
      category,
      brand: brand.trim(),
      price: parseFloat(price),
      cost: parseFloat(cost),
      stock: parseInt(stock),
      minStock: parseInt(minStock),
      barcode,
      image: image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80",
      isSpaceRental: !!isSpaceRental
    };

    let savedProduct = null;

    if (editingProduct) {
      // Editar
      savedProduct = { ...productData, id: editingProduct.id };
      db.updateProduct(savedProduct);
      showToast("Producto actualizado correctamente.", "success");
    } else {
      // Validar duplicado de código de barras
      const isDuplicate = products.some(p => p.barcode === barcode);
      if (isDuplicate) {
        showToast("Este código de barras ya pertenece a otro producto.", "error");
        return;
      }
      savedProduct = db.addProduct(productData);
      showToast("Producto agregado al inventario.", "success");
    }

    onRefreshProducts();
    setShowProductModal(false);

    // Si se especificó imprimir, gatillar la impresión directamente
    if (shouldPrintLabel && savedProduct) {
      handlePrintDirectLabel(savedProduct);
    }
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto del inventario?")) {
      db.deleteProduct(id);
      onRefreshProducts();
      showToast("Producto eliminado del inventario.", "info");
    }
  };

  // Gestión de Entrada Rápida de Stock
  const openStockEntryModal = (prod) => {
    setStockEntryProduct(prod);
    setStockAddAmount("");
    setShowStockEntryModal(true);
  };

  const handleStockEntrySubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(stockAddAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Ingrese una cantidad válida mayor a 0", "error");
      return;
    }

    const updatedProd = {
      ...stockEntryProduct,
      stock: stockEntryProduct.stock + amount
    };

    db.updateProduct(updatedProd);
    onRefreshProducts();
    setShowStockEntryModal(false);
    showToast(`Se agregaron ${amount} piezas a ${stockEntryProduct.name}.`, "success");
  };

  // Filtrado de productos en lista
  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(q) || 
      p.barcode.includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q));
    
    const matchesCategory = categoryFilter === "Todos" || p.category === categoryFilter;
    const matchesBrand = brandFilter === "Todas" || (brandFilter === "Sin Marca" ? !p.brand : p.brand === brandFilter);
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleExportExcel = (targetProductsList = filteredProducts) => {
    const productsToExport = Array.isArray(targetProductsList) && typeof targetProductsList[0] === "string"
      ? products.filter(p => targetProductsList.includes(p.id))
      : targetProductsList;

    if (productsToExport.length === 0) {
      showToast("No hay productos seleccionados para exportar.", "warning");
      return;
    }

    try {
      const data = productsToExport.map(p => ({
        "Codigo": p.barcode,
        "Nombre": p.name,
        "Marca": p.brand || "Sin Marca",
        "Categoria": p.category,
        "Costo": `$${p.cost.toFixed(2)}`,
        "Precio": `$${p.price.toFixed(2)}`,
        "Stock": p.stock
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
      XLSX.writeFile(workbook, "inventario_zabalegui.xlsx");
      showToast(`Exportadas ${productsToExport.length} filas a Excel con éxito.`, "success");
    } catch (err) {
      showToast("Error al exportar Excel: " + err.message, "error");
    }
  };

  const handlePrintDirectLabel = (product) => {
    setPrintingLabelProduct(product);
    setTimeout(() => {
      document.body.classList.add("printing-label");
      window.print();
      document.body.classList.remove("printing-label");
    }, 150);
  };

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Encabezado y Acciones */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Control de Inventario</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Registra mercancía, edita detalles de productos y monitorea existencias.</p>
        </div>

        {/* Botones de acción superior */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {selectedProductIds.length > 0 ? (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleExportExcel(selectedProductIds)} 
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--primary-color)", color: "white" }}
              >
                <Download size={18} /> Exportar Seleccionados ({selectedProductIds.length})
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedProductIds([])}
                style={{ padding: "0.5rem 0.8rem", fontSize: "0.85rem" }}
                title="Limpiar selección"
              >
                Limpiar ({selectedProductIds.length})
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => handleExportExcel(filteredProducts)} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Download size={18} /> Exportar Excel ({filteredProducts.length})
            </button>
          )}

          {currentUser.role === "gerente" && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Controles de Filtro & Búsqueda */}
      <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por nombre, código, categoría o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          {/* Filtro por Marca */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Marca:</span>
            <select
              className="input-field"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              style={{ minWidth: "150px", padding: "0.45rem 0.75rem", fontSize: "0.85rem" }}
            >
              <option value="Todas">Todas las marcas</option>
              <option value="Sin Marca">Sin Marca</option>
              {brandsList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Barra de Filtro de Categorías con Scroll Horizontal Fluido */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.4rem" }}>
          <button
            onClick={() => setCategoryFilter("Todos")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "20px",
              border: categoryFilter === "Todos" ? "none" : "1px solid var(--border-color)",
              background: categoryFilter === "Todos" ? "var(--primary-color)" : "white",
              color: categoryFilter === "Todos" ? "white" : "var(--text-dark)",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              transition: "var(--transition-fast)"
            }}
          >
            Todos ({products.length})
          </button>

          {categoriesList.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "20px",
                  border: categoryFilter === cat ? "none" : "1px solid var(--border-color)",
                  background: categoryFilter === cat ? "var(--primary-color)" : "white",
                  color: categoryFilter === cat ? "white" : "var(--text-dark)",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                  transition: "var(--transition-fast)"
                }}
              >
                {cat} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}

          {currentUser.role === "gerente" && (
            <button
              onClick={() => { setNewCategoryName(""); setShowNewCategoryModal(true); }}
              style={{
                padding: "0.45rem 0.8rem",
                borderRadius: "20px",
                border: "1px dashed var(--primary-color)",
                background: "rgba(197, 155, 142, 0.1)",
                color: "var(--primary-color)",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
              title="Agregar nueva categoría"
            >
              <Plus size={14} /> Nueva Categoría
            </button>
          )}
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      {products.some(p => p.stock <= p.minStock) && (
        <div style={{
          background: "#fff9f2",
          border: "1px solid #ffd6a5",
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          color: "#854d0e",
          marginBottom: "1.5rem",
          fontSize: "0.9rem"
        }}>
          <AlertTriangle size={20} color="#d97706" />
          <span>¡Atención! Hay productos con existencias por debajo del stock mínimo. Se recomienda ingresar mercancía.</span>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="glass-panel" style={{ overflowX: "auto", borderRadius: "var(--radius-md)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(49, 29, 32, 0.04)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem", width: "40px", textAlign: "center" }}>
                <input 
                  type="checkbox" 
                  checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.includes(p.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const filteredIds = filteredProducts.map(p => p.id);
                      setSelectedProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
                    } else {
                      const filteredIds = filteredProducts.map(p => p.id);
                      setSelectedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
                    }
                  }}
                  style={{ width: "16px", height: "16px", accentColor: "var(--primary-color)", cursor: "pointer" }}
                />
              </th>
              <th style={{ padding: "1rem" }}>Imagen</th>
              <th style={{ padding: "1rem" }}>Producto / Marca</th>
              <th style={{ padding: "1rem" }}>Categoría</th>
              <th style={{ padding: "1rem" }}>Costo</th>
              <th style={{ padding: "1rem" }}>P. Venta</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Stock</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <PackageOpen size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                  <p>No se encontraron productos en el inventario.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map(prod => {
                const isLowStock = prod.stock <= prod.minStock;
                const isSelected = selectedProductIds.includes(prod.id);
                return (
                  <tr key={prod.id} style={{ 
                    borderBottom: "1px solid #f0ebe9",
                    background: isSelected 
                      ? "rgba(197, 155, 142, 0.15)" 
                      : (isLowStock ? "rgba(217, 119, 6, 0.03)" : "transparent")
                  }}>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds(prev => [...prev, prod.id]);
                          } else {
                            setSelectedProductIds(prev => prev.filter(id => id !== prod.id));
                          }
                        }}
                        style={{ width: "16px", height: "16px", accentColor: "var(--primary-color)", cursor: "pointer" }}
                      />
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <img src={prod.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"} alt={prod.name} style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e0d9d6" }} />
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                        <strong style={{ fontSize: "0.95rem" }}>{prod.name}</strong>
                        {prod.brand && (
                          <span style={{
                            fontSize: "0.72rem",
                            background: "rgba(49, 29, 32, 0.07)",
                            color: "var(--text-dark)",
                            padding: "0.1rem 0.45rem",
                            borderRadius: "10px",
                            fontWeight: "600",
                            border: "1px solid rgba(49, 29, 32, 0.12)"
                          }}>
                            {prod.brand}
                          </span>
                        )}
                        {prod.isSpaceRental && (
                          <span style={{
                            fontSize: "0.7rem",
                            background: "rgba(197, 146, 146, 0.2)",
                            color: "var(--primary-color)",
                            padding: "0.1rem 0.35rem",
                            borderRadius: "4px",
                            fontWeight: "600"
                          }}>
                            Renta
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Cod: {prod.barcode}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        fontSize: "0.8rem",
                        padding: "0.25rem 0.55rem",
                        borderRadius: "12px",
                        background: "rgba(197, 155, 142, 0.15)",
                        fontWeight: "600"
                      }}>{prod.category}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.95rem" }}>${prod.cost.toFixed(2)}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", fontWeight: "600" }}>${prod.price.toFixed(2)}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      <span style={{
                        fontWeight: "700",
                        fontSize: "1rem",
                        color: isLowStock ? "#c93b54" : "var(--text-dark)",
                        background: isLowStock ? "#fdf2f4" : "transparent",
                        padding: isLowStock ? "0.2rem 0.5rem" : "0",
                        borderRadius: "4px"
                      }}>
                        {prod.stock}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Min: {prod.minStock}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.25rem" }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => openStockEntryModal(prod)}
                          title="Ingresar Mercancía"
                        >
                          <RefreshCw size={14} /> + Stock
                        </button>
                        {currentUser.role === "gerente" && (
                          <>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => handlePrintDirectLabel(prod)} 
                              style={{ padding: "0.4rem" }} 
                              title="Imprimir Etiqueta Térmica"
                            >
                              <Printer size={14} />
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(prod)} style={{ padding: "0.4rem" }} title="Editar Producto">
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(prod.id)} style={{ padding: "0.4rem" }} title="Eliminar Producto">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL AGREGAR / EDITAR PRODUCTO */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <button className="modal-close" onClick={() => setShowProductModal(false)}>
              <Plus size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
            
            <h2>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2>

            <form onSubmit={handleSaveProduct}>
              <div className="input-group">
                <label className="input-label">Nombre del Producto *</label>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Lip Gloss Larga Duración"
                  required
                />
              </div>

              {/* Categoría y Marca con creación rápida al vuelo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <label className="input-label" style={{ margin: 0 }}>Categoría *</label>
                    <button 
                      type="button" 
                      onClick={() => { setNewCategoryName(""); setShowNewCategoryModal(true); }}
                      style={{ background: "none", border: "none", color: "var(--primary-color)", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                    >
                      <Plus size={12} /> Nueva
                    </button>
                  </div>
                  <select 
                    className="input-field"
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <label className="input-label" style={{ margin: 0 }}>Marca (Opcional)</label>
                    <button 
                      type="button" 
                      onClick={() => { setNewBrandName(""); setShowNewBrandModal(true); }}
                      style={{ background: "none", border: "none", color: "var(--primary-color)", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                    >
                      <Plus size={12} /> Nueva
                    </button>
                  </div>
                  <select 
                    className="input-field"
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)}
                  >
                    <option value="">Sin Marca (Genérico)</option>
                    {brandsList.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Código de barras */}
              <div className="input-group">
                <label className="input-label">Código de Barras *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="input-field"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Código de barras"
                    style={{ flex: 1, minWidth: 0 }}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setBarcode(generateUniqueBarcode())}
                    style={{ padding: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="Generar Código Único"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {/* Costo y Precio */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Costo Adquisición *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Ej. 120"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Precio al Público *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ej. 299"
                    required
                  />
                </div>
              </div>

              {/* Stock Inicial y Stock Mínimo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Stock Inicial *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="Ej. 15"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Stock Mínimo Alerta *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="Ej. 3"
                    required
                  />
                </div>
              </div>

              {/* Checkbox para Renta de Espacio */}
              <div className="input-group" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input 
                  type="checkbox" 
                  id="isSpaceRental"
                  checked={isSpaceRental}
                  onChange={(e) => setIsSpaceRental(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)", cursor: "pointer", margin: 0 }}
                />
                <label htmlFor="isSpaceRental" style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-dark)", cursor: "pointer", userSelect: "none" }}>
                  ¿Es renta de espacio (consignación de otra empresa)?
                </label>
              </div>

              {/* Imagen del Producto */}
              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="input-label">Imagen del Producto</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {image && (
                    <img src={image} alt="Preview" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ fontSize: "0.85rem" }}
                    />
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Sube una foto desde tu dispositivo (se comprimirá automáticamente)
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                >
                  <Check size={16} /> Guardar Solo
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => handleSaveProduct(null, true)}
                  style={{ flex: 1.5, padding: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                >
                  <Printer size={16} /> Guardar e Imprimir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVA CATEGORÍA */}
      {showNewCategoryModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "380px" }}>
            <button className="modal-close" onClick={() => setShowNewCategoryModal(false)}>
              <Plus size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FolderPlus size={20} color="var(--primary-color)" /> Nueva Categoría
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Escribe el nombre de la nueva categoría para tu catálogo.
            </p>
            <form onSubmit={handleCreateCategory}>
              <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. Cuidado Facial, Perfumes, etc."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowNewCategoryModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVA MARCA */}
      {showNewBrandModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "380px" }}>
            <button className="modal-close" onClick={() => setShowNewBrandModal(false)}>
              <Plus size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={20} color="var(--primary-color)" /> Registrar Marca
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Escribe el nombre de la marca que deseas añadir a tu lista.
            </p>
            <form onSubmit={handleCreateBrand}>
              <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. L'Oréal, Maybelline, etc."
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowNewBrandModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Guardar Marca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ENTRADA RÁPIDA DE STOCK (MERCANCÍA) */}
      {showStockEntryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <button className="modal-close" onClick={() => setShowStockEntryModal(false)}>
              <Plus size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
            
            <h2>Ingresar Mercancía</h2>
            {stockEntryProduct && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                Aumentar existencias para: <strong>{stockEntryProduct.name}</strong><br />
                Stock actual: {stockEntryProduct.stock} piezas.
              </p>
            )}

            <form onSubmit={handleStockEntrySubmit}>
              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="input-label">Cantidad de piezas recibidas</label>
                <input
                  type="number"
                  className="input-field"
                  value={stockAddAmount}
                  onChange={(e) => setStockAddAmount(e.target.value)}
                  placeholder="Ej. 12"
                  autoFocus
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.9rem" }}>
                <Check size={18} /> Actualizar Inventario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Elemento imprimible para la etiqueta térmica */}
      {printingLabelProduct && (
        <div className="label-print-area" style={{ display: "none" }}>
          <div style={{ fontSize: "7.5pt", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px" }}>ZABALEGUI</div>
          <div style={{ fontSize: "8.5pt", fontWeight: "600", maxHeight: "24px", overflow: "hidden", lineHeight: "1.1", marginBottom: "1px" }}>
            {printingLabelProduct.name}
          </div>
          {/* Código de barras usando la fuente Libre Barcode 39 */}
          <div style={{ 
            fontFamily: "'Libre Barcode 39', cursive", 
            fontSize: "26pt", 
            lineHeight: "1", 
            margin: "2px 0",
            letterSpacing: "3px"
          }}>
            {`*${printingLabelProduct.barcode}*`}
          </div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            width: "100%", 
            fontSize: "7.5pt", 
            borderTop: "1px dashed #333", 
            paddingTop: "2px",
            marginTop: "2px"
          }}>
            <span>{printingLabelProduct.barcode}</span>
            <strong style={{ fontSize: "8.5pt" }}>${printingLabelProduct.price.toFixed(2)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
