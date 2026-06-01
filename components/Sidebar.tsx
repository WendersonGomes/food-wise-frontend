"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { LogoutConfirmationModal } from "@/components/auth/LogoutConfirmationModal";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/Button";
import { NavButton } from "@/components/NavButton";
import { navigationItems } from "@/lib/navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  function closeAfterLogout() {
    setLogoutOpen(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="flex h-full w-[min(86vw,22rem)] flex-col rounded-3xl bg-background p-4 shadow-[24px_0_80px_rgba(0,0,0,0.24)]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              duration: 0.22,
              ease: "easeOut",
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <BrandLogo href="/dashboard" onClick={onClose} />
              <Button
                aria-label="Fechar menu"
                size="icon"
                variant="ghost"
                onClick={onClose}
              >
                <X className="h-5 w-5" strokeWidth={1.9} />
              </Button>
            </div>

            <nav className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <NavButton key={item.href} {...item} onClick={onClose} />
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-4">
              <Button
                className="w-full justify-start"
                icon={<LogOut className="h-5 w-5" strokeWidth={1.9} />}
                variant="ghost"
                onClick={() => setLogoutOpen(true)}
              >
                Sair
              </Button>
            </div>
          </motion.div>

          <LogoutConfirmationModal
            isOpen={isLogoutOpen}
            onClose={() => setLogoutOpen(false)}
            onLoggedOut={closeAfterLogout}
          />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
