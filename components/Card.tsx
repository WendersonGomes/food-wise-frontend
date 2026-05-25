"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "rounded-3xl bg-[var(--surface)] p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)]",
        className,
      )}
      {...props}
    />
  );
}
