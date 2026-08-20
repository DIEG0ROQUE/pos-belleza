// PublicStore.jsx - Catálogo Público del Negocio de Belleza y Moda
import React, { useState } from "react";
import { Sparkles, ArrowRight, Heart, ShoppingBag, Gift, Phone, Award, MapPin, Clock, Edit, Check, X, Minus, Search } from "lucide-react";
import { db } from "../utils/db";

export default function PublicStore({ currentUser, products, onRefreshProducts, onNavigate, showToast }) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const categories = ["Todos", "Maquillaje", "Belleza", "Ropa"];

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter(p => p.category === selectedCategory);

  // Filtrar productos destacados por campo isTrending o isPromo
  const featuredProducts = products.filter(p => p.isTrending || p.isPromo).length > 0
    ? products.filter(p => p.isTrending || p.isPromo)
    : products.slice(0, 3);

  // Estados para modal de edición rápida para el gerente
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Maquillaje");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editIsTrending, setEditIsTrending] = useState(false);
  const [editIsPromo, setEditIsPromo] = useState(false);

  // Estados para modal de administración de destacados
  const [isManagingFeatured, setIsManagingFeatured] = useState(false);
  const [manageSearch, setManageSearch] = useState("");

  const startEditingProduct = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category || "Maquillaje");
    setEditPrice(product.price.toString());
    setEditImage(product.image || "");
    setEditIsTrending(!!product.isTrending);
    setIsEditing(true);
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
          setEditImage(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProductEdit = (e) => {
    e.preventDefault();
    if (!editName || !editPrice) {
      showToast("Llene los campos obligatorios.", "error");
      return;
    }

    const updated = {
      ...editingProduct,
      name: editName,
      category: editCategory,
      price: parseFloat(editPrice) || 0,
      image: editImage,
      isTrending: editIsTrending,
      isPromo: editIsPromo
    };

    try {
      db.updateProduct(updated);
      onRefreshProducts();
      setIsEditing(false);
      if (showToast) {
        showToast("Producto actualizado correctamente.", "success");
      }
    } catch (err) {
      if (showToast) {
        showToast("Error al guardar cambios: " + err.message, "error");
      }
    }
  };

  return (
    <div style={{ paddingBottom: "3rem" }}>
      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(74, 21, 37, 0.95), rgba(40, 10, 19, 0.95)), url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        padding: "5rem 2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow effect */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-30%",
          width: "80%",
          height: "150%",
          background: "radial-gradient(circle, rgba(197, 155, 142, 0.2) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "0.5rem 1rem",
            borderRadius: "30px",
            fontSize: "0.875rem",
            fontWeight: "600",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem"
          }}>
            <Sparkles size={16} color="#e8c3b9" /> Colección Exclusiva de Temporada
          </span>
          <h1 style={{
            fontSize: "3.5rem",
            color: "white",
            margin: "0 0 1.5rem 0",
            fontFamily: "'Playfair Display', serif",
            lineHeight: "1.2"
          }}>
            Realza tu Belleza Natural & Estilo Único
          </h1>
          <p style={{
            fontSize: "1.25rem",
            color: "rgba(255,255,255,0.85)",
            marginBottom: "2.5rem",
            fontWeight: "300"
          }}>
            Descubre las últimas tendencias en cosméticos orgánicos, maquillaje profesional y prendas diseñadas especialmente para ti.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <button className="btn btn-accent" onClick={() => onNavigate("auth")}>
              Únete al Club de Puntos <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary" style={{ background: "transparent", color: "white", borderColor: "rgba(255, 255, 255, 0.4)" }} onClick={() => {
              document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Ver Catálogo
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta de Fidelidad Publicidad */}
      <div style={{ maxWidth: "1200px", margin: "-3rem auto 4rem auto", padding: "0 1.5rem", position: "relative", zIndex: 10 }}>
        <div className="glass-panel" style={{
          padding: "2.5rem",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(251,249,248,0.9))",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          alignItems: "center"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(74, 21, 37, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-color)"
              }}>
                <Award size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.5rem" }}>Club de Puntos VIP</h3>
            </div>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              Regístrate gratis, acumula **10% en puntos** por cada compra que realices y canjéalos por tus productos favoritos gratis.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-gold)" }} />
              <span style={{ fontSize: "0.95rem" }}>Busca tus puntos con tu <strong>número celular</strong> en caja</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-gold)" }} />
              <span style={{ fontSize: "0.95rem" }}>Escanea tu <strong>código digital</strong> desde tu celular</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-gold)" }} />
              <span style={{ fontSize: "0.95rem" }}>Obtén <strong>20 puntos de regalo</strong> al registrarte hoy</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <button className="btn btn-primary" onClick={() => onNavigate("auth")}>
              Crear mi Cuenta Gratis
            </button>
          </div>
        </div>
      </div>
      {/* Promociones / Destacados */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 4rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ margin: 0 }}>Nuestras Promociones & Tendencias</h2>
          {currentUser && currentUser.role === "gerente" && (
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => {
                setManageSearch("");
                setIsManagingFeatured(true);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Sparkles size={16} /> Administrar Destacados
            </button>
          )}
        </div>
        <div className="grid grid-3">
          {featuredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-img-wrapper">
                <img className="product-img" src={product.image} alt={product.name} />
                <span className={`product-badge ${product.isPromo ? "promo" : ""}`}>
                  {product.isPromo ? "Promoción" : "Tendencia"}
                </span>
                
                {currentUser && currentUser.role === "gerente" && (
                  <>
                    <button 
                      onClick={() => startEditingProduct(product)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-color)",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        zIndex: 20,
                        transition: "var(--transition-fast)"
                      }}
                      title="Editar detalles de la promoción"
                    >
                      <Edit size={16} />
                    </button>

                    <button 
                      onClick={() => {
                        if (window.confirm(`¿Quitar "${product.name}" de la sección de destacados?`)) {
                          db.updateProduct({ ...product, isTrending: false, isPromo: false });
                          onRefreshProducts();
                          if (showToast) showToast("Producto removido de destacados.", "success");
                        }
                      }}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(201, 59, 84, 0.95)",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        zIndex: 20,
                        transition: "var(--transition-fast)"
                      }}
                      title="Quitar de destacados"
                    >
                      <Minus size={16} />
                    </button>
                  </>
                )}
              </div>
              <div className="product-info">
                <span className="product-cat">{product.category}</span>
                <h4 className="product-name">{product.name}</h4>
                <div className="product-price-row">
                  <span className="product-price">${product.price.toFixed(2)} MXN</span>
                  <span className="product-points">+{product.pointsReward} pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catálogo Principal */}
      <div id="catalog-section" style={{ background: "#f5f0ee", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}>
            <div>
              <h2 style={{ marginBottom: "0.5rem" }}>Explora Nuestras Colecciones</h2>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>Encuentra el maquillaje y las prendas perfectas para cada ocasión</p>
            </div>
            
            {/* Filtros de Categorías */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "20px",
                    border: selectedCategory === cat ? "none" : "1px solid var(--border-color)",
                    background: selectedCategory === cat ? "var(--primary-color)" : "white",
                    color: selectedCategory === cat ? "white" : "var(--text-dark)",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "var(--transition-fast)"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid del Catálogo */}
          <div className="grid grid-4">
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-img-wrapper">
                  <img className="product-img" src={product.image} alt={product.name} />
                  {product.stock <= 5 && (
                    <span className="product-badge promo">Últimas piezas</span>
                  )}
                  
                  {currentUser && currentUser.role === "gerente" && (
                    <button 
                      onClick={() => startEditingProduct(product)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-color)",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        zIndex: 20,
                        transition: "var(--transition-fast)"
                      }}
                      title="Editar detalles del producto"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>
                <div className="product-info">
                  <span className="product-cat">{product.category}</span>
                  <h4 className="product-name" style={{ fontSize: "0.95rem", minHeight: "2.5rem" }}>{product.name}</h4>
                  <div className="product-price-row">
                    <span className="product-price" style={{ fontSize: "1.1rem" }}>${product.price.toFixed(2)}</span>
                    <span className="product-points">+{product.pointsReward} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección Elegante de Contacto */}
      <div style={{ maxWidth: "1200px", margin: "4rem auto 2rem auto", padding: "0 1.5rem" }}>
        <div className="glass-panel" style={{
          padding: "3rem 2rem",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(251,249,248,0.9))",
          textAlign: "center"
        }}>
          <h2 style={{ marginBottom: "2rem" }}>Visítanos & Contáctanos</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2.5rem",
            justifyContent: "center",
            maxWidth: "900px",
            margin: "0 auto"
          }}>
            {/* Dirección */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(197, 155, 142, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-color)"
              }}>
                <MapPin size={22} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Dirección</h4>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.95rem" }}>
                Armenta y López 1025<br />Oaxaca Centro, CP 68000
              </p>
            </div>

            {/* Teléfono */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(197, 155, 142, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-color)"
              }}>
                <Phone size={22} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Teléfono</h4>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.95rem" }}>
                <a href="tel:9541184642" style={{ color: "inherit", textDecoration: "none", fontWeight: "600" }}>
                  954 118 4642
                </a>
              </p>
            </div>

            {/* Horario */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(197, 155, 142, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-color)"
              }}>
                <Clock size={22} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Horario de Atención</h4>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.95rem" }}>
                Lunes a Domingo<br />11:00 AM a 6:30 PM
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* MODAL EDITAR PRODUCTO (RÁPIDO) */}
      {isEditing && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <button className="modal-close" onClick={() => setIsEditing(false)}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem", color: "var(--primary-color)" }}>
              Editar Detalles del Producto
            </h2>

            <form onSubmit={handleSaveProductEdit}>
              <div className="input-group">
                <label className="input-label">Nombre del Producto *</label>
                <input
                  type="text"
                  className="input-field"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Categoría *</label>
                  <select 
                    className="input-field"
                    value={editCategory} 
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="Maquillaje">Maquillaje</option>
                    <option value="Belleza">Belleza</option>
                    <option value="Ropa">Ropa</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Precio al Público * ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Imagen del Producto</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {editImage && (
                    <img src={editImage} alt="Preview" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
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

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: "1.5rem 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={editIsTrending} 
                    onChange={(e) => setEditIsTrending(e.target.checked)} 
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
                  />
                  <span>Destacar en <strong>Tendencias</strong> (Página de inicio)</span>
                </label>
                
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={editIsPromo} 
                    onChange={(e) => setEditIsPromo(e.target.checked)} 
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
                  />
                  <span>Destacar en <strong>Promociones</strong> (Etiqueta Promoción)</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.9rem", marginTop: "1rem" }}>
                <Check size={18} /> Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}
      {/* MODAL ADMINISTRAR DESTACADOS */}
      {isManagingFeatured && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "600px", padding: "2rem" }}>
            <button className="modal-close" onClick={() => setIsManagingFeatured(false)}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", color: "var(--primary-color)" }}>
              Administrar Destacados de Portada
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Marca cuáles productos quieres mostrar en la sección de Tendencias y Promociones.
            </p>

            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
              <Search size={16} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                className="input-field"
                placeholder="Buscar producto por nombre..."
                value={manageSearch}
                onChange={(e) => setManageSearch(e.target.value)}
                style={{ paddingLeft: "36px", width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ maxHeight: "350px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingRight: "0.5rem" }}>
              {products
                .filter(p => p.name.toLowerCase().includes(manageSearch.toLowerCase()))
                .map(product => (
                  <div key={product.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    background: "#fbf8f7",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <img src={product.image} alt={product.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                      <div style={{ textAlign: "left" }}>
                        <strong style={{ fontSize: "0.9rem", display: "block" }}>{product.name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{product.category} • ${product.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={!!product.isTrending} 
                          onChange={(e) => {
                            const val = e.target.checked;
                            db.updateProduct({ ...product, isTrending: val });
                            onRefreshProducts();
                          }}
                          style={{ accentColor: "var(--primary-color)", width: "16px", height: "16px" }}
                        />
                        <span>Tendencia</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={!!product.isPromo} 
                          onChange={(e) => {
                            const val = e.target.checked;
                            db.updateProduct({ ...product, isPromo: val });
                            onRefreshProducts();
                          }}
                          style={{ accentColor: "var(--primary-color)", width: "16px", height: "16px" }}
                        />
                        <span>Promoción</span>
                      </label>
                    </div>
                  </div>
                ))}
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={() => setIsManagingFeatured(false)}
              style={{ width: "100%", marginTop: "1.5rem", padding: "0.8rem" }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
