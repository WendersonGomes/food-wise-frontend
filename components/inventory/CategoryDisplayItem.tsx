import type { ReactNode } from "react";
import { categoryIcons } from "@/components/inventory/categoryIcons";
import { cn } from "@/lib/utils";
import type { FoodCategory } from "@/types/inventory";

type CategoryDisplayItemProps = {
  category: FoodCategory;
  actions?: ReactNode;
  className?: string;
  showNormalizedName?: boolean;
};

export function CategoryDisplayItem({
  category,
  actions,
  className,
  showNormalizedName = false,
}: CategoryDisplayItemProps) {
  const Icon = categoryIcons[category.icon];

  return (
    <div
      className={cn(
        "flex min-w-0 items-center justify-between gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl bg-(--accent-soft) text-(--accent)">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {category.name}
            </p>
            <span
              className={cn(
                "rounded-3xl px-2 py-0.5 text-xs font-semibold",
                category.isSystem
                  ? "bg-(--surface-strong) text-(--muted-foreground)"
                  : "bg-(--accent-soft) text-(--accent)",
              )}
            >
              {category.isSystem ? "Padrão" : "Personalizada"}
            </span>
          </div>
          {showNormalizedName ? (
            <p className="truncate text-xs text-(--muted-foreground)">
              {category.normalizedName}
            </p>
          ) : null}
        </div>
      </div>

      {actions ? <div className="flex shrink-0 gap-1">{actions}</div> : null}
    </div>
  );
}
