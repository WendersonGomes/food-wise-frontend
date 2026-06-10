import { SearchX } from "lucide-react";

type InventoryEmptyStateProps = {
  hasFilters: boolean;
};

export function InventoryEmptyState({ hasFilters }: InventoryEmptyStateProps) {
  return (
    <section className="rounded-3xl bg-(--surface) p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-(--accent-soft) text-(--accent)">
        <SearchX className="h-7 w-7" strokeWidth={1.9} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Nenhum alimento encontrado
      </h2>
      <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
        {hasFilters
          ? "Ajuste ou limpe os filtros para visualizar mais alimentos."
          : "Adicione seu primeiro alimento para começar a acompanhar o estoque."}
      </p>
    </section>
  );
}
