"use client";

import {
  Archive,
  Clock,
  MapPinned,
  Snowflake,
  Thermometer,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DashboardPreviewList } from "@/components/dashboard/DashboardPreviewList";
import { MobileDashboardNav } from "@/components/MobileDashboardNav";
import { PageShell } from "@/components/PageShell";
import { NotificationViewport } from "@/components/ui/NotificationViewport";
import { DashboardPageSkeleton } from "@/components/ui/skeletons/DashboardPageSkeleton";
import { useInventoryDashboard } from "@/features/inventory/hooks/use-dashboard";
import {
  getApiErrorSupportCode,
  getUserFriendlyErrorMessage,
} from "@/lib/api/api-error-messages";

export default function DashboardPage() {
  const {
    data: summary,
    error,
    isLoading,
    lastSyncedAt,
    refetch,
  } = useInventoryDashboard();

  if (isLoading && !summary) {
    return <DashboardPageSkeleton />;
  }

  const errorMessage = error ? getUserFriendlyErrorMessage(error) : null;
  const supportCode = error ? getApiErrorSupportCode(error) : null;

  const stats = [
    {
      label: "Itens cadastrados",
      value: String(summary?.totalItems ?? 0),
      icon: Archive,
    },
    {
      label: "Vencidos",
      value: String(summary?.expiredItems ?? 0),
      icon: Clock,
    },
    {
      label: "Próximos do vencimento",
      value: String(summary?.expiringSoonItems ?? 0),
      icon: MapPinned,
    },
  ];

  const locations = [
    {
      name: "Geladeira",
      items: `${summary?.fridgeItems ?? 0} itens`,
      icon: Thermometer,
    },
    {
      name: "Freezer",
      items: `${summary?.freezerItems ?? 0} itens`,
      icon: Snowflake,
    },
    {
      name: "Despensa",
      items: `${summary?.pantryItems ?? 0} itens`,
      icon: Warehouse,
    },
  ];

  return (
    <PageShell
      eyebrow="Visão geral"
      title="Painel"
      description="Acompanhe seu estoque por data de validade, local de armazenamento e prioridade de consumo."
    >
      <MobileDashboardNav />

      {error ? (
        <NotificationViewport
          autoDismissMs={5500}
          className="max-w-xl"
          description={
            supportCode
              ? `Codigo de suporte: ${supportCode}`
              : lastSyncedAt
                ? `Ultima atualizacao: ${new Intl.DateTimeFormat("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(lastSyncedAt)}.`
                : "As informacoes serao atualizadas automaticamente."
          }
          isOpen
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void refetch({ force: true }).catch(() => undefined)}
            >
              Tentar novamente
            </Button>
          }
          title={errorMessage}
          variant="warning"
        />
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-(--muted-foreground)">
                {stat.label}
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-soft) text-(--accent)">
                <stat.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {stat.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {locations.map((location) => (
          <Card key={location.name} className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-soft) text-(--accent)">
                <location.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <h2 className="text-lg font-semibold text-foreground">
                {location.name}
              </h2>
            </div>
            <p className="mt-4 text-2xl font-bold text-(--accent)">
              {location.items}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <DashboardPreviewList
          emptyMessage="Nenhum item recente."
          items={summary?.recentItems ?? []}
          title="Itens recentes"
        />
      </section>
    </PageShell>
  );
}
