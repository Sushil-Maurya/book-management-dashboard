"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import { lightTheme, darkTheme } from "@/lib/theme"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "book-dashboard-theme",
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)
  // Important: initialize to defaultTheme so SSR and the first client render match.
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    setMounted(true)
    // After mount, read the persisted theme (if any) and apply.
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage?.getItem(storageKey) : null
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        setTheme(stored as Theme)
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
    
    try {
      window.localStorage.setItem(storageKey, theme)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
    },
  }

  const getActiveTheme = () => {
    // During SSR and the very first client render, force lightTheme to avoid hydration mismatches.
    if (!mounted) {
      return lightTheme
    }
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme
    }
    return theme === "dark" ? darkTheme : lightTheme
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <MuiThemeProvider theme={getActiveTheme()}>{children}</MuiThemeProvider>
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
