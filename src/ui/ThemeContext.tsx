import React, { createContext, useContext } from "react";
import { type Theme, getThemeByName } from "./theme.js";
import { getConfig } from "../store/config.js";

const ThemeContext = createContext<Theme>(getThemeByName("default"));

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  themeName?: string;
}

export function ThemeProvider({ children, themeName }: ThemeProviderProps) {
  const name = themeName ?? getConfig().theme;
  const theme = getThemeByName(name);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
