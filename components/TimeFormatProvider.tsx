"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type TimeFormatMode = "24h" | "12h";

type TimeFormatContextValue = {
  mode: TimeFormatMode;
  setMode: (mode: TimeFormatMode) => void;
};

const TimeFormatContext = createContext<TimeFormatContextValue | undefined>(undefined);

const STORAGE_KEY = "qh-time-format";

export function TimeFormatProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<TimeFormatMode>("24h");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as TimeFormatMode | null;
      if (saved === "12h" || saved === "24h") {
        setModeState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setMode = useCallback((next: TimeFormatMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return <TimeFormatContext.Provider value={value}>{children}</TimeFormatContext.Provider>;
}

export function useTimeFormat(): TimeFormatContextValue {
  const ctx = useContext(TimeFormatContext);
  if (!ctx) {
    throw new Error("useTimeFormat must be used within a TimeFormatProvider");
  }
  return ctx;
}

