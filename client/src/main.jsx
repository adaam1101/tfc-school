import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { brandColors } from "./config/branding.js";
import "./styles/index.css";

// Apply brand color scale as CSS variables
const root = document.documentElement;
Object.entries(brandColors).forEach(([key, val]) => {
  root.style.setProperty(`--brand-${key}`, val);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
