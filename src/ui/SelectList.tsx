import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "./ThemeContext.js";

export interface SelectItem {
  label: string;
  value: string;
  description?: string;
}

interface SelectListProps {
  items: SelectItem[];
  onSelect: (item: SelectItem) => void;
  onCancel?: () => void;
  title?: string;
  escHint?: boolean;
}

export default function SelectList({ items, onSelect, onCancel, title, escHint }: SelectListProps) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset cursor when items change (e.g. switching screens)
  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useInput((_input, key) => {
    if (key.upArrow) {
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (key.downArrow) {
      setActiveIndex((i) => (i >= items.length - 1 ? 0 : i + 1));
    } else if (key.return) {
      onSelect(items[activeIndex]);
    } else if (key.escape && onCancel) {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {title && (
        <Box marginBottom={1}>
          <Text bold>{title}</Text>
        </Box>
      )}
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <Box key={item.value}>
            <Text color={isActive ? theme.primary : undefined}>
              {isActive ? "> " : "  "}
              {item.label}
            </Text>
          </Box>
        );
      })}
      {items[activeIndex].description && (
        <Box marginTop={1}>
          <Text dimColor>{items[activeIndex].description}</Text>
        </Box>
      )}
      {escHint && (
        <Box marginTop={1}>
          <Text color={theme.warning}>Press Esc again to quit</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text dimColor>[↑↓ navigate · Enter select · Esc back{onCancel ? "" : " (×2 quit)"}]</Text>
      </Box>
    </Box>
  );
}
