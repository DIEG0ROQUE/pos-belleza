import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("React Error Boundary atrapó un error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "2rem",
          maxWidth: "800px",
          margin: "2rem auto",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          border: "1px solid #fecaca"
        }}>
          <h2 style={{ color: "#b91c1c", marginTop: 0 }}>⚠️ Ocurrió un error en la aplicación</h2>
          <p style={{ color: "#4b5563" }}>Detalles del error:</p>
          <pre style={{
            background: "#fef2f2",
            padding: "1rem",
            borderRadius: "8px",
            color: "#991b1b",
            overflowX: "auto",
            fontSize: "0.85rem"
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => {
              sessionStorage.clear();
              localStorage.removeItem("pos_session_user");
              window.location.reload();
            }}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              background: "#b91c1c",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            🔄 Limpiar Sesión y Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
