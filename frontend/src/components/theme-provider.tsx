"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Minimal theme provider used only so components like Sonner can read the current theme.
// We keep config simple and avoid app-specific theming.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
