"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AccountAvatar } from "@/components/auth/AccountAvatar";
import { AccountMenuPopup } from "@/components/auth/AccountMenuPopup";
import { LogoutConfirmationModal } from "@/components/auth/LogoutConfirmationModal";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const { user } = useAuth();
  const [isOpen, setOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!user) {
    return null;
  }

  const label = user.displayName || user.email || "Usuário";
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Abrir menu do usuário"
        className="flex min-h-11 items-center gap-2 rounded-3xl bg-(--surface) px-2 py-1.5 text-left shadow-[0_10px_28px_rgba(15,23,42,0.07)]"
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((currentValue) => !currentValue)}
      >
        <AccountAvatar avatarUrl={user.avatarUrl} initial={initial} />
        <span className="hidden max-w-36 truncate text-sm font-semibold text-foreground md:block">
          {label}
        </span>
        <motion.span
          className="hidden text-(--muted-foreground) sm:block"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={1.9} />
        </motion.span>
      </motion.button>

      <AccountMenuPopup
        isOpen={isOpen}
        user={user}
        onLogoutRequest={() => {
          setOpen(false);
          setLogoutOpen(true);
        }}
      />

      <LogoutConfirmationModal
        isOpen={isLogoutOpen}
        onClose={() => setLogoutOpen(false)}
      />
    </div>
  );
}
