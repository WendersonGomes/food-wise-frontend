"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { Button } from "@/components/Button";
import { PublicHeader } from "@/components/PublicHeader";

export function LoginPage() {
  const router = useRouter();

  function handleGoogleLogin() {
    router.replace("/dashboard");
  }

  return (
    <>
      <PublicHeader />
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <section className="flex w-full max-w-sm flex-col items-center">
          <motion.div
            className="mb-4 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.35 },
              y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Image
              src="/foodwise-logo.svg"
              alt="FoodWise logo"
              width={72}
              height={72}
              priority
              className="h-28 w-28 rounded-3xl shadow-[0_18px_45px_rgba(47,125,70,0.18)]"
            />
          </motion.div>

          <motion.div
            className="w-full rounded-3xl bg-(--surface) p-6 text-center shadow-[0_28px_80px_rgba(15,23,42,0.10)]"
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
            <p className="text-base leading-7 text-(--muted-foreground)">
              Sign in to manage your food inventory with clarity.
            </p>

            <Button
              className="mt-6 w-full"
              icon={<LogIn className="h-5 w-5" strokeWidth={1.9} />}
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </Button>
          </motion.div>
        </section>
      </main>
    </>
  );
}
