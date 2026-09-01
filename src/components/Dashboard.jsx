// Dashboard.jsx - Métricas e Indicadores Clave para el Gerente e Historial de Transacciones
import React, { useState, useEffect } from "react";
import { 
  DollarSign, ShoppingCart, UserCheck, TrendingUp, Award, AlertCircle, 
  Calendar, Search, Printer, X, Eye, FileText, List, Trash2, Plus, Edit, Save,
  Gift, Sparkles, Tag, Package 
} from "lucide-react";
import { db } from "../utils/db";

export default function Dashboard({ currentUser = {}, onUpdateCurrentUser, products = [], onRefreshProducts, showToast }) {
  const rawSales = db.getSales() || [];
  const sales = Array.isArray(rawSales) ? rawSales.map(s => ({
    ...s,
    id: s.id || `sale-${Math.random()}`,
    customerName: s.customerName || "Público General",
    cashierName: s.cashierName || "Caja",
    items: Array.isArray(s.items) ? s.items : (typeof s.items === "string" ? JSON.parse(s.items || "[]") : []),
    date: typeof s.date === "string" ? s.date : new Date().toISOString().replace("T", " ").slice(0, 19),
    total: typeof s.total === "number" ? s.total : parseFloat(s.total || 0),
    discount: typeof s.discount === "number" ? s.discount : parseFloat(s.discount || 0),
    paymentMethod: s.paymentMethod || "Efectivo"
  })) : [];

  const rawUsers = db.getUsers() || [];
  const users = Array.isArray(rawUsers) ? rawUsers : [];
  const clients = users.filter(u => u && u.role === "cliente");

  // Pestaña activa: "metrics", "transactions", "shifts", "clients", "staff", "rewards"
  const [activeTab, setActiveTab] = useState("metrics");

  // Estados del Historial de Transacciones
  const [txSearch, setTxSearch] = useState("");
  const [txFilter, setTxFilter] = useState("todos"); // "todos", "hoy", "mes"
  const [txGrouping, setTxGrouping] = useState("list"); // "list", "day", "month"
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // --- Estados de Gestión de Clientes VIP ---
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [selectedLoyaltyClient, setSelectedLoyaltyClient] = useState(null);
  const [manualPointsAdjustment, setManualPointsAdjustment] = useState("");
  const [showPointsModal, setShowPointsModal] = useState(false);

  // --- Estados de Gestión de Recompensas VIP ---
  const [rewardsList, setRewardsList] = useState(db.getRewards() || []);
  const [rewardSearch, setRewardSearch] = useState("");
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState("Todos");
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewardFormName, setRewardFormName] = useState("");
  const [rewardFormCategory, setRewardFormCategory] = useState("Productos");
  const [rewardFormPointsCost, setRewardFormPointsCost] = useState("1000");
  const [rewardFormDescription, setRewardFormDescription] = useState("");
  const [rewardFormImage, setRewardFormImage] = useState("");
  const [selectedLinkedProductId, setSelectedLinkedProductId] = useState("");

  // Compartir ticket de historial por WhatsApp
  const [whatsappShareNumber, setWhatsappShareNumber] = useState("");

  useEffect(() => {
    if (selectedReceipt) {
      const usersList = db.getUsers() || [];
      const client = usersList.find(u => u && u.id === selectedReceipt.customerId && u.role === "cliente");
      setWhatsappShareNumber(client ? client.phone : "");
    }
  }, [selectedReceipt]);

  // --- Estados de Gestión de Personal ---
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState(null);
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState("cajero");

  // Perfil propio (Gerente)
  const [selfName, setSelfName] = useState(currentUser ? currentUser.name : "");
  const [selfPhone, setSelfPhone] = useState(currentUser ? currentUser.phone : "");
  const [selfEmail, setSelfEmail] = useState(currentUser ? (currentUser.email || "") : "");
  const [selfPassword, setSelfPassword] = useState(currentUser ? currentUser.password : "");

  useEffect(() => {
    if (currentUser) {
      setSelfName(currentUser.name);
      setSelfPhone(currentUser.phone);
      setSelfEmail(currentUser.email || "");
      setSelfPassword(currentUser.password);
    }
  }, [currentUser]);

  // --- 1. KPI Cálculos ---
  const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  
  // Calcular Ganancia Neta
  const totalNetProfit = sales.reduce((sum, sale) => {
    const saleItems = Array.isArray(sale.items) ? sale.items : [];
    const saleProfit = saleItems.reduce((itemSum, item) => {
      const originalProduct = (products || []).find(p => p && p.id === item.id);
      const productCost = originalProduct ? originalProduct.cost : (item.price || 0) * 0.4;
      const margin = (item.price || 0) - productCost;
      return itemSum + (margin * (item.quantity || 1));
    }, 0);
    return sum + (saleProfit - (sale.discount || 0));
  }, 0);

  const totalTransactions = sales.length;
  const registeredClientsCount = clients.length;
  const lowStockProducts = (products || []).filter(p => p && (p.stock || 0) <= (p.minStock || 3));

  // --- 2. Productos más/menos vendidos ---
  const productSalesMap = {};
  (products || []).forEach(p => {
    if (p && p.id) {
      productSalesMap[p.id] = { name: p.name || "Producto", qty: 0, category: p.category || "General" };
    }
  });

  sales.forEach(sale => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    items.forEach(item => {
      if (item && item.id) {
        if (productSalesMap[item.id]) {
          productSalesMap[item.id].qty += (item.quantity || 1);
        } else {
          productSalesMap[item.id] = { name: item.name || "Producto", qty: (item.quantity || 1), category: "Otros" };
        }
      }
    });
  });

  const productSalesList = Object.values(productSalesMap);
  const bestSellers = [...productSalesList].sort((a, b) => b.qty - a.qty).slice(0, 3);
  const worstSellers = [...productSalesList].filter(p => p.category !== "Borrado").sort((a, b) => a.qty - b.qty).slice(0, 3);
  const topLoyalClients = [...clients].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 4);

  // --- 3. Datos del Gráfico SVG (Últimos 7 días) ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const dailySales = last7Days.map(dateStr => {
    const daySales = sales.filter(s => s.date && s.date.startsWith(dateStr));
    const revenue = daySales.reduce((sum, s) => sum + (s.total || 0), 0);
    return {
      date: dateStr,
      label: new Date(dateStr + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
      value: revenue
    };
  });

  const maxSaleValue = Math.max(...dailySales.map(d => d.value), 1000);
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 40;

  const svgPoints = dailySales.map((d, index) => {
    const x = padding + (index * (chartWidth - 2 * padding) / Math.max(1, dailySales.length - 1));
    const y = chartHeight - padding - (d.value * (chartHeight - 2 * padding) / maxSaleValue);
    return `${x},${y}`;
  }).join(" ");

  // --- 4. Filtrado del Historial de Transacciones ---
  const filteredSales = sales.filter(s => {
    const sId = (s.id || "").toLowerCase();
    const sCust = (s.customerName || "").toLowerCase();
    const sCash = (s.cashierName || "").toLowerCase();
    const sSearch = (txSearch || "").toLowerCase();

    const matchesSearch = sId.includes(sSearch) || sCust.includes(sSearch) || sCash.includes(sSearch);

    const todayStr = new Date().toISOString().split("T")[0];
    const thisMonthStr = todayStr.substring(0, 7);

    let matchesDate = true;
    if (txFilter === "hoy") {
      matchesDate = s.date && s.date.startsWith(todayStr);
    } else if (txFilter === "mes") {
      matchesDate = s.date && s.date.startsWith(thisMonthStr);
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Agrupado por Día
  const salesByDay = {};
  filteredSales.forEach(s => {
    const day = (s.date || "").split(" ")[0] || "Hoy";
    if (!salesByDay[day]) salesByDay[day] = [];
    salesByDay[day].push(s);
  });

  // Agrupado por Mes
  const salesByMonth = {};
  filteredSales.forEach(s => {
    const month = (s.date || "").split("-").slice(0, 2).join("-") || "Este Mes";
    if (!salesByMonth[month]) salesByMonth[month] = [];
    salesByMonth[month].push(s);
  });

  const handlePrintReceipt = (receipt) => {
    const printWindow = window.open("", "_blank", "width=320,height=500");
    if (!printWindow) {
      if (showToast) showToast("Por favor permita las ventanas emergentes para imprimir.", "warning");
      return;
    }

    const formattedDate = new Date(receipt.date).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    const itemsRows = receipt.items.map(item => {
      return `
        <tr>
          <td style="padding: 2px 0; font-size: 7.5pt; width: 68%; line-height: 1.1; word-break: break-all;">
            ${item.quantity} x ${item.name}
          </td>
          <td style="padding: 2px 0; text-align: right; font-size: 7.5pt; width: 32%; white-space: nowrap; vertical-align: bottom;">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `;
    }).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Reimpresión - Zabalegui</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 47mm;
              background: #fff;
            }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 8pt; 
              font-weight: bold; /* Fuerza a la impresora a usar trazos gruesos de calor */
              line-height: 1.25; 
              padding: 4px 6px;
              color: #000;
              box-sizing: border-box;
            }
            .text-center { text-align: center; }
            .header { margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
            .section { border-bottom: 1px dashed #000; padding: 4px 0; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 3px 0; }
            td { vertical-align: top; }
            .totals { font-weight: bold; margin-top: 5px; }
            .totals-row { display: flex; justify-content: space-between; padding: 2px 0; }
            .footer { margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px; font-size: 7.5pt; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="text-center header">
            <h3 style="margin: 0; font-size: 11pt; font-weight: bold; letter-spacing: 1px;">ZABALEGUI</h3>
            <div style="font-size: 7.5pt; margin-top: 2px;">Armenta y López 1025</div>
            <div style="font-size: 7.5pt;">Tel: 9541184642</div>
            <div style="font-size: 7.5pt;">11:00 AM - 6:30 PM</div>
          </div>

          <div style="font-size: 7.5pt; margin-bottom: 4px;">
            <div style="text-align: center; font-weight: bold; font-size: 8pt; margin-bottom: 3px; background: #eee; padding: 1px;">REIMPRESIÓN</div>
            <strong>Folio:</strong> ${receipt.id.slice(-8).toUpperCase()}<br/>
            <strong>Fecha:</strong> ${formattedDate}<br/>
            <strong>Cajero:</strong> ${receipt.cashierName}<br/>
            <strong>Cliente:</strong> ${receipt.customerName}<br/>
          </div>

          <div class="section">
            <table style="width: 100%;">
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>

          <div class="section totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>$${receipt.subtotal.toFixed(2)}</span>
            </div>
            ${receipt.discount > 0 ? `
            <div class="totals-row" style="color: #000;">
              <span>Desc. Puntos:</span>
              <span>-$${receipt.discount.toFixed(2)}</span>
            </div>
            ` : ""}
            <div class="totals-row" style="font-size: 9.5pt; border-top: 1px solid #000; padding-top: 3px; margin-top: 2px;">
              <span>TOTAL:</span>
              <span>$${receipt.total.toFixed(2)} MXN</span>
            </div>
            <div class="totals-row" style="font-weight: normal; font-size: 7.5pt; margin-top: 3px;">
              <span>Método Pago:</span>
              <span>${receipt.paymentMethod}</span>
            </div>
            ${receipt.paymentMethod === "Efectivo" ? `
            <div class="totals-row" style="font-weight: normal; font-size: 7.5pt;">
              <span>Efectivo Rec.:</span>
              <span>$${(receipt.cashReceived || receipt.total).toFixed(2)}</span>
            </div>
            <div class="totals-row" style="font-weight: normal; font-size: 7.5pt;">
              <span>Cambio:</span>
              <span>$${(receipt.change || 0).toFixed(2)}</span>
            </div>
            ` : ""}
          </div>

          ${receipt.customerId ? `
          <div class="text-center" style="font-size: 7.5pt; background: #eee; padding: 3px; border-radius: 3px; margin-top: 4px;">
            Puntos Ganados: <strong>+${receipt.pointsEarned}</strong>
          </div>
          ` : ""}

          <div class="text-center footer">
            <strong>¡Gracias por tu compra!</strong><br/>
            <span>zabalegui.pos</span>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sendWhatsAppTicket = (receipt, phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      if (showToast) showToast("Por favor ingrese un número de WhatsApp de 10 dígitos.", "error");
      return;
    }

    const formattedDate = new Date(receipt.date).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    const itemsText = receipt.items.map(item => 
      `• ${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
    ).join("\n");

    const message = `🌸 *ZABALEGUI* 🌸\n` +
      `Dirección: Armenta y López 1025\n` +
      `Teléfono de Tienda: 9541184642\n` +
      `------------------------------------------------\n` +
      `*TICKET DE COMPRA*\n` +
      `*Folio:* ${receipt.id.slice(-8).toUpperCase()}\n` +
      `*Fecha:* ${formattedDate}\n` +
      `*Cajero:* ${receipt.cashierName}\n` +
      `*Cliente:* ${receipt.customerName}\n` +
      `------------------------------------------------\n` +
      `*PRODUCTOS:*\n` +
      `${itemsText}\n` +
      `------------------------------------------------\n` +
      `*Subtotal:* $${receipt.subtotal.toFixed(2)}\n` +
      (receipt.discount > 0 ? `*Descto. Puntos:* -$${receipt.discount.toFixed(2)}\n` : "") +
      `*TOTAL:* $${receipt.total.toFixed(2)} MXN\n` +
      `*Método de Pago:* ${receipt.paymentMethod}\n` +
      `------------------------------------------------\n` +
      `*¡Gracias por tu compra!* ✨\n` +
      `Vuelve pronto para seguir acumulando puntos VIP.`;

    const cleanPhone = "52" + phoneNumber.replace(/\D/g, ""); // Prefijo México
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    if (showToast) showToast("Abriendo WhatsApp...", "success");
  };

  const handleDeleteSale = (saleId) => {
    if (window.confirm(`¿Estás seguro de eliminar la transacción ${saleId}? Esto devolverá los productos al inventario y reajustará los puntos VIP del cliente.`)) {
      try {
        db.deleteSale(saleId);
        if (onRefreshProducts) onRefreshProducts();
        if (showToast) showToast("Transacción eliminada con éxito. Inventario y puntos VIP actualizados.", "success");
      } catch (err) {
        if (showToast) showToast(err.message, "error");
      }
    }
  };

  const handlePrintShift = (closedShift) => {
    const sales = db.getSales();
    const shiftSales = sales.filter(s => s.shiftId === closedShift.id || 
      (!s.shiftId && s.date >= closedShift.startTime && s.date <= closedShift.endTime));

    const popupWin = window.open("", "_blank", "width=380,height=600");
    if (!popupWin) {
      if (showToast) showToast("Por favor permita las ventanas emergentes para imprimir.", "warning");
      return;
    }

    let spaceRentalTotal = 0;
    shiftSales.forEach(s => {
      s.items.forEach(item => {
        if (item.isSpaceRental) {
          spaceRentalTotal += item.price * item.quantity;
        }
      });
    });
    const ownSales = (closedShift.totalSales || 0) - spaceRentalTotal;

    const duration = () => {
      const start = new Date(closedShift.startTime).getTime();
      const end = new Date(closedShift.endTime).getTime();
      const diff = end - start;
      const hrs = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      return `${hrs}:${mins}:${secs}`;
    };

    const tableRows = shiftSales.map((s, idx) => {
      const formattedDate = new Date(s.date).toLocaleString("es-MX", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
      return `
        <tr>
          <td>#${s.id.slice(-6).toUpperCase()}</td>
          <td>${formattedDate}</td>
          <td>${s.customerName.slice(0, 8)}</td>
          <td>${s.paymentMethod.slice(0, 4)}</td>
          <td style="text-align: right;">$${s.total.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    popupWin.document.write(`
      <html>
        <head>
          <title>Corte de Caja - Zabalegui</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 47mm;
              background: #fff;
            }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 7.5pt; 
              font-weight: bold;
              line-height: 1.25; 
              padding: 4px 6px;
              color: #000;
              box-sizing: border-box;
            }
            .text-center { text-align: center; }
            .header { margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
            .section { border-bottom: 1px dashed #000; padding: 4px 0; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 3px 0; font-size: 6.8pt; }
            th, td { padding: 2px 0; text-align: left; }
            th { border-bottom: 1px solid #000; }
            .totals { font-weight: bold; margin-top: 5px; }
            .totals-row { display: flex; justify-content: space-between; padding: 2px 0; }
            .footer { margin-top: 15px; border-top: 1px dashed #000; padding-top: 5px; font-size: 7.5pt; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="text-center header">
            <h3 style="margin: 0; font-size: 11pt; font-weight: bold; letter-spacing: 1px;">ZABALEGUI</h3>
            <div style="font-size: 7.5pt; margin-top: 2px;">CORTE DE CAJA (ARQUEO)</div>
            <div style="font-size: 7.5pt;">Fecha: ${new Date(closedShift.endTime || closedShift.startTime).toLocaleDateString("es-MX")}</div>
          </div>

          <div style="font-size: 7.5pt; margin-bottom: 4px;">
            <strong>Cajero:</strong> ${closedShift.cashierName}<br/>
            <strong>Inicio:</strong> ${new Date(closedShift.startTime).toLocaleTimeString("es-MX")}<br/>
            <strong>Cierre:</strong> ${closedShift.endTime ? new Date(closedShift.endTime).toLocaleTimeString("es-MX") : "Turno Activo"}<br/>
            <strong>Duración:</strong> ${closedShift.endTime ? duration() : "En curso"}<br/>
          </div>

          <div class="section">
            <div style="font-weight: bold; text-align: center; margin-bottom: 4px; font-size: 7.5pt;">TRANSACCIONES DEL TURNO</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 25%;">Folio</th>
                  <th style="width: 20%;">Hora</th>
                  <th style="width: 20%;">Cli</th>
                  <th style="width: 15%;">Pago</th>
                  <th style="width: 20%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="5" style="text-align:center;">No hubo ventas</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section totals" style="font-size: 7.5pt;">
            <div class="totals-row">
              <span>Fondo Inicial:</span>
              <span>$${closedShift.openingBalance.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Ventas Efectivo:</span>
              <span>$${(closedShift.cashSales || 0).toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Ventas Tarj/Trans:</span>
              <span>$${(closedShift.nonCashSales || 0).toFixed(2)}</span>
            </div>
            <div class="totals-row" style="border-top: 1px dashed #000; padding-top: 3px; font-style: italic;">
              <span>- Propias Zabalegui:</span>
              <span>$${ownSales.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="font-style: italic;">
              <span>- Renta Espacio:</span>
              <span>$${spaceRentalTotal.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="border-top: 1px solid #000; padding-top: 3px; margin-top: 2px;">
              <span>Efectivo Esperado:</span>
              <span>$${(closedShift.expectedBalance || 0).toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Efectivo Físico:</span>
              <span>$${(closedShift.closingBalance || 0).toFixed(2)}</span>
            </div>
            <div class="totals-row" style="color: ${closedShift.discrepancy >= 0 ? "#000" : "#d00"}">
              <span>Diferencia:</span>
              <span>$${(closedShift.discrepancy || 0).toFixed(2)}</span>
            </div>
            <div class="totals-row" style="border-top: 1px solid #000; padding-top: 3px; font-size: 9pt; font-weight: bold;">
              <span>TOTAL VENTAS:</span>
              <span>$${(closedShift.totalSales || 0).toFixed(2)}</span>
            </div>
          </div>

          <div class="text-center footer">
            <div>Firma del Cajero</div>
            <br/><br/>
            <div>_______________________</div>
            <div style="margin-top: 10px; font-size: 7pt;">Zabalegui POS v2.0</div>
          </div>
        </body>
      </html>
    `);
    popupWin.document.close();
  };

  const handleSaveSelfProfile = (e) => {
    e.preventDefault();
    if (!selfName || !selfPhone || !selfPassword) {
      showToast("Por favor complete nombre, teléfono y contraseña.", "error");
      return;
    }
    try {
      const updated = db.updateUserProfile(currentUser.id, {
        name: selfName,
        phone: selfPhone,
        email: selfEmail,
        password: selfPassword
      });
      if (onUpdateCurrentUser) onUpdateCurrentUser(updated);
      showToast("Tu perfil ha sido actualizado correctamente.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleOpenAddStaff = () => {
    setEditingStaffUser(null);
    setStaffName("");
    setStaffPhone("");
    setStaffEmail("");
    setStaffPassword("");
    setStaffRole("cajero");
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (staff) => {
    setEditingStaffUser(staff);
    setStaffName(staff.name);
    setStaffPhone(staff.phone);
    setStaffEmail(staff.email || "");
    setStaffPassword(staff.password);
    setStaffRole(staff.role);
    setShowStaffModal(true);
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!staffName || !staffPhone || !staffPassword) {
      showToast("Por favor complete nombre, teléfono y contraseña.", "error");
      return;
    }
    try {
      if (editingStaffUser) {
        db.updateUserProfile(editingStaffUser.id, {
          name: staffName,
          phone: staffPhone,
          email: staffEmail,
          password: staffPassword,
          role: staffRole
        });
        showToast("Cuenta del empleado actualizada.", "success");
      } else {
        db.registerUser({
          name: staffName,
          phone: staffPhone,
          email: staffEmail,
          password: staffPassword,
          role: staffRole
        });
        showToast("Nuevo empleado registrado correctamente.", "success");
      }
      setShowStaffModal(false);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteStaff = (id) => {
    if (id === currentUser.id) {
      showToast("No puedes eliminar tu propia cuenta gerencial.", "error");
      return;
    }
    if (window.confirm("¿Está seguro de eliminar esta cuenta de empleado?")) {
      const usersList = db.getUsers();
      const filtered = usersList.filter(u => u.id !== id);
      db.saveUsers(filtered);
      showToast("Cuenta eliminada con éxito.", "success");
    }
  };

  const handleAdjustPoints = (e) => {
    e.preventDefault();
    if (!selectedLoyaltyClient) return;
    const pts = parseInt(manualPointsAdjustment);
    if (isNaN(pts)) {
      showToast("Por favor ingrese una cantidad válida de puntos.", "error");
      return;
    }
    try {
      const allUsers = db.getUsers();
      const index = allUsers.findIndex(u => u.id === selectedLoyaltyClient.id);
      if (index !== -1) {
        const originalPoints = allUsers[index].points || 0;
        const newPoints = Math.max(0, originalPoints + pts);
        allUsers[index].points = newPoints;
        db.saveUsers(allUsers);
        
        setSelectedLoyaltyClient({ ...allUsers[index] });
        showToast(`Puntos ajustados con éxito. Saldo anterior: ${originalPoints} pts. Nuevo saldo: ${newPoints} pts.`, "success");
        setManualPointsAdjustment("");
        setShowPointsModal(false);
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // --- Handlers de Gestión de Recompensas VIP ---
  const handleOpenAddRewardModal = () => {
    setEditingReward(null);
    setRewardFormName("");
    setRewardFormCategory("Productos");
    setRewardFormPointsCost("1000");
    setRewardFormDescription("");
    setRewardFormImage("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80");
    setSelectedLinkedProductId("");
    setShowRewardModal(true);
  };

  const handleOpenEditRewardModal = (reward) => {
    setEditingReward(reward);
    setRewardFormName(reward.name);
    setRewardFormCategory(reward.category || "Productos");
    setRewardFormPointsCost(reward.pointsCost.toString());
    setRewardFormDescription(reward.description || "");
    setRewardFormImage(reward.image || "");
    setSelectedLinkedProductId(reward.linkedProductId || "");
    setShowRewardModal(true);
  };

  const handleSaveReward = (e) => {
    e.preventDefault();
    if (!rewardFormName || !rewardFormPointsCost) {
      showToast("Por favor ingresa el nombre del premio y los puntos requeridos.", "error");
      return;
    }
    const pts = parseInt(rewardFormPointsCost);
    if (isNaN(pts) || pts <= 0) {
      showToast("El costo en puntos debe ser un número mayor a 0.", "error");
      return;
    }

    try {
      const rewardData = {
        name: rewardFormName,
        category: rewardFormCategory,
        pointsCost: pts,
        description: rewardFormDescription,
        image: rewardFormImage || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80",
        linkedProductId: selectedLinkedProductId || null
      };

      if (editingReward) {
        db.updateReward({ ...rewardData, id: editingReward.id });
        showToast("Recompensa VIP actualizada correctamente.", "success");
      } else {
        db.addReward(rewardData);
        showToast("Nueva recompensa agregada al catálogo VIP.", "success");
      }
      setRewardsList(db.getRewards());
      setShowRewardModal(false);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteReward = (rewardId, rewardName) => {
    if (window.confirm(`¿Estás seguro de eliminar la recompensa "${rewardName}"? Los clientes ya no podrán canjearla.`)) {
      try {
        db.deleteReward(rewardId);
        setRewardsList(db.getRewards());
        showToast("Recompensa eliminada con éxito.", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  const handleSelectLinkedProduct = (prodId) => {
    setSelectedLinkedProductId(prodId);
    if (prodId) {
      const prod = products.find(p => p.id === prodId);
      if (prod) {
        setRewardFormName(prod.name);
        setRewardFormCategory(prod.category || "Productos");
        setRewardFormPointsCost((prod.price * 10).toString()); // Sugerencia automática: precio * 10
        setRewardFormImage(prod.image || "");
        setRewardFormDescription(`Producto físico del catálogo (${prod.category}). Existencias: ${prod.stock} pzas.`);
      }
    }
  };

  const handleRewardFileChange = (e) => {
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
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          setRewardFormImage(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper para renderizar una fila de venta en la lista
  const renderSaleRow = (sale) => (
    <tr key={sale.id} style={{ borderBottom: "1px solid #f0ebe9" }}>
      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontFamily: "monospace" }}>{sale.id}</td>
      <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}>{new Date(sale.date).toLocaleString()}</td>
      <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}>{sale.customerName}</td>
      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>{sale.cashierName}</td>
      <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}>{sale.paymentMethod}</td>
      <td style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", fontWeight: "700", color: "var(--primary-color)" }}>
        ${sale.total.toFixed(2)}
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setSelectedReceipt(sale)}
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.6rem" }}
            title="Ver Detalle"
          >
            <Eye size={12} /> Detalle
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => handlePrintReceipt(sale)}
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.6rem" }}
            title="Reimprimir Ticket"
          >
            <Printer size={12} /> Ticket
          </button>
          <button 
            className="btn btn-danger btn-sm" 
            onClick={() => handleDeleteSale(sale.id)}
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.6rem" }}
            title="Eliminar Transacción"
          >
            <Trash2 size={12} /> Borrar
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Panel Gerencial Zabalegui</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>Análisis de ventas, inventario crítico e historial de tickets.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Botón de Sincronización MySQL */}
          <button 
            onClick={async () => {
              if (showToast) showToast("Comprobando conexión MySQL con Hostinger...", "info");
              try {
                const res = await fetch("/api/test.php").then(r => r.json());
                if (res.connected) {
                  await db.api.syncAll();
                  if (onRefreshProducts) onRefreshProducts();
                  if (showToast) showToast(`🟢 Conexión MySQL Exitosa: ${res.products_count} productos en BD`, "success");
                } else {
                  if (showToast) showToast(`🔴 Error MySQL: ${res.error || "No se pudo conectar"}`, "error");
                }
              } catch (e) {
                if (showToast) showToast("⚠️ Revisa que la carpeta /api/ esté subida en Hostinger", "error");
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", borderRadius: "12px", padding: "0.5rem 0.9rem", fontWeight: "600" }}
          >
            <RefreshCw size={15} /> Probar / Sincronizar MySQL
          </button>

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
            <Calendar size={16} color="var(--accent-gold)" /> Hoy: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`nav-button ${activeTab === "metrics" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: activeTab === "metrics" ? "none" : "1px solid var(--border-color)",
            background: activeTab === "metrics" ? "var(--primary-color)" : "white",
            color: activeTab === "metrics" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "var(--transition-fast)"
          }}
        >
          <TrendingUp size={16} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} /> Resumen & Métricas
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`nav-button ${activeTab === "transactions" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: activeTab === "transactions" ? "none" : "1px solid var(--border-color)",
            background: activeTab === "transactions" ? "var(--primary-color)" : "white",
            color: activeTab === "transactions" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "var(--transition-fast)"
          }}
        >
          <FileText size={16} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} /> Historial de Ventas
        </button>
        <button
          onClick={() => setActiveTab("shifts")}
          className={`nav-button ${activeTab === "shifts" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: activeTab === "shifts" ? "none" : "1px solid var(--border-color)",
            background: activeTab === "shifts" ? "var(--primary-color)" : "white",
            color: activeTab === "shifts" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "var(--transition-fast)"
          }}
        >
          <List size={16} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} /> Cortes de Caja
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`nav-button ${activeTab === "clients" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: activeTab === "clients" ? "none" : "1px solid var(--border-color)",
            background: activeTab === "clients" ? "var(--primary-color)" : "white",
            color: activeTab === "clients" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "var(--transition-fast)"
          }}
        >
          <Award size={16} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} /> Clientes VIP
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`nav-button ${activeTab === "rewards" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: activeTab === "rewards" ? "none" : "1px solid var(--border-color)",
            background: activeTab === "rewards" ? "var(--primary-color)" : "white",
            color: activeTab === "rewards" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "var(--transition-fast)"
          }}
        >
          <Gift size={16} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} /> Recompensas VIP
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`nav-button ${activeTab === "staff" ? "btn-primary" : "btn-secondary"}`}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "20px",
            border: activeTab === "staff" ? "none" : "1px solid var(--border-color)",
            background: activeTab === "staff" ? "var(--primary-color)" : "white",
            color: activeTab === "staff" ? "white" : "var(--text-dark)",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "var(--transition-fast)"
          }}
        >
          <UserCheck size={16} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} /> Gestionar Personal
        </button>
      </div>

      {/* --- CONTENIDO PESTAÑA MÈTRICAS --- */}
      {activeTab === "metrics" && (
        <>
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
                <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", color: "var(--primary-color)" }}>${totalSalesRevenue.toFixed(2)}</h3>
              </div>
            </div>

            {/* Ganancia Neta */}
            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "50px", height: "50px", borderRadius: "50%", background: "rgba(200, 146, 146, 0.15)",
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

            {/* Transacciones */}
            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "50px", height: "50px", borderRadius: "50%", background: "#ebf2fa",
                display: "flex", alignItems: "center", color: "#2d6ba8",
                justifyContent: "center"
              }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Ventas Realizadas</span>
                <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", color: "var(--primary-color)" }}>{totalTransactions}</h3>
              </div>
            </div>

            {/* Clientes Registrados */}
            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "50px", height: "50px", borderRadius: "50%", background: "#fcf2f4",
                display: "flex", alignItems: "center", color: "#c93b54",
                justifyContent: "center"
              }}>
                <UserCheck size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>Miembros VIP</span>
                <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.5rem", color: "var(--primary-color)" }}>{registeredClientsCount}</h3>
              </div>
            </div>

          </div>

          {/* Fila Central: Gráfico y Alertas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem", marginBottom: "2rem", alignItems: "start" }}>
            
            {/* Gráfico de Tendencia */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", margin: "0 0 1.5rem 0" }}>Desempeño Semanal (Ventas diarias)</h3>
              
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="auto" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Relleno bajo la línea */}
                  <path
                    d={`M ${padding},${chartHeight - padding} 
                        ${svgPoints.split(" ").map(p => `L ${p}`).join(" ")} 
                        L ${chartWidth - padding},${chartHeight - padding} Z`}
                    fill="url(#grad)"
                    opacity="0.15"
                  />

                  {/* Ejes */}
                  <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="var(--border-color)" strokeWidth="1.5" />
                  
                  {/* Línea del gráfico */}
                  <path
                    d={`M ${svgPoints}`}
                    fill="none"
                    stroke="var(--accent-gold)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Puntos y Etiquetas */}
                  {dailySales.map((d, index) => {
                    const x = padding + (index * (chartWidth - 2 * padding) / (dailySales.length - 1));
                    const y = chartHeight - padding - (d.value * (chartHeight - 2 * padding) / maxSaleValue);
                    
                    return (
                      <g key={d.date}>
                        <circle cx={x} cy={y} r="5" fill="var(--primary-color)" stroke="white" strokeWidth="1.5" />
                        
                        {/* Etiqueta Eje X */}
                        <text x={x} y={chartHeight - padding + 20} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="600">
                          {d.label}
                        </text>
                        
                        {/* Valor de Ingreso flotante */}
                        <text x={x} y={y - 12} textAnchor="middle" fontSize="10" fill="var(--primary-color)" fontWeight="700">
                          {d.value > 0 ? `$${d.value}` : ""}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Panel de Existencias y Alertas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem", color: "#b13047" }}>
                  <AlertCircle size={20} /> Alertas de Inventario
                </h3>
                
                {lowStockProducts.length === 0 ? (
                  <p style={{ color: "#2b613a", fontSize: "0.9rem", margin: 0, fontWeight: "600" }}>
                    ✓ Todos los productos tienen existencias suficientes.
                  </p>
                ) : (
                  <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {lowStockProducts.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", padding: "0.4rem 0", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                        <span>{p.name}</span>
                        <strong style={{ color: "#c93b54" }}>{p.stock} pzas (Mín: {p.minStock})</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VIP Reward Banner */}
              <div className="glass-panel" style={{ padding: "1.5rem", background: "linear-gradient(135deg, var(--primary-color) 0%, var(--bg-dark-panel) 100%)", color: "white" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--accent-gold)" }}>Programa VIP Activo</h4>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: "1.4" }}>
                  Fidelización: 10% de reembolso en puntos. El cliente más leal del negocio tiene acumulados más de 500 puntos.
                </p>
              </div>
            </div>

          </div>

          {/* Fila Inferior: Productos Top y Clientes Fieles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            
            {/* Productos Estrella */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Award size={20} color="var(--accent-gold)" /> Productos Más Vendidos
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {bestSellers.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                    <div>
                      <strong style={{ fontSize: "0.95rem", display: "block" }}>{item.name}</strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cat: {item.category}</span>
                    </div>
                    <span style={{ fontWeight: "700", color: "#2b613a", fontSize: "1rem" }}>{item.qty} vendidas</span>
                  </div>
                ))}
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
                    border: "1px solid rgba(49, 29, 32, 0.03)"
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
        </>
      )}

      {/* --- CONTENIDO PESTAÑA HISTORIAL --- */}
      {activeTab === "transactions" && (
        <>
          {/* Controles de Búsqueda y Filtros */}
          <div className="glass-panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              {/* Buscador */}
              <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                <Search size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Buscar por Folio, Cliente o Cajero..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {/* Selector de Fechas */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setTxFilter("todos")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    border: txFilter === "todos" ? "none" : "1px solid var(--border-color)",
                    background: txFilter === "todos" ? "var(--primary-color)" : "white",
                    color: txFilter === "todos" ? "white" : "var(--text-dark)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTxFilter("hoy")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    border: txFilter === "hoy" ? "none" : "1px solid var(--border-color)",
                    background: txFilter === "hoy" ? "var(--primary-color)" : "white",
                    color: txFilter === "hoy" ? "white" : "var(--text-dark)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setTxFilter("mes")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    border: txFilter === "mes" ? "none" : "1px solid var(--border-color)",
                    background: txFilter === "mes" ? "var(--primary-color)" : "white",
                    color: txFilter === "mes" ? "white" : "var(--text-dark)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  Este Mes
                </button>
              </div>

              {/* Selector de Agrupación */}
              <div style={{ display: "flex", gap: "0.5rem", borderLeft: "1px solid var(--border-color)", paddingLeft: "1rem" }}>
                <button
                  onClick={() => setTxGrouping("list")}
                  style={{
                    padding: "0.5rem 1.05rem",
                    borderRadius: "8px",
                    border: txGrouping === "list" ? "none" : "1px solid var(--border-color)",
                    background: txGrouping === "list" ? "rgba(49, 29, 32, 0.1)" : "white",
                    color: "var(--text-dark)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                  title="Listado cronológico"
                >
                  <List size={14} /> Lista
                </button>
                <button
                  onClick={() => setTxGrouping("day")}
                  style={{
                    padding: "0.5rem 1.05rem",
                    borderRadius: "8px",
                    border: txGrouping === "day" ? "none" : "1px solid var(--border-color)",
                    background: txGrouping === "day" ? "rgba(49, 29, 32, 0.1)" : "white",
                    color: "var(--text-dark)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                  title="Agrupar por día"
                >
                  <Calendar size={14} /> Por Día
                </button>
                <button
                  onClick={() => setTxGrouping("month")}
                  style={{
                    padding: "0.5rem 1.05rem",
                    borderRadius: "8px",
                    border: txGrouping === "month" ? "none" : "1px solid var(--border-color)",
                    background: txGrouping === "month" ? "rgba(49, 29, 32, 0.1)" : "white",
                    color: "var(--text-dark)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                  title="Agrupar por mes"
                >
                  <Calendar size={14} /> Por Mes
                </button>
              </div>
            </div>
          </div>

          {/* Contenido según tipo de agrupación */}
          {txGrouping === "list" && (
            <div className="glass-panel" style={{ overflowX: "auto", borderRadius: "var(--radius-md)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(49, 29, 32, 0.04)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "1rem" }}>Folio</th>
                    <th style={{ padding: "1rem" }}>Fecha & Hora</th>
                    <th style={{ padding: "1rem" }}>Cliente</th>
                    <th style={{ padding: "1rem" }}>Cajero</th>
                    <th style={{ padding: "1rem" }}>Pago</th>
                    <th style={{ padding: "1rem" }}>Total</th>
                    <th style={{ padding: "1rem", textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                        No se encontraron transacciones registradas.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map(renderSaleRow)
                  )}
                </tbody>
              </table>
            </div>
          )}

          {txGrouping === "day" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {Object.keys(salesByDay).length === 0 ? (
                <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No se encontraron transacciones.
                </div>
              ) : (
                Object.keys(salesByDay).sort((a, b) => new Date(b) - new Date(a)).map(day => {
                  const daySales = salesByDay[day];
                  const dayTotal = daySales.reduce((sum, s) => sum + s.total, 0);
                  return (
                    <div className="glass-panel" key={day} style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                        <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                          📅 Ventas del {new Date(day + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </h3>
                        <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#2b613a" }}>
                          Corte del día: ${dayTotal.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead>
                            <tr style={{ background: "rgba(49, 29, 32, 0.02)", borderBottom: "1px solid var(--border-color)" }}>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Folio</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Hora</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Cliente</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Cajero</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Pago</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Total</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {daySales.map(renderSaleRow)}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {txGrouping === "month" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {Object.keys(salesByMonth).length === 0 ? (
                <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No se encontraron transacciones.
                </div>
              ) : (
                Object.keys(salesByMonth).sort((a, b) => b.localeCompare(a)).map(month => {
                  const monthSales = salesByMonth[month];
                  const monthTotal = monthSales.reduce((sum, s) => sum + s.total, 0);
                  const [year, mNum] = month.split("-");
                  const monthName = new Date(parseInt(year), parseInt(mNum) - 1, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" });
                  return (
                    <div className="glass-panel" key={month} style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", textTransform: "capitalize" }}>
                          📅 {monthName}
                        </h3>
                        <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#2b613a" }}>
                          Corte Mensual: ${monthTotal.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead>
                            <tr style={{ background: "rgba(49, 29, 32, 0.02)", borderBottom: "1px solid var(--border-color)" }}>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Folio</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Fecha & Hora</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Cliente</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Cajero</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Pago</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Total</th>
                              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthSales.map(renderSaleRow)}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* --- CONTENIDO PESTAÑA CORTES DE CAJA --- */}
      {activeTab === "shifts" && (() => {
        const shifts = db.getShifts().sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", margin: "0 0 1rem 0" }}>Historial de Cortes de Caja (Arqueos)</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                Aquí puedes monitorear las aperturas, cierres y arqueos físicos realizados por tus cajeros.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(49, 29, 32, 0.02)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Fecha</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Cajero</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Apertura</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Cierre</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Fondo Inicial</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Efectivo Esperado</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Físico Contado</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Diferencia</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Total Ventas</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "center" }}>Estado</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                          No se han registrado turnos ni cortes de caja.
                        </td>
                      </tr>
                    ) : (
                      shifts.map(shift => {
                        const isClosed = shift.status === "closed";
                        const isDeficit = isClosed && shift.discrepancy < 0;

                        return (
                          <tr key={shift.id} style={{ borderBottom: "1px solid #f0ebe9" }}>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", fontWeight: "600" }}>
                              {new Date(shift.startTime).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}>{shift.cashierName}</td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                              {new Date(shift.startTime).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                              {shift.endTime 
                                ? new Date(shift.endTime).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) 
                                : "Turno Activo"}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", textAlign: "right" }}>
                              ${shift.openingBalance.toFixed(2)}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", textAlign: "right" }}>
                              {isClosed ? `$${shift.expectedBalance.toFixed(2)}` : "Calculando..."}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", textAlign: "right", fontWeight: isClosed ? "600" : "400" }}>
                              {isClosed ? `$${shift.closingBalance.toFixed(2)}` : "-"}
                            </td>
                            <td style={{ 
                              padding: "0.75rem 1rem", 
                              fontSize: "0.9rem", 
                              textAlign: "right", 
                              fontWeight: "700",
                              color: isClosed 
                                ? (shift.discrepancy === 0 ? "green" : (isDeficit ? "#c93b54" : "blue"))
                                : "inherit"
                            }}>
                              {isClosed 
                                ? (shift.discrepancy === 0 
                                  ? "$0.00" 
                                  : (shift.discrepancy > 0 ? `+$${shift.discrepancy.toFixed(2)}` : `-$${Math.abs(shift.discrepancy).toFixed(2)}`))
                                : "-"}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", textAlign: "right", fontWeight: "700", color: "var(--primary-color)" }}>
                              {isClosed ? `$${shift.totalSales.toFixed(2)}` : "-"}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                              <span style={{
                                fontSize: "0.75rem",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "8px",
                                background: isClosed ? "#eef7f0" : "#fef3c7",
                                color: isClosed ? "#2b613a" : "#d97706",
                                fontWeight: "600"
                              }}>
                                {isClosed ? "Cerrado" : "Abierto"}
                              </span>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => handlePrintShift(shift)}
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.6rem" }}
                                title="Imprimir ticket de corte"
                              >
                                <Printer size={12} /> Imprimir
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- CONTENIDO PESTAÑA GESTIONAR PERSONAL --- */}
      {activeTab === "staff" && (() => {
        const allUsers = db.getUsers();
        const staff = allUsers.filter(u => u.role === "gerente" || u.role === "cajero");

        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem", alignItems: "start" }}>
            
            {/* Formulario de Perfil Propio */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem 0" }}>Mi Perfil Gerencial</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1.25rem" }}>
                Edita tus credenciales de acceso y datos generales como administrador del sistema.
              </p>

              <form onSubmit={handleSaveSelfProfile}>
                <div className="input-group">
                  <label className="input-label">Nombre Completo *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={selfName} 
                    onChange={(e) => setSelfName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Teléfono / Usuario *</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    value={selfPhone} 
                    onChange={(e) => setSelfPhone(e.target.value)} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={selfEmail} 
                    onChange={(e) => setSelfEmail(e.target.value)} 
                  />
                </div>
                <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="input-label">Contraseña de Acceso *</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={selfPassword} 
                    onChange={(e) => setSelfPassword(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Guardar Mi Perfil
                </button>
              </form>
            </div>

            {/* Listado y gestión del equipo de caja */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Cajeros & Personal</h3>
                <button className="btn btn-primary btn-sm" onClick={handleOpenAddStaff} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Plus size={14} /> Registrar Empleado
                </button>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
                Crea o modifica las cuentas de acceso para el personal encargado de la caja y ventas.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(49, 29, 32, 0.02)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Nombre</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Teléfono</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Email</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Rol</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(member => (
                      <tr key={member.id} style={{ borderBottom: "1px solid #f0ebe9" }}>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}>
                          <strong>{member.name}</strong> {member.id === currentUser.id && <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "600" }}>(Tú)</span>}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", fontFamily: "monospace" }}>{member.phone}</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>{member.email || "-"}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{
                            fontSize: "0.75rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "8px",
                            fontWeight: "600",
                            background: member.role === "gerente" ? "#fef3c7" : "#eef7f0",
                            color: member.role === "gerente" ? "#d97706" : "#2b613a"
                          }}>
                            {member.role === "gerente" ? "Gerente" : "Cajero"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditStaff(member)} style={{ padding: "0.3rem 0.5rem" }} title="Editar Datos">
                              <Edit size={12} />
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDeleteStaff(member.id)} 
                              style={{ padding: "0.3rem 0.5rem" }} 
                              disabled={member.id === currentUser.id}
                              title="Eliminar Cuenta"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        );
      })()}

      {/* --- CONTENIDO PESTAÑA CLIENTES VIP --- */}
      {activeTab === "clients" && (() => {
        const allUsers = db.getUsers();
        const clientsList = allUsers.filter(u => u.role === "cliente");
        
        const filteredClients = clientsList.filter(c => 
          c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
          c.phone.includes(clientSearchQuery) ||
          (c.email && c.email.toLowerCase().includes(clientSearchQuery.toLowerCase()))
        );

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Buscador de Clientes */}
            <div className="glass-panel" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Buscar clientes por nombre, celular o correo..."
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    style={{ paddingLeft: "38px", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedLoyaltyClient ? "1.5fr 1fr" : "1fr", gap: "1.5rem", alignItems: "start" }}>
              
              {/* Tabla de Clientes */}
              <div className="glass-panel" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", margin: "0 0 1rem 0" }}>Directorio de Clientes VIP</h3>
                
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "rgba(49, 29, 32, 0.02)", borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Nombre</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Teléfono</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Email</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem" }}>Puntos Acumulados</th>
                        <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", textAlign: "right" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map(c => (
                        <tr key={c.id} style={{ 
                          borderBottom: "1px solid #f0ebe9",
                          background: selectedLoyaltyClient && selectedLoyaltyClient.id === c.id ? "rgba(197, 155, 142, 0.08)" : "none"
                        }}>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}>
                            <strong>{c.name}</strong>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", fontFamily: "monospace" }}>{c.phone}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>{c.email || "-"}</td>
                          <td style={{ padding: "0.75rem 1rem", fontSize: "0.95rem", fontWeight: "700", color: "var(--accent-gold-bright)" }}>
                            {c.points || 0} pts
                          </td>
                          <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => setSelectedLoyaltyClient(c)}
                                style={{ padding: "0.3rem 0.6rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                title="Ver Historial"
                              >
                                <Eye size={12} /> Detalles
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredClients.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                            No se encontraron clientes con ese criterio.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detalle del Cliente Seleccionado */}
              {selectedLoyaltyClient && (() => {
                const clientSales = db.getSales().filter(s => s.customerId === selectedLoyaltyClient.id);
                
                return (
                  <div className="glass-panel" style={{ padding: "1.5rem", border: "1px solid var(--accent-gold)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{selectedLoyaltyClient.name}</h3>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: {selectedLoyaltyClient.id}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedLoyaltyClient(null)}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Ficha Resumen */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                      <div style={{ background: "white", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>PUNTOS VIP</span>
                        <strong style={{ fontSize: "1.25rem", color: "var(--accent-gold-bright)" }}>{selectedLoyaltyClient.points || 0} pts</strong>
                      </div>
                      <div style={{ background: "white", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>COMPRAS REGISTRADAS</span>
                        <strong style={{ fontSize: "1.25rem", color: "var(--primary-color)" }}>{clientSales.length}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => {
                          setManualPointsAdjustment("");
                          setShowPointsModal(true);
                        }}
                        style={{ width: "100%", padding: "0.5rem" }}
                      >
                        Ajustar Puntos Manualmente
                      </button>
                    </div>

                    {/* Historial de Compras */}
                    <h4 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", borderBottom: "1px dashed var(--border-color)", paddingBottom: "0.25rem" }}>
                      Historial de Compras
                    </h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                      {clientSales.map(sale => (
                        <div key={sale.id} style={{ 
                          padding: "0.75rem", 
                          background: "white", 
                          borderRadius: "8px", 
                          border: "1px solid var(--border-color)", 
                          fontSize: "0.85rem",
                          boxShadow: "var(--shadow-sm)"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>#{sale.id.slice(-8).toUpperCase()}</span>
                            <span style={{ color: "var(--text-muted)" }}>{new Date(sale.date).toLocaleDateString("es-MX")}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-dark)", fontWeight: "600" }}>
                            <span>Total de Compra:</span>
                            <span style={{ color: "var(--primary-color)" }}>${sale.total.toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", color: "#4a7551", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                            <span>Puntos Acumulados:</span>
                            <strong>+{sale.pointsEarned || 0} pts</strong>
                          </div>
                          {sale.pointsUsed > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#a82e3b", fontSize: "0.75rem" }}>
                              <span>Puntos Redimidos:</span>
                              <strong>-{sale.pointsUsed} pts</strong>
                            </div>
                          )}
                        </div>
                      ))}
                      {clientSales.length === 0 && (
                        <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          Este cliente no tiene compras asociadas todavía.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>

          </div>
        );
      })()}

      {/* --- CONTENIDO PESTAÑA RECOMPENSAS VIP --- */}
      {activeTab === "rewards" && (() => {
        const filteredRewards = rewardsList.filter(r => {
          const matchesCategory = rewardCategoryFilter === "Todos" || r.category === rewardCategoryFilter;
          const matchesSearch = r.name.toLowerCase().includes(rewardSearch.toLowerCase()) || 
            (r.description && r.description.toLowerCase().includes(rewardSearch.toLowerCase()));
          return matchesCategory && matchesSearch;
        });

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Banner Informativo y Botón de Creación */}
            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Gift size={22} color="var(--primary-color)" /> Catálogo de Recompensas y Premios VIP
                </h2>
                <p style={{ color: "var(--text-muted)", margin: "0.35rem 0 0 0", fontSize: "0.9rem" }}>
                  Define los productos, regalos y cupones que los clientes pueden canjear con sus puntos acumulados.
                </p>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(197, 155, 142, 0.12)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  color: "var(--primary-color)",
                  fontWeight: "600",
                  marginTop: "0.75rem",
                  border: "1px solid rgba(197, 155, 142, 0.3)"
                }}>
                  <Sparkles size={14} color="var(--accent-gold-bright)" />
                  Regla Activa: $1.00 MXN de compra = 10 Puntos VIP
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={handleOpenAddRewardModal}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem" }}
              >
                <Plus size={18} /> Nueva Recompensa
              </button>
            </div>

            {/* Filtros y Buscador */}
            <div className="glass-panel" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                
                {/* Buscador */}
                <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                  <Search size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Buscar por nombre de premio o descripción..."
                    value={rewardSearch}
                    onChange={(e) => setRewardSearch(e.target.value)}
                    style={{ paddingLeft: "38px", width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                {/* Filtro por Categoría */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {["Todos", "Productos", "Cupones", "Descuentos", "Servicios"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setRewardCategoryFilter(cat)}
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "20px",
                        border: rewardCategoryFilter === cat ? "none" : "1px solid var(--border-color)",
                        background: rewardCategoryFilter === cat ? "var(--primary-color)" : "white",
                        color: rewardCategoryFilter === cat ? "white" : "var(--text-dark)",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "var(--transition-fast)"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* Grid de Tarjetas de Recompensas */}
            <div className="grid grid-3" style={{ gap: "1.5rem" }}>
              {filteredRewards.map(reward => (
                <div key={reward.id} className="glass-panel" style={{
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(49, 29, 32, 0.08)",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  {/* Thumbnail de Imagen */}
                  <div style={{ height: "160px", overflow: "hidden", position: "relative", background: "#f5f0ee" }}>
                    <img 
                      src={reward.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80"} 
                      alt={reward.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      fontSize: "0.75rem",
                      color: reward.category === "Descuentos" || reward.category === "Cupones" ? "#8a31b5" : "#3174b5",
                      background: "rgba(255,255,255,0.94)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "20px",
                      fontWeight: "700",
                      boxShadow: "var(--shadow-sm)"
                    }}>
                      {reward.category}
                    </span>
                    
                    <span style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      background: "rgba(44, 26, 32, 0.88)",
                      color: "var(--accent-gold-bright)",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      backdropFilter: "blur(4px)"
                    }}>
                      {reward.pointsCost.toLocaleString()} pts
                    </span>
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem 0", lineHeight: "1.3" }}>
                        {reward.name}
                      </h3>
                      {reward.description && (
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 1rem 0", lineHeight: "1.4" }}>
                          {reward.description}
                        </p>
                      )}
                    </div>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px dashed var(--border-color)",
                      paddingTop: "0.75rem",
                      marginTop: "0.5rem"
                    }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        ID: <code style={{ color: "var(--primary-color)" }}>{reward.id}</code>
                      </span>

                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditRewardModal(reward)}
                          style={{ padding: "0.35rem 0.65rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem" }}
                          title="Editar Recompensa"
                        >
                          <Edit size={13} /> Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteReward(reward.id, reward.name)}
                          style={{ padding: "0.35rem 0.65rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem" }}
                          title="Eliminar Recompensa"
                        >
                          <Trash2 size={13} /> Borrar
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}

              {filteredRewards.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
                  <Gift size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                  <h3>No se encontraron recompensas</h3>
                  <p>Crea tu primera recompensa o ajusta los filtros de búsqueda.</p>
                </div>
              )}
            </div>

          </div>
        );
      })()}

      {/* --- MODAL AGREGAR / EDITAR STAFF --- */}
      {showStaffModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "440px" }}>
            <button className="modal-close" onClick={() => setShowStaffModal(false)}>
              <X size={20} />
            </button>

            <h2>{editingStaffUser ? "Editar Empleado" : "Nuevo Registro de Personal"}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Asigna credenciales de acceso para el personal de la tienda.
            </p>

            <form onSubmit={handleSaveStaff}>
              <div className="input-group">
                <label className="input-label">Nombre Completo *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={staffName} 
                  onChange={(e) => setStaffName(e.target.value)} 
                  placeholder="Ej. Ana Gómez Ortega"
                  required 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Teléfono / Usuario *</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    value={staffPhone} 
                    onChange={(e) => setStaffPhone(e.target.value)} 
                    placeholder="10 dígitos"
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Rol en Tienda *</label>
                  <select 
                    className="input-field" 
                    value={staffRole} 
                    onChange={(e) => setStaffRole(e.target.value)}
                  >
                    <option value="cajero">Cajero</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={staffEmail} 
                  onChange={(e) => setStaffEmail(e.target.value)} 
                  placeholder="Ej. empleado@zabalegui.com"
                />
              </div>

              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="input-label">Contraseña de Acceso *</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={staffPassword} 
                  onChange={(e) => setStaffPassword(e.target.value)} 
                  placeholder="Mínimo 4 caracteres"
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                <Save size={18} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} /> Guardar Cuenta de Empleado
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DETALLES DE VENTA --- */}
      {selectedReceipt && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: "550px", padding: "2rem" }}>
            <button className="modal-close" onClick={() => setSelectedReceipt(null)}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem", color: "var(--primary-color)" }}>
              Detalles de la Transacción
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Folio: <strong>{selectedReceipt.id}</strong> | Fecha: {new Date(selectedReceipt.date).toLocaleString()}
            </p>

            {/* Información del Cliente & Caja */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "1.5rem", 
              background: "#fbf8f7", 
              padding: "1rem", 
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              marginBottom: "1.5rem",
              fontSize: "0.9rem"
            }}>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Cliente</span>
                <strong>{selectedReceipt.customerName}</strong>
                {selectedReceipt.customerId && <span style={{ display: "block", fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "600" }}>Socio VIP</span>}
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Cajero / Caja</span>
                <strong>{selectedReceipt.cashierName}</strong>
              </div>
            </div>

            {/* Productos Vendidos */}
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Artículos Comprados</h3>
            <div style={{ 
              maxHeight: "180px", 
              overflowY: "auto", 
              border: "1px solid var(--border-color)", 
              borderRadius: "var(--radius-md)",
              padding: "0.5rem",
              marginBottom: "1.5rem"
            }}>
              {selectedReceipt.items.map((item, idx) => (
                <div key={idx} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "0.5rem 0",
                  borderBottom: idx < selectedReceipt.items.length - 1 ? "1px solid #f0ebe9" : "none"
                }}>
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ fontSize: "0.9rem", display: "block" }}>{item.name}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {item.quantity} x ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--primary-color)" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            {/* Totales y Pago */}
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.4rem", 
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: "0.75rem", 
              marginBottom: "1rem",
              fontSize: "0.9rem" 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal:</span>
                <span>${selectedReceipt.subtotal.toFixed(2)}</span>
              </div>
              {selectedReceipt.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#c93b54", fontWeight: "600" }}>
                  <span>Descuento por Puntos:</span>
                  <span>-${selectedReceipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "1.1rem", color: "var(--primary-color)", borderTop: "1px dashed #ccc", paddingTop: "0.5rem" }}>
                <span>TOTAL:</span>
                <span>${selectedReceipt.total.toFixed(2)} MXN</span>
              </div>
            </div>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              fontSize: "0.85rem",
              background: "#eef7f0",
              padding: "0.50rem 0.75rem",
              borderRadius: "6px",
              color: "#2b613a",
              fontWeight: "600"
            }}>
              <span>Método de pago: {selectedReceipt.paymentMethod}</span>
              {selectedReceipt.customerId && (
                <span>+{selectedReceipt.pointsEarned} pts VIP</span>
              )}
            </div>

            <div style={{ marginTop: "1.25rem", borderTop: "1px dashed #ccc", paddingTop: "1rem" }}>
              <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem", fontFamily: "'Outfit', sans-serif" }}>
                Compartir Ticket por WhatsApp
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="WhatsApp (10 dígitos)"
                  value={whatsappShareNumber}
                  onChange={(e) => setWhatsappShareNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem", fontFamily: "sans-serif" }}
                />
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => sendWhatsAppTicket(selectedReceipt, whatsappShareNumber)}
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                >
                  Enviar
                </button>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "2.0rem" }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedReceipt(null)}
                style={{ flex: 1 }}
              >
                Cerrar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handlePrintReceipt(selectedReceipt)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <Printer size={18} /> Reimprimir Ticket
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL AJUSTAR PUNTOS --- */}
      {showPointsModal && selectedLoyaltyClient && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "380px" }}>
            <button className="modal-close" onClick={() => setShowPointsModal(false)}>
              <X size={20} />
            </button>

            <h2>Ajustar Puntos VIP</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Modifica manualmente el saldo de puntos de <strong>{selectedLoyaltyClient.name}</strong>.
            </p>

            <form onSubmit={handleAdjustPoints}>
              <div style={{ background: "rgba(197, 155, 142, 0.08)", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
                <span>Saldo Actual: <strong>{selectedLoyaltyClient.points || 0} pts</strong></span>
              </div>

              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="input-label">Puntos a Sumar o Restar *</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={manualPointsAdjustment} 
                  onChange={(e) => setManualPointsAdjustment(e.target.value)} 
                  placeholder="Ej. 100 para sumar, -50 para restar"
                  required 
                />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                  Ingresa un número positivo para regalar puntos, o uno negativo para descontarle.
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
                Aplicar Ajuste de Puntos
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CREAR / EDITAR RECOMPENSA VIP --- */}
      {showRewardModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <button className="modal-close" onClick={() => setShowRewardModal(false)}>
              <X size={20} />
            </button>

            <h2>{editingReward ? "Editar Recompensa VIP" : "Nueva Recompensa VIP"}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Configura los detalles del premio y cuántos puntos necesitará el cliente para canjearlo.
            </p>

            <form onSubmit={handleSaveReward} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* Opción rápida: Vincular con producto de inventario */}
              <div className="input-group">
                <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Package size={14} color="var(--accent-gold)" /> Vincular con Producto de Tienda (Opcional)
                </label>
                <select 
                  className="input-field"
                  value={selectedLinkedProductId}
                  onChange={(e) => handleSelectLinkedProduct(e.target.value)}
                >
                  <option value="">-- Personalizado / Cupón de Descuento --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price} MXN ({p.stock} en stock)
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Al elegir un producto se completará su nombre, imagen y sugerirá puntos equivalentes ($1 = 10 pts).
                </span>
              </div>

              <div className="input-group">
                <label className="input-label">Nombre del Premio / Recompensa *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={rewardFormName} 
                  onChange={(e) => setRewardFormName(e.target.value)} 
                  placeholder="Ej. Labial Matte Rose Gold o Cupón $100 MXN"
                  required 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Categoría *</label>
                  <select 
                    className="input-field" 
                    value={rewardFormCategory} 
                    onChange={(e) => setRewardFormCategory(e.target.value)}
                  >
                    <option value="Productos">Productos</option>
                    <option value="Cupones">Cupones</option>
                    <option value="Descuentos">Descuentos</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Especial">Especial</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Puntos Requeridos *</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={rewardFormPointsCost} 
                    onChange={(e) => setRewardFormPointsCost(e.target.value)} 
                    placeholder="Ej. 2500"
                    required 
                    min="1"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Descripción o Condiciones del Premio</label>
                <textarea 
                  className="input-field" 
                  rows="2"
                  value={rewardFormDescription} 
                  onChange={(e) => setRewardFormDescription(e.target.value)} 
                  placeholder="Ej. Válido en sucursal física. Presentar código de cliente en caja al canjear."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: "1rem" }}>
                <label className="input-label">Foto / Imagen de la Recompensa</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {rewardFormImage && (
                    <img 
                      src={rewardFormImage} 
                      alt="Preview" 
                      style={{ 
                        width: "55px", 
                        height: "55px", 
                        objectFit: "cover", 
                        borderRadius: "8px", 
                        border: "1px solid var(--border-color)",
                        boxShadow: "var(--shadow-sm)" 
                      }} 
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleRewardFileChange} 
                      style={{ fontSize: "0.85rem" }}
                    />
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Sube una foto desde tu lap o cel (se optimizará y comprimirá automáticamente)
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRewardModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  <Save size={18} /> Guardar Recompensa
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
