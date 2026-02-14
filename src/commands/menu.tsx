import React from "react";
import { render } from "ink";
import Menu from "../ui/Menu.js";
import { ThemeProvider } from "../ui/ThemeContext.js";

export function menuCommand(): void {
  render(
    <ThemeProvider>
      <Menu />
    </ThemeProvider>,
  );
}
