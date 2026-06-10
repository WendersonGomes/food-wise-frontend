"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Notification,
  type NotificationVariant,
} from "@/components/ui/Notification";
import { cn } from "@/lib/utils";

type NotificationViewportProps = {
  action?: ReactNode;
  autoDismissMs?: number;
  className?: string;
  description?: ReactNode;
  isOpen: boolean;
  onDismiss?: () => void;
  position?: "bottom" | "top";
  title: ReactNode;
  variant?: NotificationVariant;
};

const positionClasses = {
  bottom:
    "bottom-3 sm:bottom-4",
  top:
    "top-3 sm:top-4",
};

export function NotificationViewport({
  action,
  autoDismissMs = 6000,
  className,
  description,
  isOpen,
  onDismiss,
  position = "top",
  title,
  variant = "warning",
}: NotificationViewportProps) {
  const isBottom = position === "bottom";
  const notificationKey = `${variant}:${position}:${String(title)}:${String(
    description,
  )}`;
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const isVisible = isOpen && dismissedKey !== notificationKey;
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!isVisible || autoDismissMs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDismissedKey(notificationKey);
      onDismissRef.current?.();
    }, autoDismissMs);

    return () => window.clearTimeout(timeoutId);
  }, [autoDismissMs, isVisible, notificationKey]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={cn(
            "fixed inset-x-3 z-[80] mx-auto w-[calc(100%-1.5rem)] max-w-3xl sm:inset-x-4 sm:w-[calc(100%-2rem)]",
            positionClasses[position],
            className,
          )}
          exit={{ opacity: 0, y: isBottom ? 16 : -16, scale: 0.98 }}
          initial={{ opacity: 0, y: isBottom ? 16 : -16, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Notification
            action={action}
            context="floating"
            description={description}
            onDismiss={() => {
              setDismissedKey(notificationKey);
              onDismissRef.current?.();
            }}
            title={title}
            variant={variant}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
