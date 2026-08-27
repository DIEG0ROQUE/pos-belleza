// Finances.jsx - Gestión de Proveedores, Registro de Gastos y Balance Mensual de Utilidades
import React, { useState, useEffect } from "react";
import { 
  Users, DollarSign, Plus, Trash2, Edit, Save, X, Phone, Mail, 
  MapPin, Tag, FileText, ChevronRight, PieChart, TrendingDown, TrendingUp, Info 
} from "lucide-react";
import { db } from "../utils/db";

export default function Finances({ currentUser, products, showToast }) {
  // Pestañas internas de la sección de Finanzas: "suppliers" | "expenses" | "summary"
  const [financeTab, setFinanceTab] = useState("suppliers");

  // --- ESTADOS DE PROVEEDORES ---
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  
  // Campos del proveedor
  const [supName, setSupName] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supAddress, setSupAddress] = useState("");
  const [supCategory, setSupCategory] = useState("Maquillaje & Cosméticos");
  const [supNotes, setSupNotes] = useState("");
  const [supImage, setSupImage] = useState("");

  // --- ESTADOS DE GASTOS ---
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  // Campos del gasto
  const [expCategory, setExpCategory] = useState("Proveedor");
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [expDate, setExpDate] = useState("");

  // Carga inicial
  useEffect(() => {
    refreshSuppliers();
    refreshExpenses();
  }, []);

  const refreshSuppliers = () => {
    setSuppliers(db.getSuppliers());
  };

  const refreshExpenses = () => {
    setExpenses(db.getExpenses());
  };

  // --- ACCIONES DE PROVEEDORES ---
  const openAddSupplier = () => {
    setEditingSupplier(null);
    setSupName("");
    setSupPhone("");
    setSupEmail("");
    setSupAddress("");
    setSupCategory("Maquillaje & Cosméticos");
    setSupNotes("");
    setSupImage("https://images.unsplash.com/photo-1556740758-90de374c12ad?w=150&q=80");
    setShowSupplierModal(true);
  };

  const openEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setSupName(sup.name);
    setSupPhone(sup.phone);
    setSupEmail(sup.email);
    setSupAddress(sup.address);
    setSupCategory(sup.category);
    setSupNotes(sup.notes || "");
    setSupImage(sup.image || "");
    setShowSupplierModal(true);
  };

  const handleSupplierImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
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
          setSupImage(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!supName || !supPhone) {
      showToast("Nombre y Teléfono son requeridos.", "error");
      return;
    }

    const supplierData = {
      name: supName,
      phone: supPhone,
      email: supEmail,
      address: supAddress,
      category: supCategory,
      notes: supNotes,
      image: supImage || "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=150&q=80"
    };

    if (editingSupplier) {
      db.updateSupplier({ ...supplierData, id: editingSupplier.id });
      showToast("Proveedor actualizado.", "success");
    } else {
      db.addSupplier(supplierData);
      showToast("Proveedor agregado con éxito.", "success");
    }

    refreshSuppliers();
    setShowSupplierModal(false);
  };

  const handleDeleteSupplier = (id) => {
    if (window.confirm("¿Está seguro de eliminar a este proveedor?")) {
      db.deleteSupplier(id);
      showToast("Proveedor eliminado.", "success");
      refreshSuppliers();
    }
  };

  // --- ACCIONES DE GASTOS ---
  const openAddExpense = () => {
    setExpCategory("Proveedor");
    setExpDescription("");
    setExpAmount("");
    setExpNotes("");
    setExpDate(new Date().toISOString().split("T")[0]);
    setShowExpenseModal(true);
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expDescription || !expAmount) {
      showToast("Descripción e Importe son requeridos.", "error");
      return;
    }

    const expenseData = {
      category: expCategory,
      description: expDescription,
      amount: parseFloat(expAmount),
      notes: expNotes,
      date: expDate ? `${expDate} 12:00:00` : new Date().toISOString().replace("T", " ").slice(0, 19)
    };

    db.addExpense(expenseData);
    showToast("Gasto registrado con éxito.", "success");
    refreshExpenses();
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro de gasto?")) {
      db.deleteExpense(id);
      showToast("Gasto eliminado.", "success");
      refreshExpenses();
    }
  };

  // --- OPERACIONES DE BALANCE FINANCIERO (RESUMEN) ---
  const sales = db.getSales();
  
  // Rango del mes seleccionado
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  // Ventas de este mes
  const currentMonthSales = sales.filter(s => s.date.startsWith(selectedMonth));
  
  // Ventas en Renta de Espacio vs Ventas Propias Zabalegui en este mes
  let ownSalesRevenue = 0;
  let spaceRentalConsignmentSales = 0; // Ventas de mercancía a entregar
  let cogs = 0; // Costo de adquisición de mercancía propia vendida

  currentMonthSales.forEach(sale => {
    // Si la venta se canceló lógicamente o está vacía, no cuenta (aquí las ventas normales)
    let saleCogs = 0;
    
    sale.items.forEach(item => {
      if (item.isSpaceRental) {
        spaceRentalConsignmentSales += item.price * item.quantity;
      } else {
        ownSalesRevenue += item.price * item.quantity;
        // Buscar costo de adquisición
        const originalProduct = products.find(p => p.id === item.id);
        const costPerItem = originalProduct ? originalProduct.cost : item.price * 0.4;
        saleCogs += costPerItem * item.quantity;
      }
    });

    // Descontar proporcionalmente el descuento por puntos de fidelización si aplica
    cogs += saleCogs;
  });

  // Ajustar ingresos propios descontando el valor de puntos VIP canjeados
  const totalDiscounts = currentMonthSales.reduce((sum, s) => sum + (s.discount || 0), 0);
  const netOwnSalesRevenue = ownSalesRevenue - totalDiscounts;

  // Gastos de este mes
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
  
  // Desglose de Gastos
  const expensesByCategory = {
    Renta: 0,
    Sueldos: 0,
    Servicios: 0,
    Internet: 0,
    Proveedor: 0,
    Otros: 0
  };

  let totalExpensesSum = 0;
  currentMonthExpenses.forEach(e => {
    const cat = expensesByCategory[e.category] !== undefined ? e.category : "Otros";
    expensesByCategory[cat] += e.amount;
    totalExpensesSum += e.amount;
  });

  // Margen Bruto
  const grossProfit = netOwnSalesRevenue - cogs;

  // Renta Fija Mensual cobrada por espacios (Ingreso Adicional)
  // Permite al usuario capturar cuántos espacios renta y a qué precio para sumarlo
  const [fixedSpaceRentalIncomeInput, setFixedSpaceRentalIncomeInput] = useState("2500");
  const fixedSpaceRentalIncome = parseFloat(fixedSpaceRentalIncomeInput) || 0;

  // Utilidad Neta Total
  const netProfit = grossProfit + fixedSpaceRentalIncome - totalExpensesSum;

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Finanzas & Proveedores</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>
            Administra tus contactos de surtido, bitácora de egresos y balance general de utilidades.
          </p>
        </div>
      </div>

      {/* Selector de Sub-Pestañas */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <button
          onClick={() => setFinanceTab("suppliers")}
          className={`nav-button ${financeTab === "suppliers" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: financeTab === "suppliers" ? "none" : "1px solid var(--border-color)",
            background: financeTab === "suppliers" ? "var(--primary-color)" : "white",
            color: financeTab === "suppliers" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <Users size={16} /> Contactos de Proveedores
        </button>
        <button
          onClick={() => setFinanceTab("expenses")}
          className={`nav-button ${financeTab === "expenses" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: financeTab === "expenses" ? "none" : "1px solid var(--border-color)",
            background: financeTab === "expenses" ? "var(--primary-color)" : "white",
            color: financeTab === "expenses" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <DollarSign size={16} /> Bitácora de Gastos
        </button>
        <button
          onClick={() => setFinanceTab("summary")}
          className={`nav-button ${financeTab === "summary" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: financeTab === "summary" ? "none" : "1px solid var(--border-color)",
            background: financeTab === "summary" ? "var(--primary-color)" : "white",
            color: financeTab === "summary" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <PieChart size={16} /> Balance Mensual (P&L)
        </button>
      </div>

      {/* --- SECCIÓN 1: CONTACTOS DE PROVEEDORES --- */}
      {financeTab === "suppliers" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0 }}>Catálogo de Proveedores</h3>
            <button className="btn btn-primary" onClick={openAddSupplier} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Plus size={18} /> Nuevo Proveedor
            </button>
          </div>

          {suppliers.length === 0 ? (
            <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
              No hay proveedores registrados. Haz clic en "Nuevo Proveedor" para comenzar.
            </div>
          ) : (
            <div className="grid grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {suppliers.map(sup => (
                <div className="glass-panel" key={sup.id} style={{ 
                  padding: "1.25rem", 
                  position: "relative", 
                  display: "flex", 
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "220px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px"
                }}>
                  <div>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                      <img src={sup.image} alt={sup.name} style={{ width: "65px", height: "65px", objectFit: "cover", borderRadius: "10px", border: "1px solid var(--border-color)" }} />
                      <div>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700", color: "var(--primary-color)", background: "rgba(197, 146, 146, 0.15)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                          {sup.category}
                        </span>
                        <h4 style={{ margin: "0.3rem 0 0 0", fontSize: "1rem", fontWeight: "700" }}>{sup.name}</h4>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.4rem", color: "var(--text-dark)", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Phone size={14} style={{ color: "var(--text-muted)" }} /> <strong>Tel:</strong> {sup.phone}
                      </div>
                      {sup.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Mail size={14} style={{ color: "var(--text-muted)" }} /> <strong>Email:</strong> {sup.email}
                        </div>
                      )}
                      {sup.address && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <MapPin size={14} style={{ color: "var(--text-muted)" }} /> <strong>Dir:</strong> {sup.address}
                        </div>
                      )}
                      {sup.notes && (
                        <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", background: "#fbf9f8", padding: "0.4rem", borderRadius: "6px" }}>
                          "{sup.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditSupplier(sup)} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.25rem" }}>
                      <Edit size={12} /> Editar
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSupplier(sup.id)} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.25rem" }}>
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- SECCIÓN 2: BITÁCORA DE GASTOS --- */}
      {financeTab === "expenses" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0 }}>Bitácora de Egresos Operativos</h3>
            <button className="btn btn-primary" onClick={openAddExpense} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Plus size={18} /> Registrar Gasto
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
              No hay egresos registrados. Haz clic en "Registrar Gasto" para añadir uno.
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: "1.25rem" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(49, 29, 32, 0.02)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Fecha</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Categoría</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Descripción</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Notas</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Importe</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => (
                      <tr key={exp.id} style={{ borderBottom: "1px solid #f0ebe9" }}>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", fontWeight: "600" }}>
                          {new Date(exp.date).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{
                            fontSize: "0.75rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "8px",
                            fontWeight: "600",
                            background: exp.category === "Renta" ? "rgba(197, 146, 146, 0.15)" : 
                                        exp.category === "Sueldos" ? "rgba(43, 97, 58, 0.1)" :
                                        exp.category === "Proveedor" ? "rgba(217, 119, 6, 0.1)" : "rgba(100, 116, 139, 0.1)",
                            color: exp.category === "Renta" ? "var(--primary-color)" :
                                   exp.category === "Sueldos" ? "#2b613a" :
                                   exp.category === "Proveedor" ? "#d97706" : "var(--text-dark)"
                          }}>
                            {exp.category}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}>{exp.description}</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          {exp.notes || "-"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", fontWeight: "700", textAlign: "right", color: "#c93b54" }}>
                          -${exp.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteExpense(exp.id)}
                            style={{ padding: "0.3rem 0.6rem" }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SECCIÓN 3: BALANCE FINANCIERO MENSUAL (P&L) --- */}
      {financeTab === "summary" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0 }}>Estado de Resultados Mensual</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.2rem 0 0 0" }}>
                Resumen detallado de ingresos por ventas, rentas de espacio cobradas, costo de ventas y gastos fijos.
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600" }}>Seleccionar Mes:</label>
              <input 
                type="month" 
                className="input-field" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: "180px", padding: "0.4rem 0.75rem" }}
              />
            </div>
          </div>

          {/* Grid de Totales Principales */}
          <div className="grid grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "5px solid #2b613a" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Ingresos Netos (Propios + Renta)</span>
              <h2 style={{ fontSize: "2rem", margin: "0.25rem 0", color: "#2b613a" }}>
                ${(netOwnSalesRevenue + fixedSpaceRentalIncome).toFixed(2)}
              </h2>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Ventas Propias: ${netOwnSalesRevenue.toFixed(2)} | Cobro Renta: ${fixedSpaceRentalIncome.toFixed(2)}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem", borderLeft: "5px solid #c93b54" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Egresos Totales (Adquisición + Gastos)</span>
              <h2 style={{ fontSize: "2rem", margin: "0.25rem 0", color: "#c93b54" }}>
                ${(cogs + totalExpensesSum).toFixed(2)}
              </h2>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Costo de Mercancía: ${cogs.toFixed(2)} | Gastos Fijos: ${totalExpensesSum.toFixed(2)}
              </div>
            </div>

            <div className="glass-panel" style={{ 
              padding: "1.5rem", 
              borderLeft: `5px solid ${netProfit >= 0 ? "#2b613a" : "#c93b54"}`,
              background: netProfit >= 0 ? "rgba(43, 97, 58, 0.02)" : "rgba(201, 59, 84, 0.02)"
            }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Utilidad Neta (Ganancia)</span>
              <h2 style={{ fontSize: "2rem", margin: "0.25rem 0", color: netProfit >= 0 ? "#2b613a" : "#c93b54" }}>
                {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
              </h2>
              <div style={{ fontSize: "0.8rem", fontWeight: "600", color: netProfit >= 0 ? "green" : "red", marginTop: "4px" }}>
                {netProfit >= 0 ? "▲ Rendimiento Positivo" : "▼ Pérdida Operativa"}
              </div>
            </div>
          </div>

          {/* Desglose Detallado de Utilidades (P&L Sheet) */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", alignItems: "start" }}>
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h4 style={{ margin: "0 0 1.25rem 0", fontSize: "1.1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                Estado de Ganancias & Pérdidas
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                
                {/* INGRESOS */}
                <div>
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "green", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>1. INGRESOS</h5>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.95rem" }}>
                    <span>Ventas de Artículos Propios (Neto):</span>
                    <strong>${netOwnSalesRevenue.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.95rem" }}>
                    <span>Cobros de Renta de Espacio (Consignación):</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Fijo mensual:</span>
                      <input 
                        type="number"
                        className="input-field"
                        value={fixedSpaceRentalIncomeInput}
                        onChange={(e) => setFixedSpaceRentalIncomeInput(e.target.value)}
                        style={{ width: "80px", padding: "0.15rem 0.4rem", margin: 0, textAlign: "right" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "1rem", fontWeight: "700", borderTop: "1px solid #eee" }}>
                    <span>Ingresos Totales:</span>
                    <span>${(netOwnSalesRevenue + fixedSpaceRentalIncome).toFixed(2)}</span>
                  </div>
                </div>

                {/* COSTO DE VENTAS */}
                <div style={{ marginTop: "0.5rem" }}>
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#c93b54", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>2. COSTO DE VENTAS</h5>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.95rem" }}>
                    <span>Costo de Adquisición de Inventario Propio Vendido:</span>
                    <strong style={{ color: "#c93b54" }}>-${cogs.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "1rem", fontWeight: "700", borderTop: "1px solid #eee" }}>
                    <span>Ganancia Bruta (Ingresos - Costo Adquisición):</span>
                    <span style={{ color: "green" }}>${grossProfit.toFixed(2)}</span>
                  </div>
                </div>

                {/* GASTOS OPERATIVOS */}
                <div style={{ marginTop: "0.5rem" }}>
                  <h5 style={{ margin: "0 0 0.5rem 0", color: "#c93b54", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>3. EGRESOS OPERATIVOS (Gastos Registrados)</h5>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.9rem" }}>
                    <span>Renta de Local:</span>
                    <span>-${expensesByCategory.Renta.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.9rem" }}>
                    <span>Sueldos de Empleados:</span>
                    <span>-${expensesByCategory.Sueldos.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.9rem" }}>
                    <span>Servicios Básicos (Luz, Agua):</span>
                    <span>-${expensesByCategory.Servicios.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.9rem" }}>
                    <span>Internet & Telefonía:</span>
                    <span>-${expensesByCategory.Internet.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.9rem" }}>
                    <span>Pagos Directos a Proveedor:</span>
                    <span>-${expensesByCategory.Proveedor.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.9rem" }}>
                    <span>Otros Gastos Varios:</span>
                    <span>-${expensesByCategory.Otros.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "1rem", fontWeight: "700", borderTop: "1px solid #eee", color: "#c93b54" }}>
                    <span>Total Gastos de Operación:</span>
                    <span>-${totalExpensesSum.toFixed(2)}</span>
                  </div>
                </div>

                {/* UTILIDAD NETA FINAL */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  padding: "0.8rem", 
                  fontSize: "1.1rem", 
                  fontWeight: "700", 
                  background: netProfit >= 0 ? "rgba(43, 97, 58, 0.08)" : "rgba(201, 59, 84, 0.08)",
                  borderRadius: "8px",
                  color: netProfit >= 0 ? "#2b613a" : "#c93b54",
                  marginTop: "0.75rem"
                }}>
                  <span>Utilidad Neta (Rendimiento Final):</span>
                  <span>{netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`} MXN</span>
                </div>

              </div>
            </div>

            {/* Panel Informativo de Apoyo */}
            <div className="glass-panel" style={{ padding: "1.25rem", background: "rgba(49, 29, 32, 0.01)" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Info size={16} color="var(--accent-gold)" /> Auditoría del Mes
              </h4>
              
              <div style={{ fontSize: "0.85rem", lineHeight: "1.45", color: "var(--text-muted)" }}>
                <p style={{ marginBottom: "0.75rem" }}>
                  <strong>Aviso Contable:</strong> Los ingresos por concepto de <em>"Renta de Espacio (Consignación)"</em> son calculados sobre el cobro fijo mensual que acordaste con la empresa externa.
                </p>
                <p style={{ marginBottom: "0.75rem" }}>
                  Las ventas brutas de dichos productos en consignación sumaron <strong>${spaceRentalConsignmentSales.toFixed(2)}</strong> este mes. Este dinero no se considera ingreso bruto tuyo, pues se entregará íntegramente a la empresa arrendadora.
                </p>
                <p>
                  Asegúrate de registrar tus pagos de sueldos de empleados, renta, luz e internet en la pestaña <strong>Bitácora de Gastos</strong> para mantener este reporte financiero 100% verídico.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL AGREGAR / EDITAR PROVEEDOR --- */}
      {showSupplierModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <button className="modal-close" onClick={() => setShowSupplierModal(false)}>
              <X size={20} />
            </button>

            <h2>{editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Registra los datos de contacto y surtido de tus distribuidores de mercancía.
            </p>

            <form onSubmit={handleSaveSupplier}>
              <div className="input-group">
                <label className="input-label">Nombre del Proveedor / Empresa *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={supName} 
                  onChange={(e) => setSupName(e.target.value)} 
                  placeholder="Ej. Distribuidora Textil del Centro"
                  required 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Teléfono de Contacto *</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    value={supPhone} 
                    onChange={(e) => setSupPhone(e.target.value)} 
                    placeholder="Ej. 9511234567"
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Categoría de Surtido</label>
                  <select 
                    className="input-field" 
                    value={supCategory} 
                    onChange={(e) => setSupCategory(e.target.value)}
                  >
                    <option value="Maquillaje & Cosméticos">Maquillaje & Cosméticos</option>
                    <option value="Ropa & Vestidos">Ropa & Vestidos</option>
                    <option value="Perfumería">Perfumería</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={supEmail} 
                  onChange={(e) => setSupEmail(e.target.value)} 
                  placeholder="Ej. contacto@empresa.com" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Dirección Física</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={supAddress} 
                  onChange={(e) => setSupAddress(e.target.value)} 
                  placeholder="Ej. Calle Reforma #102, Oaxaca Centro" 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Notas Adicionales</label>
                <textarea 
                  className="input-field" 
                  value={supNotes} 
                  onChange={(e) => setSupNotes(e.target.value)} 
                  placeholder="Notas, días de entrega, acuerdos..."
                  rows={2} 
                  style={{ resize: "none" }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="input-label">Foto / Logotipo</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {supImage && (
                    <img src={supImage} alt="Preview" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color)" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleSupplierImageChange}
                      style={{ fontSize: "0.85rem" }} 
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                <Save size={18} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} /> Guardar Proveedor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL AGREGAR GASTO --- */}
      {showExpenseModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "440px" }}>
            <button className="modal-close" onClick={() => setShowExpenseModal(false)}>
              <X size={20} />
            </button>

            <h2>Registrar Egresos Operativos</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Ingresa el gasto realizado en tu negocio para actualizar el balance mensual.
            </p>

            <form onSubmit={handleSaveExpense}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Categoría *</label>
                  <select 
                    className="input-field" 
                    value={expCategory} 
                    onChange={(e) => setExpCategory(e.target.value)}
                  >
                    <option value="Proveedor">Proveedor (Mercancía)</option>
                    <option value="Renta">Renta del Local</option>
                    <option value="Sueldos">Sueldo / Salarios</option>
                    <option value="Servicios">Luz o Agua</option>
                    <option value="Internet">Internet / Teléfono</option>
                    <option value="Otros">Otros Egreso</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Importe ($ MXN) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input-field" 
                    value={expAmount} 
                    onChange={(e) => setExpAmount(e.target.value)} 
                    placeholder="Ej. 1500"
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Fecha del Gasto *</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={expDate} 
                  onChange={(e) => setExpDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Descripción del Gasto *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={expDescription} 
                  onChange={(e) => setExpDescription(e.target.value)} 
                  placeholder="Ej. Pago de recibo bimestral de Luz CFE"
                  required 
                />
              </div>

              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="input-label">Notas Opcionales</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={expNotes} 
                  onChange={(e) => setExpNotes(e.target.value)} 
                  placeholder="Ej. Transferencia SPEI folio #120"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                <Save size={18} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} /> Registrar Egresos
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
