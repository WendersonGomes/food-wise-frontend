"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type QuickActionLinkItem = {
  type?: "link";
  label: string;
  href: string;
  icon?: LucideIcon;
};

type QuickActionButtonItem = {
  type: "button";
  label: string;
  value: string;
  icon?: LucideIcon;
};

type QuickActionNavProps = {
  items: Array<QuickActionLinkItem | QuickActionButtonItem>;
  activeValue?: string;
  className?: string;
  onSelect?: (value: string) => void;
};

export function QuickActionNav({
  items,
  activeValue,
  className,
  onSelect,
}: QuickActionNavProps) {
  return (
    <nav className={cn("-mx-4 flex gap-3 overflow-x-auto px-4 pb-1", className)}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive =
          item.type === "button" && activeValue !== undefined
            ? item.value === activeValue
            : false;
        const itemClassName = cn(
          "flex min-h-12 min-w-32 shrink-0 items-center justify-center gap-2 rounded-3xl px-4 text-sm font-semibold",
          isActive
            ? "bg-(--accent) text-white"
            : "bg-(--surface) text-foreground hover:bg-(--surface-strong)",
        );

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0"
          >
            {item.type === "button" ? (
              <button
                aria-pressed={isActive}
                className={itemClassName}
                type="button"
                onClick={() => onSelect?.(item.value)}
              >
                {Icon ? (
                  <Icon
                    className={cn("h-4 w-4", isActive ? "text-white" : "text-(--accent)")}
                    strokeWidth={1.9}
                  />
                ) : null}
                {item.label}
              </button>
            ) : (
              <Link href={item.href} className={itemClassName}>
                {Icon ? (
                  <Icon className="h-4 w-4 text-(--accent)" strokeWidth={1.9} />
                ) : null}
                {item.label}
              </Link>
            )}
          </motion.div>
        );
      })}
    </nav>
  );
}
