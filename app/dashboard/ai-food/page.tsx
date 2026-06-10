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
  "O que posso cozinhar com alimentos próximos do vencimento?",
  "Como devo armazenar vegetais frescos?",
  "Você consegue identificar este alimento por foto?",
  "Crie um plano de refeições com menos desperdício.",
];

const messages = [
  {
    from: "IA",
    text: "Pergunte sobre armazenamento, validade, receitas ou use as ações acima para prompts e análise por foto.",
  },
  {
    from: "Você",
    text: "Quais ingredientes devo usar primeiro nesta semana?",
  },
];

export default function FoodAIPage() {
  const [activeModal, setActiveModal] = useState<"prompts" | "photo" | null>(
    null,
  );

  return (
    <PageShell
      eyebrow="Assistente"
      title="IA de alimentos"
      description="Converse com a IA, use prompts prontos e analise fotos de alimentos em um só lugar."
    >
      <Card className="mx-auto flex min-h-136 w-full max-w-4xl flex-col p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl bg-(--accent-soft) text-(--accent)">
              <MessageCircle className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Chat de alimentos
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              className="w-full sm:w-auto"
              icon={<Sparkles className="h-4 w-4" strokeWidth={1.9} />}
              variant="secondary"
              onClick={() => setActiveModal("prompts")}
            >
              Prompts rápidos
            </Button>
            <Button
              className="w-full sm:w-auto"
              icon={<Camera className="h-4 w-4" strokeWidth={1.9} />}
              variant="secondary"
              onClick={() => setActiveModal("photo")}
            >
              Análise por foto
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-1 flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.text}
              className="max-w-[92%] rounded-3xl bg-background p-3 text-sm leading-6 text-foreground shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:max-w-[78%] sm:p-4"
            >
              <p className="mb-1 flex items-center gap-2 font-semibold text-(--accent)">
                {message.from === "IA" ? (
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

        <div className="mt-4 flex min-h-12 items-center justify-between rounded-3xl bg-background px-4 text-sm text-(--muted-foreground) shadow-inner">
          <span>Pergunte à IA de alimentos</span>
          <Send className="h-4 w-4" strokeWidth={1.9} />
        </div>
      </Card>

      <Modal
        isOpen={activeModal === "prompts"}
        title="Prompts rápidos"
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              className="rounded-3xl bg-background px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-(--surface-strong)"
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "photo"}
        title="Análise por foto"
        onClose={() => setActiveModal(null)}
      >
        <div className="flex min-h-40 items-center justify-center rounded-3xl bg-background text-center text-sm text-(--muted-foreground) shadow-inner">
          <div className="flex flex-col items-center gap-3 px-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-(--accent-soft) text-(--accent)">
              <ImageUp className="h-7 w-7" strokeWidth={1.9} />
            </span>
            Envie ou capture uma foto do alimento
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-(--muted-foreground)">
          <p>Alimento identificado: aguardando imagem</p>
          <p>Local sugerido: geladeira, freezer ou despensa</p>
          <p>Próximo passo: confirme antes de salvar no estoque</p>
        </div>
      </Modal>
    </PageShell>
  );
}
