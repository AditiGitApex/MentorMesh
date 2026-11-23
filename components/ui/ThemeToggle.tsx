"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg bg-secondary border border-border" aria-hidden />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mesh-signal))]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden group"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      style={{ transition: "all 0.2s ease" }}
    >
      <span
        className="transition-all duration-300 group-hover:scale-110"
        style={{ display: "flex" }}
      >
        {isDark
          ? <Moon className="h-4 w-4" aria-hidden />
          : <Sun className="h-4 w-4 group-hover:rotate-45 transition-transform duration-300" aria-hidden />
        }
      </span>
    </button>
  )
}

