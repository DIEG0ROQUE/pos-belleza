// PublicStore.jsx - Catálogo Público del Negocio de Belleza y Moda
import React, { useState } from "react";
import { Sparkles, ArrowRight, Heart, ShoppingBag, Gift, Phone, Award } from "lucide-react";

export default function PublicStore({ products, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const categories = ["Todos", "Maquillaje", "Belleza", "Ropa"];

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter(p => p.category === selectedCategory);

  // Filtrar productos destacados (ej. precios altos o aleatorios)
  const featuredProducts = products.slice(0, 3);
  // Promociones (ej. stock menor a 15)
  const promoProducts = products.filter(p => p.stock < 15).slice(0, 3);

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
        <h2 style={{ textAlign: "center", marginBottom: "3rem" }}>Nuestras Promociones & Tendencias</h2>
        <div className="grid grid-3">
          {featuredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-img-wrapper">
                <img className="product-img" src={product.image} alt={product.name} />
                <span className="product-badge">Tendencia</span>
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
    </div>
  );
}
