"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children" | "size"> & {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
  secondary:
    "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
  ghost:
    "text-[var(--muted-foreground)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  icon: "h-11 w-11 p-0",
};

export function Button({
  children,
  className,
  icon,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: props.disabled ? 0 : -1 }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-3xl font-semibold transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </motion.button>
  );
}
