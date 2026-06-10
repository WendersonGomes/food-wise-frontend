"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LoginButton } from "@/components/auth/LoginButton";
import { Notification } from "@/components/ui/Notification";

type LoginCardProps = {
  error?: string | null;
};

export function LoginCard({ error }: LoginCardProps) {
  return (
    <section className="flex w-full max-w-md flex-col items-center">
      <motion.div
        className="mb-5 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.35 },
          y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Image
          src="/coala-logo-variant.svg"
          alt="Logo do FoodWise"
          width={176}
          height={176}
          className="bg-transparent"
          priority
        />
      </motion.div>

      <motion.div
        className="w-full rounded-3xl bg-(--surface) p-6 text-center shadow-[0_28px_80px_rgba(15,23,42,0.10)] sm:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { duration: 0.35, delay: 0.08 },
          y: {
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.18,
          },
        }}
      >
        <h1 className="text-2xl font-bold text-foreground">FoodWise</h1>
        <p className="mt-3 text-sm leading-6 text-(--muted-foreground) sm:text-base">
          Gerencie seus alimentos de forma inteligente e reduza desperdícios.
        </p>
        <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
          Entre com sua conta Google para continuar.
        </p>

        {error ? (
          <Notification className="mt-4" context="auth" title={error} />
        ) : null}

        <LoginButton />
      </motion.div>
    </section>
  );
}
