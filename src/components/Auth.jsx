// Auth.jsx - Registro e Inicio de Sesión con Roles (Gerente, Cajero, Cliente)
import React, { useState } from "react";
import { Lock, Mail, Phone, User, LogIn, UserPlus, ShieldAlert, Gift } from "lucide-react";
import { db } from "../utils/db";

export default function Auth({ onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [roleSelection, setRoleSelection] = useState("cliente"); // cliente, cajero, gerente
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form States (For clients)
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const users = db.getUsers();
    
    // Buscar usuario por correo y contraseña
    const user = users.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
    );

    if (user) {
      onLoginSuccess(user);
      showToast(`¡Bienvenido de nuevo, ${user.name}!`, "success");
    } else {
      showToast("Correo electrónico o contraseña incorrectos.", "error");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regName || !regPhone || !regPassword) {
      showToast("Por favor llena los campos requeridos.", "error");
      return;
    }
    
    if (regPhone.length < 10) {
      showToast("El número de teléfono debe tener al menos 10 dígitos.", "error");
      return;
    }

    try {
      const newUser = db.registerUser({
        name: regName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        role: "cliente" // Registro público siempre es de cliente
      });
      onLoginSuccess(newUser);
      showToast("¡Registro exitoso! Te regalamos 20 puntos de bienvenida.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Autocompletar cuentas de demo rápida para simplificar pruebas
  const fillDemoAccount = (role) => {
    if (role === "gerente") {
      setLoginEmail("gerente@belleza.com");
      setLoginPassword("admin123");
    } else if (role === "cajero") {
      setLoginEmail("cajero@belleza.com");
      setLoginPassword("caja123");
    } else {
      setLoginEmail("sofia@email.com");
      setLoginPassword("sofia123");
    }
    showToast(`Datos demo cargados para: ${role.toUpperCase()}`, "success");
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      padding: "2rem 1.5rem"
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: "480px",
        padding: "2.5rem",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)"
      }}>
        {/* Toggle Login / Register */}
        <div style={{
          display: "flex",
          background: "rgba(74, 21, 37, 0.05)",
          borderRadius: "25px",
          padding: "0.25rem",
          marginBottom: "2rem"
        }}>
          <button
            onClick={() => setIsRegister(false)}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "20px",
              border: "none",
              background: !isRegister ? "white" : "transparent",
              color: !isRegister ? "var(--primary-color)" : "var(--text-muted)",
              fontWeight: "600",
              cursor: "pointer",
              transition: "var(--transition-fast)"
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsRegister(true)}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: "20px",
              border: "none",
              background: isRegister ? "white" : "transparent",
              color: isRegister ? "var(--primary-color)" : "var(--text-muted)",
              fontWeight: "600",
              cursor: "pointer",
              transition: "var(--transition-fast)"
            }}
          >
            Registrarse (Cliente)
          </button>
        </div>

        {!isRegister ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ marginBottom: "0.25rem" }}>Ingresar al Sistema</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Accede a tu cuenta de cliente o perfil del staff</p>
            </div>

            <div className="input-group">
              <label className="input-label">Correo Electrónico</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="ejemplo@correo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
              <label className="input-label">Contraseña</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.9rem" }}>
              <LogIn size={18} /> Iniciar Sesión
            </button>

            {/* Demostración / Rápido Acceso Staff */}
            <div style={{
              marginTop: "2rem",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(197, 155, 142, 0.08)",
              border: "1px dashed var(--accent-gold)"
            }}>
              <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <ShieldAlert size={14} /> Accesos rápidos de Demostración:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button type="button" onClick={() => fillDemoAccount("gerente")} className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                  🔑 Gerente
                </button>
                <button type="button" onClick={() => fillDemoAccount("cajero")} className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                  🔑 Cajero
                </button>
                <button type="button" onClick={() => fillDemoAccount("cliente")} className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                  🔑 Cliente Premium
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ marginBottom: "0.25rem" }}>Crear Cuenta de Lealtad</h2>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#2b613a",
                background: "#eef7f0",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600",
                marginTop: "0.5rem"
              }}>
                <Gift size={14} /> ¡Gana 20 puntos al registrarte!
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Nombre Completo *</label>
              <div style={{ position: "relative" }}>
                <User size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Tu nombre completo"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Número de Celular * (Servirá para buscarte en Caja)</label>
              <div style={{ position: "relative" }}>
                <Phone size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="10 dígitos (Ej: 5551234567)"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Correo Electrónico (Opcional)</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="correo@ejemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
              <label className="input-label">Crear Contraseña *</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min. 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.9rem" }}>
              <UserPlus size={18} /> Registrarme & Obtener Puntos
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
