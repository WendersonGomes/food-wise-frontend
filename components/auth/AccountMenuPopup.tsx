"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { AccountAvatar } from "@/components/auth/AccountAvatar";
import { Button } from "@/components/Button";
import type { AuthUser } from "@/types/auth";

type AccountMenuPopupProps = {
  isOpen: boolean;
  user: AuthUser;
  onLogoutRequest: () => void;
};

export function AccountMenuPopup({
  isOpen,
  user,
  onLogoutRequest,
}: AccountMenuPopupProps) {
  const label = user.displayName || user.email || "Usuário";
  const initial = label.charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-72 rounded-3xl bg-(--surface) p-3 shadow-[0_22px_70px_rgba(15,23,42,0.18)]"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          role="menu"
          transition={{ duration: 0.16 }}
        >
          <div className="flex items-center gap-3 px-2 py-1">
            <AccountAvatar
              avatarUrl={user.avatarUrl}
              initial={initial}
              size="lg"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {label}
              </p>
              {user.email ? (
                <p className="mt-1 truncate text-xs text-(--muted-foreground)">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-3 border-t border-(--border) pt-2">
            <Button
              className="w-full justify-start"
              icon={<LogOut className="h-5 w-5" strokeWidth={1.9} />}
              variant="ghost"
              onClick={onLogoutRequest}
            >
              Sair
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
