"use client";

import { motion } from "framer-motion";

type LoadingProps = {
  label?: string;
};

export function Loading({ label = "Carregando..." }: LoadingProps) {
  return (
    <div
      className="flex min-h-40 items-center justify-center gap-3 text-sm font-medium text-(--muted-foreground)"
      role="status"
    >
      <motion.span
        aria-hidden="true"
        className="h-3 w-3 rounded-full bg-(--accent)"
        animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
      {label}
    </div>
  );
}
