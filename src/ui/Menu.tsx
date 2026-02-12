import React, { useState, useRef } from "react";
import { useApp, useInput } from "ink";
import SelectList, { type SelectItem } from "./SelectList.js";
import StatsScreen from "./StatsScreen.js";
import ConfigScreen from "./ConfigScreen.js";
import App from "./App.js";
import { BoxBreathingApp } from "../commands/box-breathing.js";
import { insertSession } from "../store/history.js";
import { getConfig } from "../store/config.js";
import { CYCLE_MS } from "./BoxBreathingViz.js";

const mainItems: SelectItem[] = [
  { label: "Breath Awareness", value: "breathe", description: "Guided breathing with a visual pacer" },
  { label: "Mindful Break", value: "break", description: "A short mindfulness pause" },
  { label: "Box Breathing", value: "box-breathing", description: "Inhale · Hold · Exhale · Hold" },
  { label: "View Stats", value: "stats", description: "See your meditation history" },
  { label: "Settings", value: "config", description: "View and update configuration" },
  { label: "Quit", value: "quit" },
];

const durationItems: SelectItem[] = [
  { label: "1 minute", value: "60" },
  { label: "3 minutes", value: "180" },
  { label: "5 minutes", value: "300" },
  { label: "10 minutes", value: "600" },
  { label: "15 minutes", value: "900" },
];

const roundsItems: SelectItem[] = [
  { label: "2 rounds", value: "2" },
  { label: "4 rounds", value: "4" },
  { label: "6 rounds", value: "6" },
  { label: "8 rounds", value: "8" },
];

type Screen = "main" | "duration" | "rounds" | "stats" | "config" | "breathe" | "break" | "box-breathing";

const DOUBLE_ESC_MS = 400;

export default function Menu() {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>("main");
  const [selectedCommand, setSelectedCommand] = useState<string>("");
  const [sessionArgs, setSessionArgs] = useState<number>(0);
  const [escPending, setEscPending] = useState(false);
  const lastEscRef = useRef<number>(0);
  const sessionStartRef = useRef<string>("");

  // Double-Esc to exit only on menu/picker screens
  // Session screens and info screens handle their own Esc (single press goes back)
  const isMenuScreen = screen === "main" || screen === "duration" || screen === "rounds";
  useInput((_input, key) => {
    if (!isMenuScreen) return;
    if (key.escape) {
      const now = Date.now();
      if (now - lastEscRef.current < DOUBLE_ESC_MS) {
        exit();
      } else {
        lastEscRef.current = now;
        setEscPending(true);
      }
    } else {
      setEscPending(false);
      lastEscRef.current = 0;
    }
  });

  const goBack = () => {
    setScreen("main");
    setSelectedCommand("");
    setSessionArgs(0);
    setEscPending(false);
    lastEscRef.current = 0;
  };

  const handleMainSelect = (item: SelectItem) => {
    if (item.value === "quit") {
      exit();
      return;
    }
    if (item.value === "stats") {
      setScreen("stats");
      return;
    }
    if (item.value === "config") {
      setScreen("config");
      return;
    }
    if (item.value === "box-breathing") {
      setSelectedCommand(item.value);
      setScreen("rounds");
      return;
    }
    setSelectedCommand(item.value);
    setScreen("duration");
  };

  const handleDurationSelect = (item: SelectItem) => {
    const seconds = parseInt(item.value, 10);
    setSessionArgs(seconds);
    sessionStartRef.current = new Date().toISOString();
    setScreen(selectedCommand as Screen);
  };

  const handleRoundsSelect = (item: SelectItem) => {
    const rounds = parseInt(item.value, 10);
    setSessionArgs(rounds);
    sessionStartRef.current = new Date().toISOString();
    setScreen("box-breathing");
  };

  if (screen === "stats") {
    return <StatsScreen onBack={goBack} />;
  }

  if (screen === "config") {
    return <ConfigScreen onBack={goBack} />;
  }

  if (screen === "breathe") {
    const seconds = sessionArgs || getConfig().defaultDuration;
    return (
      <App
        duration={seconds}
        type="Breath Awareness"
        onBack={goBack}
        onComplete={(elapsed) => {
          insertSession({
            started_at: sessionStartRef.current,
            completed_at: new Date().toISOString(),
            duration_seconds: elapsed,
            planned_duration: seconds,
            meditation_type: "Breath Awareness",
            completed: elapsed >= seconds,
          });
        }}
      />
    );
  }

  if (screen === "break") {
    const seconds = sessionArgs || 2 * 60;
    return (
      <App
        duration={seconds}
        type="Mindful Break"
        onBack={goBack}
        onComplete={(elapsed) => {
          insertSession({
            started_at: sessionStartRef.current,
            completed_at: new Date().toISOString(),
            duration_seconds: elapsed,
            planned_duration: seconds,
            meditation_type: "Mindful Break",
            completed: elapsed >= seconds,
          });
        }}
      />
    );
  }

  if (screen === "box-breathing") {
    const rounds = sessionArgs || 4;
    const totalDuration = rounds * (CYCLE_MS / 1000);
    return (
      <BoxBreathingApp
        rounds={rounds}
        onBack={goBack}
        onComplete={(elapsed) => {
          insertSession({
            started_at: sessionStartRef.current,
            completed_at: new Date().toISOString(),
            duration_seconds: elapsed,
            planned_duration: totalDuration,
            meditation_type: "Box Breathing",
            completed: elapsed >= totalDuration,
          });
        }}
      />
    );
  }

  if (screen === "duration") {
    return (
      <SelectList
        key="duration"
        title="Choose duration"
        items={durationItems}
        onSelect={handleDurationSelect}
        onCancel={goBack}
        escHint={escPending}
      />
    );
  }

  if (screen === "rounds") {
    return (
      <SelectList
        key="rounds"
        title="Choose rounds"
        items={roundsItems}
        onSelect={handleRoundsSelect}
        onCancel={goBack}
        escHint={escPending}
      />
    );
  }

  return (
    <SelectList
      key="main"
      title="Headspace"
      items={mainItems}
      onSelect={handleMainSelect}
      escHint={escPending}
    />
  );
}
