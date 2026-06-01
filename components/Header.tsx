"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { NavButton } from "@/components/NavButton";
import { Sidebar } from "@/components/Sidebar";
import { useTheme } from "@/hooks/useTheme";
import { navigationItems } from "@/lib/navigation";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <motion.header
        className="sticky top-0 z-30 bg-(--background)/82 backdrop-blur-xl"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.24 }}
      >
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-20 sm:px-6 lg:px-8">
          <BrandLogo href="/dashboard" />

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {navigationItems.map((item) => (
              <NavButton key={item.href} {...item} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
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
            <UserMenu />
            <Button
              aria-label="Abrir menu"
              className="lg:hidden"
              size="icon"
              variant="secondary"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" strokeWidth={1.9} />
            </Button>
          </div>
        </div>
      </motion.header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
