"use client";

import { LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { NotificationViewport } from "@/components/ui/NotificationViewport";
import { useApiConnection } from "@/hooks/useApiConnection";

const statusMessages = {
  DEGRADED:
    "Nao foi possivel atualizar agora. Exibindo as informacoes ja carregadas.",
  OFFLINE:
    "Nao foi possivel salvar novas alteracoes no momento.",
  RECOVERING: "Tentando novamente...",
};

export function ApiConnectionBanner() {
  const { status, requestRetry } = useApiConnection();

  if (status === "ONLINE") {
    return null;
  }

  return (
    <NotificationViewport
      action={
        <Button
          disabled={status === "RECOVERING"}
          icon={
            status === "RECOVERING" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={1.9} />
            ) : (
              <RefreshCw className="h-4 w-4" strokeWidth={1.9} />
            )
          }
          size="sm"
          variant="secondary"
          onClick={requestRetry}
        >
          {status === "RECOVERING" ? "Reconectando" : "Tentar novamente"}
        </Button>
      }
      description={
        status !== "RECOVERING"
          ? "As acoes voltam a ficar disponiveis em instantes."
          : undefined
      }
      isOpen
      title={statusMessages[status]}
      variant="warning"
    />
  );
}
