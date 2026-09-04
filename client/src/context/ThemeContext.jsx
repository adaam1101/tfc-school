import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  dark: false,
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("tfc-theme") || localStorage.getItem("tfc_theme");
      if (saved) return saved === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("tfc-theme", "dark");
      localStorage.setItem("tfc_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("tfc-theme", "light");
      localStorage.setItem("tfc_theme", "light");
    }
  }, [dark]);

  const toggleTheme = () => setDark((prev) => !prev);
  const setTheme = (mode) => setDark(mode === "dark");

  return (
    <ThemeContext.Provider value={{ dark, theme: dark ? "dark" : "light", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
