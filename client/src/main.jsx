import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { brandColors, schoolInfo } from "./config/branding.js";
import "./styles/index.css";

// Apply brand color scale as CSS variables
const root = document.documentElement;
Object.entries(brandColors).forEach(([key, val]) => {
  root.style.setProperty(`--brand-${key}`, val);
});

// Set browser tab title from env vars
document.title = `${schoolInfo.short} School`;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
