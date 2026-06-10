"use client";

import { Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FoodImage } from "@/components/inventory/FoodImage";
import { categoryIcons } from "@/components/inventory/categoryIcons";
import {
  expirationStatusLabels,
  formatExpirationDate,
  formatQuantity,
  getExpirationStatus,
  getFoodThumbnail,
  storageLocationLabels,
} from "@/lib/inventory";
import { cn } from "@/lib/utils";
import type { FoodCategory, FoodItem } from "@/types/inventory";

type FoodCardProps = {
  food: FoodItem;
  category?: FoodCategory;
  disabled?: boolean;
  eagerImage?: boolean;
  onEdit: (food: FoodItem) => void;
  onDelete: (food: FoodItem) => void;
};

const statusClasses = {
  EXPIRED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  EXPIRING_SOON:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  VALID: "bg-(--accent-soft) text-(--accent)",
  NO_DATE: "bg-(--surface-strong) text-(--muted-foreground)",
};

export function FoodCard({
  food,
  category,
  disabled = false,
  eagerImage = false,
  onEdit,
  onDelete,
}: FoodCardProps) {
  const status = getExpirationStatus(food.expiresAt);
  const Icon = category ? categoryIcons[category.icon] : undefined;
  const disabledReason = disabled
    ? "Disponivel novamente em instantes."
    : undefined;

  return (
    <Card className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex min-w-0 gap-3">
        <FoodImage
          alt={`Imagem de ${food.name}`}
          eager={eagerImage}
          src={getFoodThumbnail(food)}
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-foreground sm:text-lg">
                {food.name}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-(--muted-foreground)">
                {Icon ? (
                  <Icon className="h-4 w-4 shrink-0 text-(--accent)" strokeWidth={1.9} />
                ) : null}
                <span className="truncate">{category?.name ?? "Sem categoria"}</span>
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-3xl px-2.5 py-1 text-xs font-semibold",
                statusClasses[status],
              )}
            >
              {expirationStatusLabels[status]}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-(--muted-foreground) sm:text-sm">
            <span>{storageLocationLabels[food.storageLocation]}</span>
            <span aria-hidden="true" className="text-(--border)">
              /
            </span>
            <span>{formatQuantity(food.quantity, food.quantityUnit)}</span>
            <span aria-hidden="true" className="text-(--border)">
              /
            </span>
            <span>{formatExpirationDate(food.expiresAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
        <Button
          aria-label={`Editar ${food.name}`}
          disabled={disabled}
          icon={<Edit3 className="h-4 w-4" strokeWidth={1.9} />}
          size="sm"
          title={disabledReason}
          variant="secondary"
          onClick={() => onEdit(food)}
        >
          Editar
        </Button>
        <Button
          aria-label={`Excluir ${food.name}`}
          disabled={disabled}
          icon={<Trash2 className="h-4 w-4" strokeWidth={1.9} />}
          size="sm"
          title={disabledReason}
          variant="ghost"
          onClick={() => onDelete(food)}
        >
          Excluir
        </Button>
      </div>
    </Card>
  );
}
