"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <motion.main
      className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:px-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <section className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--accent)">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-(--muted-foreground) sm:text-base sm:leading-7">
          {description}
        </p>
      </section>
      {children}
    </motion.main>
  );
}
