"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="transition-colors duration-quick"
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-quick rotate-0" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-quick rotate-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
