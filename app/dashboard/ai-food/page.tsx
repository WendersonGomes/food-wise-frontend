"use client";

import { useState } from "react";
import {
  Bot,
  Camera,
  ImageUp,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { PageShell } from "@/components/PageShell";

const quickPrompts = [
  "What should I cook with food expiring soon?",
  "How should I store fresh vegetables?",
  "Can you identify this food from a photo?",
  "Create a low-waste meal plan.",
];

const messages = [
  {
    from: "AI",
    text: "Ask a question about storage, expiration, recipes, or use the actions above for prompts and photo analysis.",
  },
  {
    from: "You",
    text: "Which ingredients should I use first this week?",
  },
];

export default function FoodAIPage() {
  const [activeModal, setActiveModal] = useState<"prompts" | "photo" | null>(
    null,
  );

  return (
    <PageShell
      eyebrow="Assistant"
      title="Food AI"
      description="Ask questions, use ready-made prompts, and analyze food photos in one place."
    >
      <Card className="mx-auto flex min-h-[34rem] w-full max-w-4xl flex-col p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <MessageCircle className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Food chat
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              className="w-full sm:w-auto"
              icon={<Sparkles className="h-4 w-4" strokeWidth={1.9} />}
              variant="secondary"
              onClick={() => setActiveModal("prompts")}
            >
              Quick prompts
            </Button>
            <Button
              className="w-full sm:w-auto"
              icon={<Camera className="h-4 w-4" strokeWidth={1.9} />}
              variant="secondary"
              onClick={() => setActiveModal("photo")}
            >
              Photo analysis
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-1 flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.text}
              className="max-w-[92%] rounded-3xl bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:max-w-[78%] sm:p-4"
            >
              <p className="mb-1 flex items-center gap-2 font-semibold text-[var(--accent)]">
                {message.from === "AI" ? (
                  <Bot className="h-4 w-4" strokeWidth={1.9} />
                ) : (
                  <UserRound className="h-4 w-4" strokeWidth={1.9} />
                )}
                {message.from}
              </p>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex min-h-12 items-center justify-between rounded-3xl bg-[var(--background)] px-4 text-sm text-[var(--muted-foreground)] shadow-inner">
          <span>Ask Food AI</span>
          <Send className="h-4 w-4" strokeWidth={1.9} />
        </div>
      </Card>

      <Modal
        isOpen={activeModal === "prompts"}
        title="Quick prompts"
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              className="rounded-3xl bg-[var(--background)] px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-strong)]"
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "photo"}
        title="Photo analysis"
        onClose={() => setActiveModal(null)}
      >
        <div className="flex min-h-40 items-center justify-center rounded-3xl bg-[var(--background)] text-center text-sm text-[var(--muted-foreground)] shadow-inner">
          <div className="flex flex-col items-center gap-3 px-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ImageUp className="h-7 w-7" strokeWidth={1.9} />
            </span>
            Upload or capture a food photo
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
          <p>Identified food: waiting for image</p>
          <p>Suggested location: fridge, freezer, or pantry</p>
          <p>Next step: confirm before saving to inventory</p>
        </div>
      </Modal>
    </PageShell>
  );
}
