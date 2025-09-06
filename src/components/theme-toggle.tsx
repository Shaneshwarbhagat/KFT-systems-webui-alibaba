"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./providers/theme-provider"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 cursor-pointer" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 cursor-pointer" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
