"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Boxes, Settings, Sparkles } from "lucide-react";

const mobileItems = [
  { label: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { label: "Food AI", href: "/dashboard/ai-food", icon: Sparkles },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileDashboardNav() {
  return (
    <nav className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:hidden">
      {mobileItems.map((item, index) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.04 }}
          whileTap={{ scale: 0.98 }}
          className="shrink-0"
        >
          <Link
            href={item.href}
            className="flex min-h-12 min-w-32 items-center justify-center gap-2 rounded-3xl bg-(--surface) px-4 text-sm font-semibold text-foreground shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
          >
            <item.icon className="h-4 w-4 text-(--accent)" strokeWidth={1.9} />
            {item.label}
          </Link>
        </motion.div>
      ))}
    </nav>
  );
}
