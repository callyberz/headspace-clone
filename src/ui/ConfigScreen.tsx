import React, { useState } from "react";
import { Box, Text } from "ink";
import SelectList, { type SelectItem } from "./SelectList.js";
import { getConfig, setConfig } from "../store/config.js";

interface ConfigScreenProps {
  onBack: () => void;
}

type ConfigView = "list" | "edit-duration" | "edit-theme";

const durationOptions: SelectItem[] = [
  { label: "1 minute", value: "60" },
  { label: "3 minutes", value: "180" },
  { label: "5 minutes", value: "300" },
  { label: "10 minutes", value: "600" },
  { label: "15 minutes", value: "900" },
];

const themeOptions: SelectItem[] = [
  { label: "Default", value: "default" },
  { label: "Minimal", value: "minimal" },
  { label: "Focus", value: "focus" },
];

function formatDurationLabel(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

export default function ConfigScreen({ onBack }: ConfigScreenProps) {
  const [view, setView] = useState<ConfigView>("list");
  const [savedMsg, setSavedMsg] = useState<string>("");

  const cfg = getConfig();

  const settingItems: SelectItem[] = [
    {
      label: `Default Duration    ${formatDurationLabel(cfg.defaultDuration)}`,
      value: "defaultDuration",
      description: "Session duration when none is specified",
    },
    {
      label: `Theme               ${cfg.theme}`,
      value: "theme",
      description: "Visual theme for sessions",
    },
  ];

  const handleSettingSelect = (item: SelectItem) => {
    setSavedMsg("");
    if (item.value === "defaultDuration") {
      setView("edit-duration");
    } else if (item.value === "theme") {
      setView("edit-theme");
    }
  };

  const handleDurationSave = (item: SelectItem) => {
    const seconds = parseInt(item.value, 10);
    setConfig("defaultDuration", seconds);
    setSavedMsg(`Default duration set to ${formatDurationLabel(seconds)}`);
    setView("list");
  };

  const handleThemeSave = (item: SelectItem) => {
    setConfig("theme", item.value);
    setSavedMsg(`Theme set to ${item.value}`);
    setView("list");
  };

  const goToList = () => {
    setView("list");
  };

  if (view === "edit-duration") {
    return (
      <SelectList
        key="edit-duration"
        title="Default Duration"
        items={durationOptions}
        onSelect={handleDurationSave}
        onCancel={goToList}
      />
    );
  }

  if (view === "edit-theme") {
    return (
      <SelectList
        key="edit-theme"
        title="Theme"
        items={themeOptions}
        onSelect={handleThemeSave}
        onCancel={goToList}
      />
    );
  }

  return (
    <Box flexDirection="column">
      {savedMsg && (
        <Box paddingX={2} paddingTop={1}>
          <Text color="green">{savedMsg}</Text>
        </Box>
      )}
      <SelectList
        key="config-list"
        title="Settings"
        items={settingItems}
        onSelect={handleSettingSelect}
        onCancel={onBack}
      />
    </Box>
  );
}
