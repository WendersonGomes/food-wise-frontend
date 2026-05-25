"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { NavButton } from "@/components/NavButton";
import { Sidebar } from "@/components/Sidebar";
import { useTheme } from "@/hooks/useTheme";
import { navigationItems } from "@/lib/navigation";
import { clearStoredSession } from "@/services/auth";

export function Header() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  function handleLogout() {
    clearStoredSession();
    setLogoutOpen(false);
    router.replace("/login");
  }

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
            <div className="hidden md:inline-flex">
              <Button
                className="w-full justify-start"
                icon={<LogOut className="h-5 w-5" strokeWidth={1.9} />}
                variant="ghost"
                onClick={isLogoutOpen ? handleLogout : () => setLogoutOpen(true)}
              >
                Logout
              </Button>
            </div>

            <Button
              aria-label={theme === "dark" ? "Enable light theme" : "Enable dark theme"}
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
            <Button
              aria-label="Open menu"
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

      <Modal
        isOpen={isLogoutOpen}
        title="End session"
        onClose={() => setLogoutOpen(false)}
      >
        <p className="text-sm leading-6 text-(--muted-foreground)">
          Your session will be closed in this browser.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setLogoutOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Modal>
    </>
  );
}
