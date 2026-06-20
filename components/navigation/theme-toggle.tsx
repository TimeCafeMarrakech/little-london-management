"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button aria-label="Theme loading" size="icon" type="button" variant="ghost">
        <Monitor className="h-4 w-4" aria-hidden="true" />
      </Button>
    );
  }

  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <Button aria-label={`Switch theme to ${nextTheme}`} onClick={() => setTheme(nextTheme)} size="icon" type="button" variant="ghost">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
