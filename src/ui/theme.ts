export interface Theme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  barFill: string;
  barEmpty: string;
  dot: string;
}

const defaultTheme: Theme = {
  primary: "cyan",
  secondary: "blue",
  success: "green",
  warning: "yellow",
  barFill: "━",
  barEmpty: "─",
  dot: "●",
};

const minimalTheme: Theme = {
  primary: "white",
  secondary: "gray",
  success: "white",
  warning: "white",
  barFill: "=",
  barEmpty: "-",
  dot: "o",
};

const focusTheme: Theme = {
  primary: "magenta",
  secondary: "blue",
  success: "green",
  warning: "yellow",
  barFill: "█",
  barEmpty: "░",
  dot: "◉",
};

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  minimal: minimalTheme,
  focus: focusTheme,
};

export function getThemeByName(name: string): Theme {
  return themes[name] ?? defaultTheme;
}
