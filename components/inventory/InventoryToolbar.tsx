"use client";

import { Filter, FolderPlus, Plus } from "lucide-react";
import { Button } from "@/components/Button";

type InventoryToolbarProps = {
  disabled?: boolean;
  hasAdvancedFilters: boolean;
  onOpenCategoryModal: () => void;
  onOpenFoodModal: () => void;
  onOpenFilterModal: () => void;
};

export function InventoryToolbar({
  disabled = false,
  hasAdvancedFilters,
  onOpenCategoryModal,
  onOpenFoodModal,
  onOpenFilterModal,
}: InventoryToolbarProps) {
  const disabledReason = disabled
    ? "Disponivel novamente em instantes."
    : undefined;

  return (
    <section className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
      <div className="grid gap-4 sm:flex">
        <Button
          disabled={disabled}
          icon={<Plus className="h-5 w-5" strokeWidth={1.9} />}
          title={disabledReason}
          onClick={onOpenFoodModal}
        >
          Adicionar alimento
        </Button>
        <Button
          disabled={disabled}
          icon={<FolderPlus className="h-5 w-5" strokeWidth={1.9} />}
          title={disabledReason}
          variant="secondary"
          onClick={onOpenCategoryModal}
        >
          Adicionar categoria
        </Button>
        <div className="flex items-center gap-2">
          <Button
            className="w-full"
            icon={<Filter className="h-5 w-5" strokeWidth={1.9} />}
            variant={hasAdvancedFilters ? "primary" : "secondary"}
            onClick={onOpenFilterModal}
          >
            Filtrar por
            {hasAdvancedFilters ? (
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                ativo
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </section>
  );
}
