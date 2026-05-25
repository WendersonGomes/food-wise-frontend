"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Boxes,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/lib/navigation";

type NavButtonProps = NavigationItem & {
  onClick?: () => void;
};

export function NavButton({ label, href, icon, onClick }: NavButtonProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const icons = {
    dashboard: LayoutDashboard,
    stock: Boxes,
    ai: Sparkles,
    settings: Settings,
  };
  const Icon = icons[icon];

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-3xl px-3 text-sm font-bold",
          isActive
            ? "bg-(--accent) text-white font-bold shadow-[0_14px_36px_rgba(47,125,70,0.24)]"
            : "text-(--muted-foreground) font-bold hover:bg-(--surface-strong) hover:text-foreground",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.9} />
        <span>{label}</span>
      </Link>
    </motion.div>
  );
}
