"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

export type NotificationVariant = "error" | "warning" | "success" | "info";
export type NotificationContext = "page" | "modal" | "auth" | "floating";

type NotificationProps = {
  action?: ReactNode;
  className?: string;
  context?: NotificationContext;
  description?: ReactNode;
  onDismiss?: () => void;
  title: ReactNode;
  variant?: NotificationVariant;
};

const variantStyles: Record<
  NotificationVariant,
  {
    barClassName: string;
    icon: LucideIcon;
    iconClassName: string;
  }
> = {
  error: {
    barClassName: "bg-red-500",
    icon: AlertCircle,
    iconClassName:
      "bg-red-500/10 text-red-700 dark:bg-red-400/10 dark:text-red-300",
  },
  warning: {
    barClassName: "bg-amber-500",
    icon: AlertTriangle,
    iconClassName:
      "bg-amber-500/10 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200",
  },
  success: {
    barClassName: "bg-emerald-500",
    icon: CheckCircle2,
    iconClassName:
      "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200",
  },
  info: {
    barClassName: "bg-sky-500",
    icon: Info,
    iconClassName:
      "bg-sky-500/10 text-sky-700 dark:bg-sky-300/10 dark:text-sky-200",
  },
};

const contextStyles: Record<NotificationContext, string> = {
  page:
    "w-full rounded-3xl bg-(--surface) p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)] ring-1 ring-(--border)",
  modal:
    "rounded-2xl bg-background/80 p-3 shadow-none ring-1 ring-(--border)",
  auth:
    "rounded-3xl bg-(--surface-strong)/75 p-4 text-left shadow-sm ring-1 ring-(--border)",
  floating:
    "rounded-3xl bg-(--surface)/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.18)] ring-1 ring-(--border) backdrop-blur-xl",
};

export function Notification({
  action,
  className,
  context = "page",
  description,
  onDismiss,
  title,
  variant = "error",
}: NotificationProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;
  const isCompact = context === "modal";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "relative flex items-start gap-3 overflow-hidden text-foreground",
        contextStyles[context],
        className,
      )}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1", styles.barClassName)}
      />

      <span
        className={cn(
          "ml-1 flex shrink-0 items-center justify-center rounded-2xl",
          isCompact ? "h-8 w-8" : "h-10 w-10",
          styles.iconClassName,
        )}
      >
        <Icon className={isCompact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.9} />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-semibold leading-5",
            isCompact ? "text-sm" : "text-sm sm:text-base",
          )}
        >
          {title}
        </p>
        {description ? (
          <div className="mt-1 text-sm leading-6 text-(--muted-foreground)">
            {description}
          </div>
        ) : null}
        {action ? <div className="mt-3 flex flex-wrap gap-2">{action}</div> : null}
      </div>

      {onDismiss ? (
        <Button
          aria-label="Fechar notificacao"
          className="-mr-1 -mt-1 text-(--muted-foreground) hover:bg-(--surface-strong) hover:text-foreground"
          size="icon"
          variant="ghost"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" strokeWidth={1.9} />
        </Button>
      ) : null}
    </motion.div>
  );
}
