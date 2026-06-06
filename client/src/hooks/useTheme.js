import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("tfc-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("tfc-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("tfc-theme", "light");
    }
  }, [dark]);

  return { dark, toggle: () => setDark((v) => !v) };
}
