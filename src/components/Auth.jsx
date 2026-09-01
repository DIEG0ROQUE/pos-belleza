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
    const query = loginEmail.trim().toLowerCase();
    
    // Buscar usuario por correo o teléfono y contraseña
    const user = users.find(
      (u) => 
        (u.email?.toLowerCase() === query || u.phone === query) && 
        u.password === loginPassword
    );

    if (user) {
      onLoginSuccess(user);
      showToast(`¡Bienvenido, ${user.name}!`, "success");
    } else {
      showToast("Credenciales incorrectas. Verifica tu correo/celular y contraseña.", "error");
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
      showToast("¡Registro exitoso! Te regalamos 200 puntos de bienvenida.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
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
        maxWidth: "460px",
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
            Crear Cuenta VIP
          </button>
        </div>

        {!isRegister ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} method="post" action="#" autoComplete="on">
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <h2 style={{ marginBottom: "0.25rem", fontSize: "1.4rem" }}>Iniciar Sesión</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                Acceso para Administrador, Cajeros y Clientes VIP
              </p>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="loginUsername">Correo Electrónico o Celular</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  name="username"
                  id="loginUsername"
                  autoComplete="username"
                  className="input-field"
                  placeholder="admin@zabalegui.com o celular"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: "1.75rem" }}>
              <label className="input-label" htmlFor="loginPassword">Contraseña</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  name="password"
                  id="loginPassword"
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.9rem", fontSize: "1rem" }}>
              <LogIn size={18} /> Iniciar Sesión
            </button>
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
                <Gift size={14} /> ¡Gana 200 puntos al registrarte!
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="regName">Nombre Completo *</label>
              <div style={{ position: "relative" }}>
                <User size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  name="name"
                  id="regName"
                  autoComplete="name"
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
              <label className="input-label" htmlFor="regPhone">Número de Celular * (Para acumular puntos en Caja)</label>
              <div style={{ position: "relative" }}>
                <Phone size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="tel"
                  name="tel"
                  id="regPhone"
                  autoComplete="tel"
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
              <label className="input-label" htmlFor="regEmail">Correo Electrónico (Opcional)</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  name="email"
                  id="regEmail"
                  autoComplete="email"
                  className="input-field"
                  placeholder="correo@ejemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{ paddingLeft: "40px", width: "100%", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
              <label className="input-label" htmlFor="regPassword">Crear Contraseña *</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="var(--accent-gold)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  name="new-password"
                  id="regPassword"
                  autoComplete="new-password"
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
