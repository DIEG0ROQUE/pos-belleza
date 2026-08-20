// App.jsx - Controlador de Navegación Global y Manejo de Sesiones
import React, { useState, useEffect } from "react";
import { Sparkles, LogOut, ShoppingBag, Award, BarChart2, Package, LogIn, AlertCircle } from "lucide-react";
import { db } from "./utils/db";

// Componentes
import PublicStore from "./components/PublicStore";
import Auth from "./components/Auth";
import POS from "./components/POS";
import Inventory from "./components/Inventory";
import Dashboard from "./components/Dashboard";
import ClientLoyalty from "./components/ClientLoyalty";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("store"); // store, auth, pos, inventory, dashboard, loyalty
  const [products, setProducts] = useState([]);
  
  // Custom Toast State
  const [toast, setToast] = useState({ message: "", type: "success", show: false });

  // Cargar productos iniciales
  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = () => {
    setProducts(db.getProducts());
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
    // Auto ocultar después de 4 segundos
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
    return () => clearTimeout(timer);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === "gerente") {
      setCurrentView("dashboard");
    } else if (user.role === "cajero") {
      setCurrentView("pos");
    } else {
      setCurrentView("loyalty");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("store");
    showToast("Sesión cerrada correctamente.", "success");
  };

  // Callback para refrescar el usuario cuando canjea puntos
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="app-container">
      {/* Header Premium Nav */}
      <header className="header">
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => setCurrentView("store")}>
          <div className="logo-icon" style={{ fontFamily: "'Playfair Display', serif", fontWeight: "bold" }}>ZB</div>
          <span className="brand-font" style={{ fontSize: "1.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Zabalegui
          </span>
        </div>

        <nav className="nav-links">
          {/* Vistas comunes */}
          <button 
            className={`nav-link ${currentView === "store" ? "active" : ""}`}
            onClick={() => setCurrentView("store")}
          >
            <ShoppingBag size={18} /> Catálogo
          </button>

          {/* Vistas basadas en rol */}
          {!currentUser && (
            <button 
              className={`nav-link ${currentView === "auth" ? "active" : ""}`}
              onClick={() => setCurrentView("auth")}
            >
              <LogIn size={18} /> Entrar / Registrarse
            </button>
          )}

          {currentUser && currentUser.role === "cliente" && (
            <button 
              className={`nav-link ${currentView === "loyalty" ? "active" : ""}`}
              onClick={() => setCurrentView("loyalty")}
            >
              <Award size={18} /> Mi Tarjeta VIP
            </button>
          )}

          {currentUser && (currentUser.role === "cajero" || currentUser.role === "gerente") && (
            <button 
              className={`nav-link ${currentView === "pos" ? "active" : ""}`}
              onClick={() => setCurrentView("pos")}
            >
              <ShoppingBag size={18} /> Punto de Venta (Caja)
            </button>
          )}

          {currentUser && (currentUser.role === "cajero" || currentUser.role === "gerente") && (
            <button 
              className={`nav-link ${currentView === "inventory" ? "active" : ""}`}
              onClick={() => setCurrentView("inventory")}
            >
              <Package size={18} /> Inventario
            </button>
          )}

          {currentUser && currentUser.role === "gerente" && (
            <button 
              className={`nav-link ${currentView === "dashboard" ? "active" : ""}`}
              onClick={() => setCurrentView("dashboard")}
            >
              <BarChart2 size={18} /> Dashboard (Métricas)
            </button>
          )}

          {/* Botón de Logout */}
          {currentUser && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span className="desktop-only-text" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Hola, <strong>{currentUser.name.split(" ")[0]}</strong>
              </span>
              <button className="nav-button logout-btn" onClick={handleLogout}>
                <LogOut size={16} /> Salir
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1 }}>
        {currentView === "store" && (
          <PublicStore 
            currentUser={currentUser} 
            products={products} 
            onRefreshProducts={refreshProducts} 
            onNavigate={setCurrentView} 
            showToast={showToast} 
          />
        )}
        
        {currentView === "auth" && (
          <Auth onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        )}
        
        {currentView === "pos" && currentUser && (
          <POS 
            currentUser={currentUser} 
            products={products} 
            onRefreshProducts={refreshProducts} 
            showToast={showToast} 
          />
        )}
        
        {currentView === "inventory" && currentUser && (
          <Inventory 
            currentUser={currentUser} 
            products={products} 
            onRefreshProducts={refreshProducts} 
            showToast={showToast} 
          />
        )}
        
        {currentView === "dashboard" && currentUser && currentUser.role === "gerente" && (
          <Dashboard products={products} />
        )}
        
        {currentView === "loyalty" && currentUser && currentUser.role === "cliente" && (
          <ClientLoyalty 
            currentUser={currentUser} 
            onUpdateUser={handleUpdateUser} 
            showToast={showToast} 
          />
        )}
      </main>

      {/* Custom Global Toast Notifications */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <AlertCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Footer Premium */}
      <footer className="footer">
        <div className="footer-logo" style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>Zabalegui</div>
        <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}>Punto de Venta, Inventario & Fidelización VIP</p>
        <p style={{ margin: "0.5rem 0 1rem 0", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.5)" }}>
          Dirección: Armenta y López 1025 | Tel: 9541184642 | Horario: 11:00 AM - 6:30 PM
        </p>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.4)" }}>
          © {new Date().getFullYear()} Zabalegui. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
