// ClientLoyalty.jsx - Portal de Puntos de Fidelización para el Cliente Registrado
import React, { useState } from "react";
import { Award, Gift, Calendar, Sparkles, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";
import { db } from "../utils/db";

export default function ClientLoyalty({ currentUser, onUpdateUser, showToast }) {
  const [rewards, setRewards] = useState(db.getRewards());
  
  // Generador de código de barras virtual mediante CSS (líneas de diferente grosor)
  // Utiliza el número de teléfono del cliente como semilla para el código
  const renderVirtualBarcode = (phone) => {
    const bars = [];
    const seed = phone || "5551234567";
    // Generar 35 barras basadas en los dígitos del teléfono
    for (let i = 0; i < 38; i++) {
      const charCode = seed.charCodeAt(i % seed.length);
      const isThick = charCode % 3 === 0;
      const isMedium = charCode % 3 === 1;
      const width = isThick ? "4px" : (isMedium ? "2px" : "1px");
      const gap = charCode % 2 === 0 ? "2px" : "1px";
      bars.push(
        <div key={i} style={{
          width: width,
          height: "40px",
          backgroundColor: "#2c1a20",
          marginRight: gap
        }} />
      );
    }
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #e0dcdb" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {bars}
        </div>
      </div>
    );
  };

  const handleRedeem = (reward) => {
    if (currentUser.points < reward.pointsCost) {
      showToast("No tienes suficientes puntos para canjear este premio.", "error");
      return;
    }

    if (window.confirm(`¿Estás seguro de canjear "${reward.name}" por ${reward.pointsCost} puntos?`)) {
      try {
        db.redeemReward(currentUser.id, reward.id);
        
        // Obtener datos de usuario actualizados de localStorage
        const updatedUsers = db.getUsers();
        const updatedUser = updatedUsers.find(u => u.id === currentUser.id);
        
        // Notificar al padre para refrescar la sesión del usuario actual
        onUpdateUser(updatedUser);
        showToast(`¡Premio canjeado con éxito! Reclámalo en caja con tu código.`, "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  return (
    <div style={{ padding: "2.5rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Saludo inicial */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Mi Club de Puntos</h1>
        <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>
          Bienvenido, <strong>{currentUser.name}</strong>. Aquí puedes monitorear tus beneficios VIP.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", marginBottom: "3rem", alignItems: "start" }}>
        
        {/* TARJETA DIGITAL VIP */}
        <div style={{
          background: "linear-gradient(135deg, #4a1525 0%, #201317 100%)",
          borderRadius: "var(--radius-lg)",
          color: "white",
          padding: "2rem",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          {/* Decoración abstracta de oro rosa */}
          <div style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(197,155,142,0.3) 0%, transparent 70%)"
          }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
            <div>
              <span className="brand-font" style={{ color: "var(--accent-gold)", fontSize: "1.4rem", letterSpacing: "0.05em" }}>
                BEAUTY CLUB
              </span>
              <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", marginTop: "2px" }}>
                Miembro VIP Premium
              </span>
            </div>
            <Sparkles size={24} color="var(--accent-gold-bright)" />
          </div>

          {/* Código de Barras Scannable */}
          <div style={{ margin: "1.5rem 0", zIndex: 1, textAlign: "center" }}>
            {renderVirtualBarcode(currentUser.phone)}
            <span style={{ display: "block", fontSize: "0.85rem", fontFamily: "monospace", letterSpacing: "3px", color: "var(--accent-gold)", marginTop: "6px" }}>
              {currentUser.phone}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 1 }}>
            <div>
              <span style={{ display: "block", fontSize: "0.65rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Titular</span>
              <strong style={{ fontSize: "1.05rem", color: "white" }}>{currentUser.name}</strong>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "block", fontSize: "0.65rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Código de Lealtad</span>
              <strong style={{ fontSize: "1.05rem", color: "var(--accent-gold-bright)", fontFamily: "monospace" }}>VIP-{currentUser.id.slice(-6).toUpperCase()}</strong>
            </div>
          </div>
        </div>

        {/* CONTENEDOR DE PUNTOS ACUMULADOS */}
        <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "220px", textAlign: "center" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(74, 21, 37, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary-color)",
            marginBottom: "1rem"
          }}>
            <Award size={32} />
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600" }}>Puntos Disponibles</span>
          <h2 style={{ fontSize: "3rem", margin: "0.25rem 0 0.5rem 0", color: "var(--primary-color)" }}>{currentUser.points}</h2>
          
          <div style={{
            background: "rgba(74, 21, 37, 0.04)",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            fontSize: "0.85rem",
            color: "var(--primary-color)",
            fontWeight: "500"
          }}>
            Equivale a <strong>${currentUser.points}.00 MXN</strong> de descuento en tu próxima compra
          </div>
        </div>
      </div>

      {/* RECOMPENSAS CANJEABLES */}
      <h2 style={{ marginBottom: "1.5rem" }}>Catálogo de Premios VIP</h2>
      <div className="grid grid-3" style={{ marginBottom: "3.5rem" }}>
        {rewards.map(reward => {
          const isAffordable = currentUser.points >= reward.pointsCost;
          return (
            <div className="glass-panel" key={reward.id} style={{
              padding: "1.5rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: isAffordable ? "1px solid rgba(74,21,37,0.15)" : "1px solid var(--border-color)",
              opacity: isAffordable ? 1 : 0.8
            }}>
              <div>
                <span style={{
                  fontSize: "0.75rem",
                  color: reward.category === "Descuentos" ? "#8a31b5" : "#3174b5",
                  background: reward.category === "Descuentos" ? "#fbf2fc" : "#f2f7fc",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontWeight: "600"
                }}>{reward.category}</span>
                
                <h3 style={{ fontSize: "1.15rem", margin: "0.5rem 0", lineHeight: "1.3" }}>{reward.name}</h3>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <span style={{ fontWeight: "700", color: "var(--primary-color)", fontSize: "1.1rem" }}>
                  {reward.pointsCost} <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "var(--text-muted)" }}>puntos</span>
                </span>

                <button
                  onClick={() => handleRedeem(reward)}
                  className={`btn btn-sm ${isAffordable ? "btn-primary" : "btn-disabled"}`}
                  disabled={!isAffordable}
                >
                  <Gift size={14} /> Canjear
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* HISTORIAL DE PUNTOS */}
      <h2 style={{ marginBottom: "1.5rem" }}>Historial de Movimientos</h2>
      <div className="glass-panel" style={{ overflowX: "auto", borderRadius: "var(--radius-md)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(74, 21, 37, 0.04)", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "1rem" }}>Fecha</th>
              <th style={{ padding: "1rem" }}>Descripción</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {!currentUser.pointHistory || currentUser.pointHistory.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  Aún no registras movimientos en tu historial.
                </td>
              </tr>
            ) : (
              currentUser.pointHistory.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f0ebe9" }}>
                  <td style={{ padding: "1rem", fontSize: "0.9rem" }}>{item.date}</td>
                  <td style={{ padding: "1rem", fontSize: "0.95rem" }}>{item.description}</td>
                  <td style={{ padding: "1rem", textAlign: "right", fontSize: "1rem", fontWeight: "700", color: item.points >= 0 ? "#2b613a" : "#c93b54" }}>
                    {item.points >= 0 ? `+${item.points}` : item.points} pts
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
