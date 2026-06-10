"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import {
  defaultInventoryFilters,
  storageLocationLabels,
} from "@/lib/inventory";
import {
  StorageLocation,
  type CategoryFilter,
  type ExpirationFilter,
  type FoodCategory,
  type InventoryFilters,
  type SortOption,
} from "@/types/inventory";

type AdvancedFiltersModalProps = {
  categories: FoodCategory[];
  filters: InventoryFilters;
  isOpen: boolean;
  onApply: (filters: InventoryFilters) => void;
  onClose: () => void;
};

export function AdvancedFiltersModal({
  categories,
  filters,
  isOpen,
  onApply,
  onClose,
}: AdvancedFiltersModalProps) {
  const [draftFilters, setDraftFilters] = useState(filters);

  function applyFilters() {
    onApply(draftFilters);
    onClose();
  }

  function clearFilters() {
    setDraftFilters(defaultInventoryFilters);
    onApply(defaultInventoryFilters);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} size="lg" title="Filtrar inventário" onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectDropdown
          label="Local de armazenamento"
          options={[
            { value: "ALL", label: "Todos" },
            ...Object.values(StorageLocation).map((location) => ({
              value: location,
              label: storageLocationLabels[location],
            })),
          ]}
          value={draftFilters.storageLocation}
          onChange={(storageLocation) =>
            setDraftFilters((currentFilters) => ({
              ...currentFilters,
              storageLocation,
            }))
          }
        />

        <SelectDropdown<CategoryFilter>
          label="Categoria"
          options={[
            { value: "ALL", label: "Todas as categorias" },
            {
              value: "SYSTEM",
              label: "Categorias padrão do sistema",
            },
            { value: "CUSTOM", label: "Categorias personalizadas" },
            ...categories.map((category) => ({
              value: category.id,
              label: category.name,
              description: category.isSystem ? "Padrão" : "Personalizada",
            })),
          ]}
          value={draftFilters.category}
          onChange={(category) =>
            setDraftFilters((currentFilters) => ({
              ...currentFilters,
              category,
            }))
          }
        />

        <SelectDropdown<ExpirationFilter>
          label="Data de validade"
          options={[
            { value: "ALL", label: "Todos" },
            { value: "EXPIRED", label: "Vencidos" },
            { value: "TODAY", label: "Vencem hoje" },
            { value: "SOON", label: "Próximos do vencimento" },
            { value: "NEXT_3_DAYS", label: "Vencem nos próximos 3 dias" },
            { value: "NEXT_7_DAYS", label: "Vencem nos próximos 7 dias" },
            { value: "NO_DATE", label: "Sem data de validade" },
          ]}
          value={draftFilters.expiration}
          onChange={(expiration) =>
            setDraftFilters((currentFilters) => ({
              ...currentFilters,
              expiration,
            }))
          }
        />

        <SelectDropdown<SortOption>
          label="Ordenação"
          options={[
            { value: "NAME_ASC", label: "Ordem alfabética crescente" },
            { value: "NAME_DESC", label: "Ordem alfabética decrescente" },
            { value: "EXPIRATION_ASC", label: "Data de validade mais próxima" },
            { value: "EXPIRATION_DESC", label: "Data de validade mais distante" },
            { value: "RECENTLY_ADDED", label: "Adicionados recentemente" },
            { value: "OLDEST_ADDED", label: "Adicionados há mais tempo" },
            { value: "QUANTITY_DESC", label: "Maior quantidade" },
            { value: "QUANTITY_ASC", label: "Menor quantidade" },
          ]}
          value={draftFilters.sort}
          onChange={(sort) =>
            setDraftFilters((currentFilters) => ({
              ...currentFilters,
              sort,
            }))
          }
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={clearFilters}>
          Limpar filtros
        </Button>
        <Button onClick={applyFilters}>Aplicar filtros</Button>
      </div>
    </Modal>
  );
}
