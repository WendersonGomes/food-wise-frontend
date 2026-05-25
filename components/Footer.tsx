"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      className="bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.24, delay: 0.08 }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-(--muted-foreground) sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>FoodWise</p>
        <p>Fridge, freezer, and pantry in one place.</p>
      </div>
    </motion.footer>
  );
}
