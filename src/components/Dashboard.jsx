// Dashboard.jsx - Métricas e Indicadores Clave para el Gerente
import React, { useState } from "react";
import { DollarSign, ShoppingCart, UserCheck, TrendingUp, Award, AlertCircle, Calendar } from "lucide-react";
import { db } from "../utils/db";

export default function Dashboard({ products }) {
  const sales = db.getSales();
  const users = db.getUsers();
  const clients = users.filter(u => u.role === "cliente");

  // 1. KPI Cálculos
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  
  // Calcular Ganancia Neta = Suma de (Precio venta - Costo adquisición) * Cantidad para cada producto vendido
  const totalNetProfit = sales.reduce((sum, sale) => {
    const saleProfit = sale.items.reduce((itemSum, item) => {
      const originalProduct = products.find(p => p.id === item.id);
      const productCost = originalProduct ? originalProduct.cost : item.price * 0.4; // fallback
      const margin = item.price - productCost;
      return itemSum + (margin * item.quantity);
    }, 0);
    // Restar el descuento si se pagó con puntos
    return sum + (saleProfit - (sale.discount || 0));
  }, 0);

  const totalTransactions = sales.length;
  const registeredClientsCount = clients.length;

  // 2. Alertas de inventario bajo
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // 3. Productos más vendidos (y menos vendidos)
  const productSalesMap = {};
  // Inicializar todos los productos conocidos con 0
  products.forEach(p => {
    productSalesMap[p.id] = { name: p.name, qty: 0, category: p.category };
  });

  // Sumar ventas reales
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (productSalesMap[item.id]) {
        productSalesMap[item.id].qty += item.quantity;
      } else {
        // En caso de que se haya borrado el producto
        productSalesMap[item.id] = { name: item.name, qty: item.quantity, category: "Borrado" };
      }
    });
  });

  const productSalesList = Object.values(productSalesMap);
  const bestSellers = [...productSalesList].sort((a, b) => b.qty - a.qty).slice(0, 3);
  const worstSellers = [...productSalesList].filter(p => p.category !== "Borrado").sort((a, b) => a.qty - b.qty).slice(0, 3);

  // 4. Clientes más fieles (con más puntos acumulados)
  const topLoyalClients = [...clients].sort((a, b) => b.points - a.points).slice(0, 4);

  // 5. Datos para Gráfico de Ventas de los últimos 7 días
  // Generar etiquetas de los últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  // Sumar ventas por día
  const dailySales = last7Days.map(dateStr => {
    const daySales = sales.filter(s => s.date.startsWith(dateStr));
    const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
    return {
      date: dateStr,
      label: new Date(dateStr).toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
      value: revenue
    };
  });

  // Valores para dibujar el gráfico SVG
  const maxSaleValue = Math.max(...dailySales.map(d => d.value), 1000); // Mínimo 1000 para escala
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 40;

  // Generar puntos SVG del gráfico lineal
  const svgPoints = dailySales.map((d, index) => {
    const x = padding + (index * (chartWidth - 2 * padding) / (dailySales.length - 1));
    const y = chartHeight - padding - (d.value * (chartHeight - 2 * padding) / maxSaleValue);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Métricas & Dashboard</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Monitoreo en tiempo real del rendimiento de tu negocio.</p>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "white",
          padding: "0.5rem 1rem",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          fontSize: "0.9rem",
          fontWeight: "500"
        }}>
          <Calendar size={16} color="var(--accent-gold)" /> Últimos 7 Días
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-4" style={{ marginBottom: "2rem" }}>
        
        {/* Ventas Totales */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "50%", background: "#eef7f0",
            display: "flex", alignItems: "center", color: "#2b613a",
            justifyContent: "center"
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Ingresos Totales</span>
            <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem" }}>${totalSalesRevenue.toFixed(2)}</h3>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "50%", background: "rgba(197, 155, 142, 0.15)",
            display: "flex", alignItems: "center", color: "var(--primary-color)",
            justifyContent: "center"
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Ganancia Est.</span>
            <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", color: "var(--primary-color)" }}>${totalNetProfit.toFixed(2)}</h3>
          </div>
        </div>

        {/* Ventas Realizadas */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "50%", background: "#f2f7fc",
            display: "flex", alignItems: "center", color: "#3174b5",
            justifyContent: "center"
          }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Transacciones</span>
            <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem" }}>{totalTransactions}</h3>
          </div>
        </div>

        {/* Clientes Registrados */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "50%", background: "#f8f2fc",
            display: "flex", alignItems: "center", color: "#8a31b5",
            justifyContent: "center"
          }}>
            <UserCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Clientes VIP</span>
            <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem" }}>{registeredClientsCount}</h3>
          </div>
        </div>
      </div>

      {/* Fila de Gráfico e Inventario Bajo */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", marginBottom: "2rem", alignItems: "stretch" }}>
        
        {/* Gráfico de Ventas */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.25rem", margin: "0 0 1rem 0" }}>Tendencia de Ingresos Diarios</h3>
          
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
              {/* Grilla horizontal */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f0ebe9" strokeDasharray="4 4" />
              <line x1={padding} y1={(chartHeight) / 2} x2={chartWidth - padding} y2={(chartHeight) / 2} stroke="#f0ebe9" strokeDasharray="4 4" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#d6cdca" />

              {/* Relleno bajo la línea */}
              <path
                d={`M ${padding},${chartHeight - padding} 
                    ${svgPoints.split(" ").map(p => `L ${p}`).join(" ")} 
                    L ${chartWidth - padding},${chartHeight - padding} Z`}
                fill="url(#grad)"
                opacity="0.15"
              />

              {/* Gradiente para el relleno */}
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary-color)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* Línea del gráfico */}
              <polyline
                fill="none"
                stroke="var(--primary-color)"
                strokeWidth="3.5"
                points={svgPoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Puntos sobre la línea */}
              {dailySales.map((d, index) => {
                const x = padding + (index * (chartWidth - 2 * padding) / (dailySales.length - 1));
                const y = chartHeight - padding - (d.value * (chartHeight - 2 * padding) / maxSaleValue);
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="var(--primary-color)"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {d.value > 0 && (
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="var(--primary-color)"
                      >
                        ${d.value}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Etiquetas del eje X */}
              {dailySales.map((d, index) => {
                const x = padding + (index * (chartWidth - 2 * padding) / (dailySales.length - 1));
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - padding + 18}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="var(--text-muted)"
                    fontWeight="500"
                  >
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Alertas de Stock */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.25rem", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem", color: lowStockProducts.length > 0 ? "#c93b54" : "inherit" }}>
            <AlertCircle size={20} /> Stock Crítico ({lowStockProducts.length})
          </h3>
          
          <div style={{ flex: 1, overflowY: "auto", maxHeight: "200px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)" }}>
                🎉 Inventario completamente surtido.
              </div>
            ) : (
              lowStockProducts.map(prod => (
                <div key={prod.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0.75rem",
                  background: "rgba(201, 59, 84, 0.05)",
                  borderRadius: "8px",
                  borderLeft: "4px solid #c93b54"
                }}>
                  <div>
                    <strong style={{ fontSize: "0.9rem", display: "block" }}>{prod.name}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Cod: {prod.barcode}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: "700", color: "#c93b54", fontSize: "0.95rem" }}>{prod.stock} piezas</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Mínimo: {prod.minStock}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fila de Artículos Más / Menos vendidos & Top Clientes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", wrap: "wrap" }}>
        
        {/* Productos Más / Menos Vendidos */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", margin: "0 0 1rem 0" }}>Desempeño de Productos</h3>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "0.5rem" }}>🔥 MÁS VENDIDOS</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {bestSellers.map((prod, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "white", borderRadius: "6px", fontSize: "0.9rem" }}>
                  <span>{idx + 1}. {prod.name}</span>
                  <strong>{prod.qty} piezas vendidas</strong>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "0.5rem" }}>📉 MENOS VENDIDOS</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {worstSellers.map((prod, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "white", borderRadius: "6px", fontSize: "0.9rem" }}>
                  <span>{prod.name}</span>
                  <strong style={{ color: prod.qty === 0 ? "#c93b54" : "inherit" }}>{prod.qty} vendidas</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Clientes más Leales */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Award size={20} color="var(--accent-gold-bright)" /> Clientes Premium / VIP
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            Clientes con mayor acumulación de puntos de fidelidad en nuestro sistema.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {topLoyalClients.map((client, idx) => (
              <div key={client.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                background: "white",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(74, 21, 37, 0.03)"
              }}>
                <div>
                  <strong style={{ fontSize: "0.95rem", display: "block" }}>{client.name}</strong>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cel: {client.phone}</span>
                </div>
                <div style={{
                  background: "linear-gradient(135deg, var(--primary-color), var(--primary-light))",
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600"
                }}>
                  {client.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
