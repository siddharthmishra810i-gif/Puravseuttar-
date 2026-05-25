import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ThemeConfig, ThemeMode, getThemeByVibe, THEME_CONFIGS } from "../theme";

interface ThemeContextType {
  theme: ThemeConfig;
  personality: string;
  setPersonality: (p: string) => void;
  mood: string;
  setMood: (m: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialPersonality = "Adventure Seeker",
  initialMood = "",
}: {
  children: React.ReactNode;
  initialPersonality?: string;
  initialMood?: string;
}) {
  const [personality, setPersonality] = useState(initialPersonality);
  const [mood, setMood] = useState(initialMood);

  const theme = useMemo(() => {
    return getThemeByVibe(personality, mood);
  }, [personality, mood]);

  // Sync theme configurations to document custom properties for Tailwind and CSS
  useEffect(() => {
    const root = document.documentElement;
    if (root) {
      root.style.setProperty("--theme-accent-color", theme.accent);
      root.style.setProperty("--theme-accent-lighter", theme.accentLighter);
      root.style.setProperty("--theme-duration", `${theme.transitionDuration}s`);
    }
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    personality,
    setPersonality,
    mood,
    setMood,
  }), [theme, personality, mood]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider wrapper");
  }
  return context;
}
