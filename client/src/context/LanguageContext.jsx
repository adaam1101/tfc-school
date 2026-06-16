import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext({ lang: "fr", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("tfc_lang") || "fr");

  const setLang = (l) => {
    localStorage.setItem("tfc_lang", l);
    setLangState(l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  };

  // Apply on mount
  React.useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
