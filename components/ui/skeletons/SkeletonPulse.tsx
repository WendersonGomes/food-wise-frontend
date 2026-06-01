"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SkeletonPulseProps = {
  children: ReactNode;
  className?: string;
};

export function SkeletonPulse({ children, className }: SkeletonPulseProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0.55 }}
      animate={{ opacity: [0.55, 1, 0.55] }}
      transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
      role="status"
    >
      <span className="sr-only">Carregando...</span>
      {children}
    </motion.div>
  );
}
