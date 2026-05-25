"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, LogOut, X } from "lucide-react";
import { Button } from "@/components/Button";
import { NavButton } from "@/components/NavButton";
import { navigationItems } from "@/lib/navigation";
import { clearStoredSession } from "@/services/auth";
import { useState } from "react";
import { Modal } from "./Modal";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  function handleLogout() {
    clearStoredSession();
    onClose();
    router.replace("/login");
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
              type: "spring", stiffness: 300,
              damping: 20, duration: 0.22, ease: "easeOut"
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-soft) text-(--accent)">
                  <Leaf className="h-6 w-6" strokeWidth={1.9} />
                </span>
                <span className="text-base font-bold text-foreground">
                  FoodWise
                </span>
              </div>
              <Button
                aria-label="Close menu"
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
                onClick={isLogoutOpen ? handleLogout : () => setLogoutOpen(true)}
              >
                Logout
              </Button>
            </div>
          </motion.div>
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
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
