// POS.jsx - Módulo de Punto de Venta (POS) con Buscador, Escaneo de Cámara y Fidelización
import React, { useState, useEffect, useRef } from "react";
import { Search, Camera, Plus, Minus, Trash2, User, Phone, CheckCircle, Ticket, X, Award, CreditCard, DollarSign, ShoppingBag } from "lucide-react";
import { db } from "../utils/db";


export default function POS({ currentUser, products, onRefreshProducts, showToast }) {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // Cliente asociado
  const [clientSearch, setClientSearch] = useState("");
  const [associatedClient, setAssociatedClient] = useState(null);
  
  // Control de escáner de cámara
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Estados de checkout/pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo"); // Efectivo, Tarjeta, Puntos
  const [cashReceived, setCashReceived] = useState("");
  const [lastSaleReceipt, setLastSaleReceipt] = useState(null); // Para mostrar ticket al finalizar

  // --- CONTROL DE TURNOS ---
  const [activeShift, setActiveShift] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("");
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  
  // Formulario Iniciar Turno
  const [cajeroName, setCajeroName] = useState(currentUser ? currentUser.name : "");
  const [openingBalance, setOpeningBalance] = useState("");

  // Formulario Cerrar Turno
  const [closingBalance, setClosingBalance] = useState("");

  // Cargar turno activo al iniciar
  useEffect(() => {
    setActiveShift(db.getActiveShift());
  }, []);

  // Temporizador en tiempo real desde que inició el turno
  useEffect(() => {
    if (!activeShift) {
      setElapsedTime("");
      return;
    }

    const updateTimer = () => {
      const start = new Date(activeShift.startTime).getTime();
      const now = Date.now();
      const diff = now - start;
      if (diff < 0) {
        setElapsedTime("00:00:00");
        return;
      }
      const hrs = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      setElapsedTime(`${hrs}:${mins}:${secs}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeShift]);

  const handleStartShift = (e) => {
    e.preventDefault();
    if (!cajeroName.trim()) {
      showToast("Por favor ingrese el nombre del cajero.", "error");
      return;
    }
    try {
      const shift = db.startShift(cajeroName, openingBalance);
      setActiveShift(shift);
      showToast("¡Turno de caja iniciado con éxito!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleCloseShift = (e) => {
    e.preventDefault();
    if (closingBalance.trim() === "") {
      showToast("Por favor ingrese el efectivo físico contado en caja.", "error");
      return;
    }
    try {
      const closed = db.closeShift(closingBalance);
      printShiftReceipt(closed);
      setActiveShift(null);
      setShowCloseShiftModal(false);
      setClosingBalance("");
      showToast("¡Turno finalizado y ticket de corte impreso!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const printShiftReceipt = (closedShift) => {
    const sales = db.getSales();
    const shiftSales = sales.filter(s => s.shiftId === closedShift.id || 
      (!s.shiftId && s.date >= closedShift.startTime && s.date <= closedShift.endTime));

    let spaceRentalTotal = 0;
    shiftSales.forEach(s => {
      s.items.forEach(item => {
        if (item.isSpaceRental) {
          spaceRentalTotal += item.price * item.quantity;
        }
      });
    });
    const ownSales = closedShift.totalSales - spaceRentalTotal;

    const popupWin = window.open("", "_blank", "width=380,height=600");
    if (!popupWin) {
      showToast("Por favor permita las ventanas emergentes para imprimir.", "warning");
      return;
    }

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
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 11pt; 
              line-height: 1.3; 
              margin: 10px; 
              color: #000;
            }
            .text-center { text-align: center; }
            .header { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .section { border-bottom: 1px dashed #000; padding: 10px 0; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
            th, td { padding: 4px 0; text-align: left; }
            th { border-bottom: 1px solid #000; }
            .totals { font-weight: bold; margin-top: 10px; }
            .totals-row { display: flex; justify-content: space-between; padding: 3px 0; }
            .footer { margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; font-size: 9pt; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="text-center header">
            <h2 style="margin: 0; font-size: 16pt; font-weight: bold; letter-spacing: 2px;">ZABALEGUI</h2>
            <div style="font-size: 9pt; margin-top: 3px;">CORTE DE CAJA (ARQUEO)</div>
            <div style="font-size: 9pt;">Fecha: ${new Date(closedShift.endTime).toLocaleDateString("es-MX")}</div>
          </div>

          <div>
            <strong>Cajero:</strong> ${closedShift.cashierName}<br/>
            <strong>Inicio:</strong> ${new Date(closedShift.startTime).toLocaleTimeString("es-MX")}<br/>
            <strong>Cierre:</strong> ${new Date(closedShift.endTime).toLocaleTimeString("es-MX")}<br/>
            <strong>Duración:</strong> ${duration()}<br/>
          </div>

          <div class="section">
            <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">TRANSACCIONES DEL TURNO</div>
            <table>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Hora</th>
                  <th>Cli</th>
                  <th>Pago</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="5" style="text-align:center;">No hubo ventas</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section totals">
            <div class="totals-row">
              <span>Fondo Inicial:</span>
              <span>$${closedShift.openingBalance.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Ventas Efectivo:</span>
              <span>$${closedShift.cashSales.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Ventas Tarj/Trans:</span>
              <span>$${closedShift.nonCashSales.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="border-top: 1px dashed #555; padding-top: 3px; font-style: italic;">
              <span>- Propias Zabalegui:</span>
              <span>$${ownSales.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="font-style: italic; color: #555;">
              <span>- Renta Espacio:</span>
              <span>$${spaceRentalTotal.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="border-top: 1px solid #000; padding-top: 5px;">
              <span>Efectivo Esperado:</span>
              <span>$${closedShift.expectedBalance.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Efectivo Físico:</span>
              <span>$${closedShift.closingBalance.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="color: ${closedShift.discrepancy >= 0 ? "#000" : "#d00"}">
              <span>Diferencia:</span>
              <span>$${closedShift.discrepancy.toFixed(2)}</span>
            </div>
            <div class="totals-row" style="border-top: 1px solid #000; padding-top: 5px; font-size: 12pt;">
              <span>TOTAL VENTAS:</span>
              <span>$${closedShift.totalSales.toFixed(2)}</span>
            </div>
          </div>

          <div class="text-center footer">
            <div>Firma del Cajero</div>
            <br/><br/>
            <div>_______________________</div>
            <div style="margin-top: 15px;">Zabalegui POS v2.0</div>
          </div>
        </body>
      </html>
    `);
    popupWin.document.close();
  };

  const printSaleReceipt = (receipt) => {
    const popupWin = window.open("", "_blank", "width=320,height=500");
    if (!popupWin) {
      showToast("Por favor permita las ventanas emergentes para imprimir.", "warning");
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

    popupWin.document.write(`
      <html>
        <head>
          <title>Ticket - Zabalegui</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 47mm; /* Ancho real imprimible de impresoras 58mm */
              background: #fff;
            }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 7.5pt; 
              line-height: 1.15; 
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
    popupWin.document.close();
  };

  // Buscar productos manualmente por nombre o código de barras
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.barcode.includes(searchQuery)
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, products]);

  // Captura global de teclado para escáner físico de pistola en fase de captura (sin escribir en pantalla)
  useEffect(() => {
    let barcodeBuffer = "";
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e) => {
      // Ignorar si se está enfocando otro input (como búsqueda de clientes o efectivo recibido)
      if (
        document.activeElement.tagName === "INPUT" && 
        document.activeElement !== searchInputRef.current
      ) {
        return;
      }

      // Ignorar teclas especiales de control
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // Limpiar el buffer si pasó mucho tiempo (más de 150ms) entre teclas
      if (timeDiff > 150) {
        barcodeBuffer = "";
      }

      if (e.key === "Enter") {
        if (barcodeBuffer.length >= 4) {
          const barcode = barcodeBuffer;
          barcodeBuffer = "";
          
          const prod = products.find(p => p.barcode === barcode);
          if (prod) {
            playBeep();
            addToCart(prod);
            showToast(`Añadido: ${prod.name}`, "success");
            
            // Si el buscador manual estaba enfocado, limpiarlo y quitar el foco
            if (searchInputRef.current) {
              searchInputRef.current.value = "";
              setSearchQuery("");
              searchInputRef.current.blur(); // Quitar foco para que los siguientes escaneos sean 100% silenciosos
            }
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
        barcodeBuffer = "";
      } else if (e.key.length === 1 && /[0-9a-zA-Z]/.test(e.key)) {
        barcodeBuffer += e.key;

        // Si el buscador NO está enfocado, capturamos silenciosamente y prevenimos que se pinte en pantalla
        if (document.activeElement !== searchInputRef.current) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          // Si el buscador SÍ está enfocado, pero las teclas llegan muy rápido (escáner), bloqueamos el tipeo
          if (timeDiff < 50 && barcodeBuffer.length > 1) {
            e.preventDefault();
            e.stopPropagation();
            
            // Limpiar del buscador el primer dígito que se haya colado
            if (searchInputRef.current) {
              searchInputRef.current.value = "";
              setSearchQuery("");
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true); // true activa la fase de captura
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, true);
  }, [products]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const cleanQuery = searchQuery.trim();
      if (!cleanQuery) return;

      // 1. Coincidencia exacta de código de barras
      const barcodeMatch = products.find(p => p.barcode === cleanQuery);
      if (barcodeMatch) {
        playBeep();
        addToCart(barcodeMatch);
        showToast(`Añadido: ${barcodeMatch.name}`, "success");
        setSearchQuery("");
        if (searchInputRef.current) searchInputRef.current.blur();
        e.preventDefault();
        return;
      }
      
      // 2. Coincidencia por autocompletado (añadir el primero)
      if (searchResults.length > 0) {
        playBeep();
        addToCart(searchResults[0]);
        showToast(`Añadido: ${searchResults[0].name}`, "success");
        setSearchQuery("");
        if (searchInputRef.current) searchInputRef.current.blur();
        e.preventDefault();
      }
    }
  };

  // Sonido de Beep sintético para escaneo exitoso
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(950, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn("AudioContext no iniciado por permisos", e);
    }
  };

  // Inicializar escáner de cámara
  const startCameraScanner = () => {
    setIsScanning(true);
    // Esperar a que el elemento se monte en el DOM
    setTimeout(async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        const scanner = new Html5QrcodeScanner(
          "reader", 
          { 
            fps: 10, 
            qrbox: { width: 250, height: 120 }, // optimizado para códigos de barra
            aspectRatio: 1.0
          }, 
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            // Escaneo exitoso
            handleBarcodeScanned(decodedText);
            scanner.clear();
            setIsScanning(false);
          },
          (error) => {
            // Silenciar logs de escaneo fallido por frame
          }
        );
        scannerRef.current = scanner;
      } catch (err) {
        showToast("No se pudo iniciar la cámara: " + err.message, "error");
        setIsScanning(false);
      }
    }, 100);
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error("Error al apagar cámara", err));
    }
    setIsScanning(false);
  };

  // Manejar el código de barras obtenido por cámara o enter rápido
  const handleBarcodeScanned = (barcode) => {
    const prod = products.find(p => p.barcode === barcode);
    if (prod) {
      playBeep();
      addToCart(prod);
      showToast(`Añadido: ${prod.name}`, "success");
    } else {
      showToast(`Código de barras "${barcode}" no registrado en inventario.`, "error");
    }
  };

  // Buscar cliente por teléfono
  const handleFindClient = (e) => {
    e.preventDefault();
    if (!clientSearch) return;

    const users = db.getUsers();
    // Clientes pueden buscarse por celular o email
    const client = users.find(u => 
      (u.phone === clientSearch || u.email === clientSearch) && 
      u.role === "cliente"
    );

    if (client) {
      setAssociatedClient(client);
      setClientSearch("");
      showToast(`Cliente asociado: ${client.name}`, "success");
    } else {
      showToast("Cliente no encontrado. Registra al cliente primero.", "error");
    }
  };

  // Carrito helpers
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast("Producto sin existencias en inventario.", "error");
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Solo quedan ${product.stock} piezas en inventario.`, "warning");
          return prevCart;
        }
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const updateQuantity = (id, amount) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + amount;
          if (newQty <= 0) return null;
          if (newQty > item.stock) {
            showToast(`Límite de stock alcanzado (${item.stock} piezas)`, "warning");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Cálculos de montos
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Regla: 1 punto de recompensa equivale a $1 peso de descuento si eligen usar puntos
  const pointsAvailable = associatedClient ? associatedClient.points : 0;
  
  // Determinar descuento si pagan con puntos
  const discount = paymentMethod === "Puntos" ? Math.min(subtotal, pointsAvailable) : 0;
  const total = subtotal - discount;

  // Puntos ganados en la compra (10% del total real pagado con efectivo/tarjeta)
  const pointsToEarn = paymentMethod !== "Puntos" ? Math.round(total * 0.1) : 0;

  // Finalizar compra
  const handleFinalizeSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === "Efectivo") {
      const cash = parseFloat(cashReceived);
      if (isNaN(cash) || cash < total) {
        showToast("Monto de efectivo insuficiente o inválido.", "error");
        return;
      }
    }

    try {
      const saleData = {
        cashierId: currentUser.id,
        cashierName: currentUser.name,
        customerId: associatedClient ? associatedClient.id : null,
        customerName: associatedClient ? associatedClient.name : "Público General",
        items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, isSpaceRental: !!i.isSpaceRental })),
        subtotal,
        discount,
        total,
        paymentMethod,
        pointsEarned: pointsToEarn,
        pointsUsed: paymentMethod === "Puntos" ? discount : 0
      };

      const sale = db.createSale(saleData);
      
      // Actualizar listado de productos de App.jsx para reflejar la reducción de stock
      onRefreshProducts();
      
      // Guardar ticket para visualización
      setLastSaleReceipt({
        ...sale,
        change: paymentMethod === "Efectivo" ? parseFloat(cashReceived) - total : 0,
        cashReceived: paymentMethod === "Efectivo" ? parseFloat(cashReceived) : total
      });

      // Resetear estados
      setCart([]);
      setAssociatedClient(null);
      setCashReceived("");
      setShowPaymentModal(false);
      showToast("¡Venta procesada con éxito!", "success");
    } catch (err) {
      showToast("Error al procesar la venta: " + err.message, "error");
    }
  };

  if (!activeShift) {
    return (
      <div style={{ padding: "4rem 1.5rem", maxWidth: "480px", margin: "0 auto" }}>
        <div className="glass-panel" style={{ padding: "2.5rem 2rem", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(197, 146, 146, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
            color: "var(--primary-color)"
          }}>
            <ShoppingBag size={30} />
          </div>
          
          <h2 style={{ margin: "0 0 0.5rem 0", color: "var(--text-dark)", fontSize: "1.6rem" }}>Apertura de Caja</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: "1.4" }}>
            Para comenzar a realizar ventas y registrar transacciones, inicia tu turno ingresando los siguientes datos:
          </p>

          <form onSubmit={handleStartShift} style={{ textAlign: "left" }}>
            <div className="input-group" style={{ marginBottom: "1.25rem" }}>
              <label className="input-label">Nombre del Cajero</label>
              <input
                type="text"
                className="input-field"
                value={cajeroName}
                onChange={(e) => setCajeroName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: "2rem" }}>
              <label className="input-label">Fondo de Caja Inicial ($ MXN)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="Ej. 1000.00 (Fondo en efectivo)"
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                Dinero en efectivo con el que se inicia la caja.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem" }}>
              Iniciar Turno y Abrir Caja
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>Punto de Venta</h1>
          <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
            Registra ventas, aplica recompensas VIP y asocia puntos.
          </p>
        </div>
        
        {/* Banner de Turno Activo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          background: "rgba(197, 146, 146, 0.1)",
          padding: "0.75rem 1.25rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid rgba(197, 146, 146, 0.2)",
          fontSize: "0.95rem"
        }}>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>CAJERO ACTIVO</span>
            <strong>{activeShift.cashierName}</strong>
          </div>
          <div style={{ borderLeft: "1px solid rgba(49, 29, 32, 0.15)", paddingLeft: "1.25rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>TIEMPO TRANSCURRIDO</span>
            <strong style={{ fontFamily: "monospace", fontSize: "1.05rem", color: "var(--primary-color)" }}>{elapsedTime}</strong>
          </div>
          <button 
            className="btn btn-danger btn-sm" 
            onClick={() => {
              const sales = db.getSales();
              const shiftSales = sales.filter(s => s.shiftId === activeShift.id || 
                (!s.shiftId && s.date >= activeShift.startTime));
              let cash = 0;
              shiftSales.forEach(s => {
                if (s.paymentMethod === "Efectivo") cash += s.total;
              });
              setClosingBalance((activeShift.openingBalance + cash).toString());
              setShowCloseShiftModal(true);
            }}
            style={{ padding: "0.5rem 0.9rem" }}
          >
            Finalizar Turno
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "1.5rem", alignItems: "start" }}>
        {/* LADO IZQUIERDO: Búsqueda, Escaneo y Carrito */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Fila de Buscador y Escáner */}
          <div className="glass-panel" style={{ padding: "1.5rem", position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={20} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="input-field"
                  placeholder="Buscar por Nombre de producto o Código de barras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                />
                
                {/* Autocompletar flotante */}
                {searchResults.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 50,
                    overflow: "hidden"
                  }}>
                    {searchResults.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => addToCart(prod)}
                        style={{
                          padding: "0.75rem 1rem",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid #f0ebe9",
                          transition: "var(--transition-fast)"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-app)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                      >
                        <div>
                          <strong style={{ display: "block", fontSize: "0.95rem" }}>{prod.name}</strong>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cod: {prod.barcode} • Stock: {prod.stock}</span>
                        </div>
                        <span style={{ fontWeight: "600", color: "var(--primary-color)" }}>${prod.price.toFixed(2)} MXN</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de Escanear con Cámara */}
              <button 
                className="btn btn-accent" 
                onClick={isScanning ? stopCameraScanner : startCameraScanner}
                style={{ whiteSpace: "nowrap" }}
              >
                <Camera size={18} /> {isScanning ? "Apagar Cámara" : "Escanear por Cámara"}
              </button>
            </div>

            {/* Contenedor del Escáner de Cámara */}
            {isScanning && (
              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Apunta el código de barras del producto hacia la cámara
                </p>
                <div className="scanner-container">
                  <div className="scanner-overlay-line" />
                  <div id="reader"></div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={stopCameraScanner} style={{ marginTop: "1rem" }}>
                  Cancelar Escaneo
                </button>
              </div>
            )}
          </div>

          {/* Lista del Carrito */}
          <div className="glass-panel" style={{ padding: "1.5rem", minHeight: "350px" }}>
            <h3 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              Productos en el Carrito ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h3>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
                <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                <p>El carrito está vacío. Escanea un código o busca un producto arriba.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {cart.map(item => (
                  <div key={item.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    background: "white",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(74, 21, 37, 0.05)",
                    boxShadow: "var(--shadow-sm)"
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--accent-gold)", fontWeight: "600" }}>{item.category}</span>
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>{item.name}</h4>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>${item.price.toFixed(2)} c/u</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0 1.5rem" }}>
                      <button className="btn btn-secondary" style={{ padding: "0.25rem", borderRadius: "50%", minWidth: "28px", height: "28px" }} onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: "600", fontSize: "1.1rem", width: "24px", textAlign: "center" }}>{item.quantity}</span>
                      <button className="btn btn-secondary" style={{ padding: "0.25rem", borderRadius: "50%", minWidth: "28px", height: "28px" }} onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--primary-color)", width: "100px", textAlign: "right" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: "none", border: "none", color: "#c93b54", cursor: "pointer", padding: "0.25rem" }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LADO DERECHO: Resumen, Cliente, Fidelización y Checkout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Módulo de Fidelización / Cliente */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", margin: "0 0 1rem 0" }}>
              <User size={20} color="var(--primary-color)" /> Cliente / Fidelización
            </h3>

            {!associatedClient ? (
              <form onSubmit={handleFindClient}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  Busca al cliente por Celular o Correo para sumar/canjear puntos.
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Celular (10 dígitos)"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-secondary">Buscar</button>
                </div>
              </form>
            ) : (
              <div style={{
                background: "linear-gradient(135deg, rgba(197, 155, 142, 0.1), rgba(74, 21, 37, 0.05))",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--accent-gold)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem" }}>{associatedClient.name}</h4>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Phone size={12} /> {associatedClient.phone}
                    </span>
                  </div>
                  <button 
                    onClick={() => setAssociatedClient(null)} 
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "white", padding: "0.5rem 0.75rem", borderRadius: "8px", marginTop: "0.75rem" }}>
                  <Award size={18} color="var(--accent-gold-bright)" />
                  <span style={{ fontSize: "0.9rem" }}>Puntos disponibles: <strong>{associatedClient.points} pts</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Resumen de Venta / Totales */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem 0" }}>Resumen de Cobro</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              
              {associatedClient && paymentMethod === "Puntos" && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#a82e3b" }}>
                  <span>Descuento de Puntos</span>
                  <strong>-${discount.toFixed(2)}</strong>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "1px solid var(--border-color)", margin: "0.5rem 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.4rem" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: "700" }}>Total</span>
                <strong style={{ color: "var(--primary-color)" }}>${total.toFixed(2)} MXN</strong>
              </div>

              {associatedClient && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  color: "#4a7551",
                  background: "#eef7f0",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  marginTop: "0.5rem"
                }}>
                  <span>Puntos acumulados con esta compra:</span>
                  <strong>+{pointsToEarn} pts</strong>
                </div>
              )}
            </div>

            <button 
              className={`btn btn-primary ${cart.length === 0 ? "btn-disabled" : ""}`} 
              style={{ width: "100%", padding: "1rem" }}
              disabled={cart.length === 0}
              onClick={() => setShowPaymentModal(true)}
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: "1.5rem" }}>Cobrar Venta</h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <label className="input-label" style={{ marginBottom: "0.5rem" }}>Método de Pago</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                <button
                  onClick={() => setPaymentMethod("Efectivo")}
                  style={{
                    padding: "0.75rem 0.5rem",
                    borderRadius: "10px",
                    border: paymentMethod === "Efectivo" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                    background: paymentMethod === "Efectivo" ? "var(--bg-app)" : "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "var(--transition-fast)"
                  }}
                >
                  <DollarSign size={18} color="green" /> Efectivo
                </button>

                <button
                  onClick={() => setPaymentMethod("Tarjeta")}
                  style={{
                    padding: "0.75rem 0.5rem",
                    borderRadius: "10px",
                    border: paymentMethod === "Tarjeta" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                    background: paymentMethod === "Tarjeta" ? "var(--bg-app)" : "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "var(--transition-fast)"
                  }}
                >
                  <CreditCard size={18} color="blue" /> Tarjeta
                </button>

                <button
                  onClick={() => {
                    if (!associatedClient) {
                      showToast("Debes asociar un cliente para pagar con puntos.", "error");
                      return;
                    }
                    if (associatedClient.points <= 0) {
                      showToast("El cliente no tiene puntos para canjear.", "error");
                      return;
                    }
                    setPaymentMethod("Puntos");
                  }}
                  className={!associatedClient ? "btn-disabled" : ""}
                  style={{
                    padding: "0.75rem 0.5rem",
                    borderRadius: "10px",
                    border: paymentMethod === "Puntos" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                    background: paymentMethod === "Puntos" ? "var(--bg-app)" : "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "var(--transition-fast)",
                    opacity: !associatedClient ? 0.5 : 1
                  }}
                >
                  <Award size={18} color="gold" /> Puntos VIP
                </button>
              </div>
            </div>

            {paymentMethod === "Efectivo" && (
              <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="input-label">Efectivo Recibido</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Monto entregado por cliente"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  required
                />
                {cashReceived && parseFloat(cashReceived) >= total && (
                  <div style={{
                    marginTop: "0.5rem",
                    fontSize: "1.1rem",
                    color: "green",
                    fontWeight: "600"
                  }}>
                    Cambio: ${(parseFloat(cashReceived) - total).toFixed(2)} MXN
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "Puntos" && (
              <div style={{
                background: "rgba(197, 155, 142, 0.1)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
                fontSize: "0.9rem"
              }}>
                <p style={{ margin: "0 0 0.5rem 0" }}>El cliente pagará usando sus puntos:</p>
                <div>Puntos Disponibles: <strong>{pointsAvailable} pts</strong></div>
                <div>Descuento Aplicado: <strong>-${discount.toFixed(2)} MXN</strong></div>
                <div style={{ marginTop: "0.25rem" }}>Total Restante a Pagar: <strong>${total.toFixed(2)} MXN</strong></div>
              </div>
            )}

            {paymentMethod === "Tarjeta" && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                Procesar el cobro en la terminal bancaria externa por un monto de <strong>${total.toFixed(2)} MXN</strong> y presionar el botón de abajo al finalizar.
              </p>
            )}

            <button
              onClick={handleFinalizeSale}
              className="btn btn-primary"
              style={{ width: "100%", padding: "1rem" }}
            >
              Completar Transacción
            </button>
          </div>
        </div>
      )}

      {/* TICKET DE VENTA (IMPRIMIBLE) */}
      {lastSaleReceipt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "360px", fontFamily: "monospace", padding: "1.5rem", color: "#333" }}>
            <button className="modal-close" onClick={() => setLastSaleReceipt(null)}>
              <X size={20} />
            </button>
            
            <div style={{ textAlign: "center", borderBottom: "1px dashed #ccc", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: "0 0 0.25rem 0", fontFamily: "monospace" }}>ZABALEGUI</h3>
              <p style={{ margin: 0, fontSize: "0.8rem" }}>Armenta y López 1025</p>
              <p style={{ margin: 0, fontSize: "0.8rem" }}>Tel: 9541184642</p>
              <p style={{ margin: 0, fontSize: "0.8rem" }}>Horario: 11:00 - 18:30</p>
            </div>

            <div style={{ fontSize: "0.8rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div><strong>Folio:</strong> {lastSaleReceipt.id}</div>
              <div><strong>Fecha:</strong> {new Date(lastSaleReceipt.date).toLocaleString()}</div>
              <div><strong>Caja:</strong> {lastSaleReceipt.cashierName}</div>
              <div><strong>Cliente:</strong> {lastSaleReceipt.customerName}</div>
            </div>

            <div style={{ borderBottom: "1px dashed #ccc", paddingBottom: "0.5rem", marginBottom: "0.5rem", fontSize: "0.8rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontWeight: "bold", marginBottom: "0.25rem" }}>
                <span>Art.</span>
                <span style={{ textAlign: "center" }}>Cant.</span>
                <span style={{ textAlign: "right" }}>Imp.</span>
              </div>
              {lastSaleReceipt.items.map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", marginBottom: "0.25rem" }}>
                  <span>{item.name.slice(0, 18)}</span>
                  <span style={{ textAlign: "center" }}>{item.quantity}</span>
                  <span style={{ textAlign: "right" }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.25rem", borderBottom: "1px dashed #ccc", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal:</span>
                <span>${lastSaleReceipt.subtotal.toFixed(2)}</span>
              </div>
              {lastSaleReceipt.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Descto. Puntos:</span>
                  <span>-${lastSaleReceipt.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                <span>TOTAL:</span>
                <span>${lastSaleReceipt.total.toFixed(2)} MXN</span>
              </div>
            </div>

            <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Pago con:</span>
                <span>{lastSaleReceipt.paymentMethod}</span>
              </div>
              {lastSaleReceipt.paymentMethod === "Efectivo" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Efectivo Recibido:</span>
                    <span>${lastSaleReceipt.cashReceived.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Cambio:</span>
                    <span>${lastSaleReceipt.change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {lastSaleReceipt.customerId && (
              <div style={{
                textAlign: "center",
                background: "#eee",
                padding: "0.5rem",
                borderRadius: "4px",
                fontSize: "0.8rem"
              }}>
                <div>Puntos Ganados hoy: <strong>+{lastSaleReceipt.pointsEarned}</strong></div>
                {lastSaleReceipt.pointsUsed > 0 && <div>Puntos Redimidos: <strong>-{lastSaleReceipt.pointsUsed}</strong></div>}
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem" }}>
              <strong>¡Gracias por tu compra!</strong>
              <p style={{ margin: "0.25rem 0 0 0" }}>Vuelve pronto por tus puntos VIP</p>
            </div>
            
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => printSaleReceipt(lastSaleReceipt)}
              style={{ width: "100%", marginTop: "1.5rem", fontFamily: "'Outfit', sans-serif" }}
            >
              Imprimir Ticket
            </button>
          </div>
        </div>
      )}

      {/* MODAL CIERRE DE TURNO / CORTE DE CAJA */}
      {showCloseShiftModal && (() => {
        const sales = db.getSales();
        const shiftSales = sales.filter(s => s.shiftId === activeShift.id || 
          (!s.shiftId && s.date >= activeShift.startTime));
        
        let cashSales = 0;
        let cardSales = 0;
        let totalSalesCount = shiftSales.length;
        let spaceRentalTotal = 0;

        shiftSales.forEach(s => {
          if (s.paymentMethod === "Efectivo") {
            cashSales += s.total;
          } else {
            cardSales += s.total;
          }
          // Sumar productos en renta de espacio
          s.items.forEach(item => {
            if (item.isSpaceRental) {
              spaceRentalTotal += item.price * item.quantity;
            }
          });
        });

        const expectedCash = activeShift.openingBalance + cashSales;
        const totalVendido = cashSales + cardSales;
        const ownTotal = totalVendido - spaceRentalTotal;

        return (
          <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <div className="modal-content" style={{ maxWidth: "420px" }}>
              <button className="modal-close" onClick={() => setShowCloseShiftModal(false)}>
                <X size={20} style={{ transform: "rotate(45deg)" }} />
              </button>
              
              <h2 style={{ marginBottom: "0.5rem" }}>Cierre de Caja & Corte</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Verifica las transacciones de tu turno antes de realizar el cierre físico.
              </p>

              <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1.5rem", background: "rgba(49, 29, 32, 0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.95rem" }}>
                  <span>Ventas en Turno:</span>
                  <strong>{totalSalesCount} transacciones</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.95rem" }}>
                  <span>Fondo Inicial:</span>
                  <strong>${activeShift.openingBalance.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.95rem" }}>
                  <span>Ventas en Efectivo (+):</span>
                  <strong style={{ color: "green" }}>+${cashSales.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "0.95rem" }}>
                  <span>Ventas Tarjeta/Trans:</span>
                  <strong>+${cardSales.toFixed(2)}</strong>
                </div>

                {/* Desglose de Renta de Espacio vs Propias */}
                <div style={{ borderTop: "1px dashed var(--border-color)", margin: "0.5rem 0", paddingTop: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    <span>Ventas Propias Zabalegui:</span>
                    <strong>${ownTotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.9rem", color: "#d97706" }}>
                    <span>Renta de Espacio (Consignación):</span>
                    <strong>${spaceRentalTotal.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  padding: "0.6rem 0", 
                  fontSize: "1rem", 
                  fontWeight: "700",
                  borderTop: "1px dashed var(--border-color)",
                  marginTop: "0.5rem"
                }}>
                  <span>Efectivo Esperado en Caja:</span>
                  <span style={{ color: "var(--primary-color)" }}>${expectedCash.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleCloseShift}>
                <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="input-label" style={{ fontWeight: "700" }}>Efectivo Físico Contado ($ MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    placeholder="Ingresa la cantidad física contada"
                    autoFocus
                    required
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Cuenta todo el dinero de la caja (incluyendo el fondo inicial).
                  </span>
                </div>

                <button type="submit" className="btn btn-danger" style={{ width: "100%", padding: "1rem" }}>
                  Cerrar Caja e Imprimir Corte
                </button>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
