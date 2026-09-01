// App.jsx - Controlador de Navegación Global y Manejo de Sesiones
import React, { useState, useEffect } from "react";
import { Sparkles, LogOut, ShoppingBag, Award, BarChart2, Package, LogIn, AlertCircle, Briefcase } from "lucide-react";
import { db } from "./utils/db";

// Componentes
import PublicStore from "./components/PublicStore";
import Auth from "./components/Auth";
import POS from "./components/POS";
import Inventory from "./components/Inventory";
import Dashboard from "./components/Dashboard";
import ClientLoyalty from "./components/ClientLoyalty";
import Finances from "./components/Finances";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem("pos_session_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState(() => {
    const savedUser = sessionStorage.getItem("pos_session_user");
    const savedView = sessionStorage.getItem("pos_session_view");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      return savedView || (u.role === "gerente" ? "dashboard" : (u.role === "cajero" ? "pos" : "loyalty"));
    }
    return "store";
  });
  const [products, setProducts] = useState([]);
  
  // Custom Toast State
  const [toast, setToast] = useState({ message: "", type: "success", show: false });

  // Sincronizar sesión con sessionStorage (independiente por pestaña)
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("pos_session_user", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("pos_session_user");
      sessionStorage.removeItem("pos_session_view");
      localStorage.removeItem("pos_current_user");
      localStorage.removeItem("pos_current_view");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("pos_session_view", currentView);
    }
  }, [currentView, currentUser]);

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
    localStorage.removeItem("pos_current_user");
    localStorage.removeItem("pos_current_view");
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
        <div className="logo" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem" }} onClick={() => setCurrentView("store")}>
          <img 
            src="/favicon.jpg" 
            alt="Zabalegui Logo" 
            style={{ 
              width: "42px", 
              height: "42px", 
              borderRadius: "8px", 
              objectFit: "cover", 
              boxShadow: "var(--shadow-sm)",
              border: "1px solid rgba(255,255,255,0.2)"
            }} 
          />
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

          {currentUser && currentUser.role === "gerente" && (
            <button 
              className={`nav-link ${currentView === "finances" ? "active" : ""}`}
              onClick={() => setCurrentView("finances")}
            >
              <Briefcase size={18} /> Finanzas & Proveedores
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
          <Dashboard 
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateUser}
            products={products} 
            onRefreshProducts={refreshProducts} 
            showToast={showToast} 
          />
        )}
        
        {currentView === "finances" && currentUser && currentUser.role === "gerente" && (
          <Finances 
            currentUser={currentUser} 
            products={products} 
            showToast={showToast} 
          />
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
