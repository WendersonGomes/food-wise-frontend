"use client";

import { Card } from "@/components/Card";
import { FoodImage } from "@/components/inventory/FoodImage";
import {
  formatExpirationDate,
  formatQuantity,
  getFoodThumbnail,
  storageLocationLabels,
} from "@/lib/inventory";
import type { InventorySummaryItem } from "@/types/inventory";

type DashboardFoodPreviewProps = {
  eagerImage?: boolean;
  item: InventorySummaryItem;
};

type DashboardPreviewListProps = {
  emptyMessage: string;
  items: InventorySummaryItem[];
  title: string;
};

function DashboardFoodPreview({
  eagerImage = false,
  item,
}: DashboardFoodPreviewProps) {
  return (
    <Card className="flex w-full min-w-0 items-center gap-3 overflow-hidden p-3">
      <FoodImage
        alt={`Imagem de ${item.name}`}
        eager={eagerImage}
        src={getFoodThumbnail(item)}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.name}
        </p>
        <p className="mt-1 truncate text-xs text-(--muted-foreground)">
          {storageLocationLabels[item.storageLocation]} /{" "}
          {formatQuantity(item.quantity, item.quantityUnit)} /{" "}
          {formatExpirationDate(item.expiresAt)}
        </p>
      </div>
    </Card>
  );
}

export function DashboardPreviewList({
  emptyMessage,
  items,
  title,
}: DashboardPreviewListProps) {
  return (
    <div className="grid min-w-0 content-start gap-3">
      <div className="flex min-h-6 items-center justify-between gap-3">
        <h2 className="min-w-0 truncate text-base font-semibold text-foreground">
          {title}
        </h2>
        {items.length ? (
          <span className="shrink-0 text-xs font-medium text-(--muted-foreground)">
            {items.length} itens
          </span>
        ) : null}
      </div>
      {items.length ? (
        <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <DashboardFoodPreview
              eagerImage={index === 0}
              item={item}
              key={item.id}
            />
          ))}
        </div>
      ) : (
        <Card className="p-4 text-sm text-(--muted-foreground)">
          {emptyMessage}
        </Card>
      )}
    </div>
  );
}
