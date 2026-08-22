// Inventory.jsx - Control de Inventario y Entrada de Mercancía
import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, PackageOpen, AlertTriangle, Check, RefreshCw, Printer, Download, Tag, X } from "lucide-react";
import { db } from "../utils/db";

export default function Inventory({ currentUser, products, onRefreshProducts, showToast }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  
  // Modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Modal de Entrada Rápida de Stock
  const [showStockEntryModal, setShowStockEntryModal] = useState(false);
  const [stockEntryProduct, setStockEntryProduct] = useState(null);
  const [stockAddAmount, setStockAddAmount] = useState("");

  // Estado para la etiqueta que se está imprimiendo
  const [printingLabelProduct, setPrintingLabelProduct] = useState(null);

  // Campos de formulario para Producto
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Maquillaje");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("3");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState("");

  const categories = ["Maquillaje", "Belleza", "Ropa"];

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
    setCategory("Maquillaje");
    setPrice("");
    setCost("");
    setStock("");
    setMinStock("3");
    setBarcode(generateUniqueBarcode());
    setImage("https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"); // Placeholder estético
    setShowProductModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setCost(prod.cost.toString());
    setStock(prod.stock.toString());
    setMinStock(prod.minStock.toString());
    setBarcode(prod.barcode);
    setImage(prod.image);
    setShowProductModal(true);
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
      price: parseFloat(price),
      cost: parseFloat(cost),
      stock: parseInt(stock),
      minStock: parseInt(minStock),
      barcode,
      image: image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"
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
    if (window.confirm("¿Está seguro de eliminar este producto del inventario?")) {
      db.deleteProduct(id);
      onRefreshProducts();
      showToast("Producto eliminado del inventario.", "success");
    }
  };

  // Entrada rápida de mercancía
  const openStockEntryModal = (prod) => {
    setStockEntryProduct(prod);
    setStockAddAmount("");
    setShowStockEntryModal(true);
  };

  const handleStockEntrySubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(stockAddAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Ingrese una cantidad válida mayor a cero.", "error");
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
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchesCategory = categoryFilter === "Todos" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    // Formato ultra-compatible para WePrint móvil en español:
    // 1. SIN FILA DE ENCABEZADO (evita fallos de lectura de letras).
    // 2. Columna 1: Código de barras (solo dígitos).
    // 3. Columna 2: Nombre del producto (limpiando punto y comas).
    // 4. Columna 3: Precio con signo de pesos (ej. $100.00).
    // 5. Delimitador: Punto y coma (;) para que WePrint en español separe las columnas.
    const rows = products.map(p => [
      p.barcode,
      p.name.replace(/;/g, " "), // Limpiar punto y comas
      `$${p.price.toFixed(2)}`
    ]);

    const csvContent = rows.map(row => row.join(";")).join("\n");

    // Crear un blob estándar sin BOM
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `productos_zabalegui_weprint.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Catálogo exportado con éxito para WePrint.", "success");
  };

  const handlePrintDirectLabel = (product) => {
    setPrintingLabelProduct(product);
    // Esperar a que el DOM monte el contenedor imprimible
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

        {/* Solo administradores o gerente pueden crear productos nuevos, cajero puede ingresar stock */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Download size={18} /> Exportar para WePrint
          </button>
          {currentUser.role === "gerente" && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Controles de Filtro & Búsqueda */}
      <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por nombre o código de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["Todos", ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  border: categoryFilter === cat ? "none" : "1px solid var(--border-color)",
                  background: categoryFilter === cat ? "var(--primary-color)" : "white",
                  color: categoryFilter === cat ? "white" : "var(--text-dark)",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "var(--transition-fast)"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
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
              <th style={{ padding: "1rem" }}>Imagen</th>
              <th style={{ padding: "1rem" }}>Producto / Código</th>
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
                <td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <PackageOpen size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                  <p>No se encontraron productos en el inventario.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map(prod => {
                const isLowStock = prod.stock <= prod.minStock;
                return (
                  <tr key={prod.id} style={{ 
                    borderBottom: "1px solid #f0ebe9",
                    background: isLowStock ? "rgba(217, 119, 6, 0.03)" : "transparent"
                  }}>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <img src={prod.image} alt={prod.name} style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e0d9d6" }} />
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>{prod.name}</strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cod: {prod.barcode}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        fontSize: "0.8rem",
                        padding: "0.25rem 0.5rem",
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
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(prod)} style={{ padding: "0.4rem" }}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(prod.id)} style={{ padding: "0.4rem" }}>
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
          <div className="modal-content">
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
                  placeholder="Ej. Rímel pestañas 4D"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Categoría *</label>
                  <select 
                    className="input-field"
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

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
              </div>

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
      {/* Elemento imprimible para la etiqueta térmica (oculto en pantalla normal, visible en impresión) */}
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
