"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";

export function PublicHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      className="fixed left-0 top-0 z-30 w-full bg-(--background)/82 backdrop-blur-xl"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.24 }}
    >
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/login" />
        <Button
          aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          size="icon"
          variant="secondary"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" strokeWidth={1.9} />
          ) : (
            <Moon className="h-5 w-5" strokeWidth={1.9} />
          )}
        </Button>
      </div>
    </motion.header>
  );
}
