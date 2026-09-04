import { useThemeContext } from "../context/ThemeContext.jsx";

export function useTheme() {
  const { dark, toggleTheme, setTheme, theme } = useThemeContext();
  return {
    dark,
    theme,
    toggle: toggleTheme,
    toggleTheme,
    setTheme
  };
}
