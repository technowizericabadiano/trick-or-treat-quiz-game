import React, { createContext, useContext, useState, useMemo } from "react";
import { uiText } from "./content/localization";

const LocalizationContext = createContext();

export function LocalizationProvider({ children }) {
  const [language, setLanguage] = useState("en");

  const copy = useMemo(() => uiText[language], [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      copy,
    }),
    [language, copy]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
}