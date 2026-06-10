"use client";

import { useMemo, useState } from "react";
import { AdvancedFiltersModal } from "@/components/inventory/AdvancedFiltersModal";
import { CategoryManagerModal } from "@/components/inventory/CategoryManagerModal";
import { FoodCard } from "@/components/inventory/FoodCard";
import { FoodFormModal } from "@/components/inventory/FoodFormModal";
import { InventoryEmptyState } from "@/components/inventory/InventoryEmptyState";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import { StorageQuickFilters } from "@/components/inventory/StorageQuickFilters";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { PageShell } from "@/components/PageShell";
import { NotificationViewport } from "@/components/ui/NotificationViewport";
import { InventoryPageSkeleton } from "@/components/ui/skeletons/InventoryPageSkeleton";
import { ConflictError } from "@/lib/api/api-errors";
import {
  applyInventoryFilters,
  defaultInventoryFilters,
  getCategoryById,
  isAdvancedFilterActive,
} from "@/lib/inventory";
import { useInventoryCategories } from "@/features/inventory/hooks/use-categories";
import { useInventoryItems } from "@/features/inventory/hooks/use-items";
import { useApiConnection } from "@/hooks/useApiConnection";
import type {
  FoodCategory,
  FoodFormSubmitValues,
  FoodItem,
  InventoryFilters,
} from "@/types/inventory";

export default function InventoryPage() {
  const {
    categories,
    createCategory,
    error: categoriesError,
    isLoading: isLoadingCategories,
    removeCategory,
    updateCategory,
  } = useInventoryCategories();
  const {
    createItem,
    error: itemsError,
    isLoading: isLoadingItems,
    items,
    removeItem,
    updateItem,
  } = useInventoryItems();
  const { isWriteBlocked } = useApiConnection();
  const [filters, setFilters] = useState<InventoryFilters>(
    defaultInventoryFilters,
  );
  const [isFoodModalOpen, setFoodModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [foodToDelete, setFoodToDelete] = useState<FoodItem | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        if (a.isSystem !== b.isSystem) {
          return a.isSystem ? -1 : 1;
        }

        return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pt-BR");
      }),
    [categories],
  );

  const visibleFoods = useMemo(
    () => applyInventoryFilters(items, sortedCategories, filters),
    [filters, items, sortedCategories],
  );

  const usedCategoryIds = useMemo(
    () =>
      new Set(
        items
          .map((food) => food.categoryId)
          .filter((categoryId): categoryId is string => Boolean(categoryId)),
      ),
    [items],
  );

  const hasAdvancedFilters = isAdvancedFilterActive(filters);
  const hasAnyFilter =
    hasAdvancedFilters ||
    filters.storageLocation !== defaultInventoryFilters.storageLocation;
  const shouldShowInitialLoading =
    (isLoadingItems || isLoadingCategories) && !items.length && !categories.length;
  const isFormMutationError =
    Boolean(mutationError) && (isFoodModalOpen || isCategoryModalOpen);
  const shouldShowInventoryNotification =
    Boolean(itemsError || categoriesError) ||
    (Boolean(mutationError) && !isFormMutationError);

  function openCreateFoodModal() {
    if (isWriteBlocked) {
      return;
    }

    setEditingFood(null);
    setMutationError(null);
    setFoodModalOpen(true);
  }

  function openEditFoodModal(food: FoodItem) {
    if (isWriteBlocked) {
      return;
    }

    setEditingFood(food);
    setMutationError(null);
    setFoodModalOpen(true);
  }

  function closeFoodModal() {
    setEditingFood(null);
    setMutationError(null);
    setFoodModalOpen(false);
  }

  function getMutationMessage(error: unknown) {
    if (error instanceof ConflictError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Não foi possível salvar os dados agora. Tente novamente.";
  }

  async function saveFood(values: FoodFormSubmitValues) {
    setSubmitting(true);
    setMutationError(null);

    try {
      if (editingFood) {
        await updateItem(editingFood, values);
      } else {
        await createItem(values);
      }

      closeFoodModal();
    } catch (error) {
      setMutationError(getMutationMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteFood() {
    if (!foodToDelete) {
      return;
    }

    setSubmitting(true);
    setMutationError(null);

    try {
      await removeItem(foodToDelete.id);
      setFoodToDelete(null);
    } catch (error) {
      setMutationError(getMutationMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function createCustomCategory(
    category: Omit<FoodCategory, "id" | "isSystem" | "sortOrder">,
  ) {
    setSubmitting(true);
    setMutationError(null);

    try {
      await createCategory({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
    } catch (error) {
      setMutationError(getMutationMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function updateCustomCategory(category: FoodCategory) {
    setSubmitting(true);
    setMutationError(null);

    try {
      await updateCategory(category);
    } catch (error) {
      setMutationError(getMutationMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCustomCategory(category: FoodCategory) {
    setSubmitting(true);
    setMutationError(null);

    try {
      await removeCategory(category);
    } catch (error) {
      setMutationError(getMutationMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (shouldShowInitialLoading) {
    return <InventoryPageSkeleton />;
  }

  return (
    <PageShell
      eyebrow="Organização"
      title="Estoque"
      description="Filtre alimentos por local, categoria e validade para priorizar o consumo e reduzir desperdícios."
    >
      {shouldShowInventoryNotification ? (
        <NotificationViewport
          autoDismissMs={6500}
          className="max-w-2xl"
          description={
            mutationError
              ? undefined
              : "Algumas informacoes podem estar desatualizadas no momento."
          }
          isOpen
          onDismiss={mutationError ? () => setMutationError(null) : undefined}
          title={
            mutationError ??
            "Nao foi possivel atualizar todos os dados do estoque agora."
          }
          variant="error"
        />
      ) : null}

      <StorageQuickFilters
        value={filters.storageLocation}
        onChange={(storageLocation) =>
          setFilters((currentFilters) => ({
            ...currentFilters,
            storageLocation,
          }))
        }
      />

      <InventoryToolbar
        disabled={isWriteBlocked}
        hasAdvancedFilters={hasAdvancedFilters}
        onOpenCategoryModal={() => {
          setMutationError(null);
          setCategoryModalOpen(true);
        }}
        onOpenFilterModal={() => setFilterModalOpen(true)}
        onOpenFoodModal={openCreateFoodModal}
      />

      <section className="grid gap-3">
        {visibleFoods.length ? (
          visibleFoods.map((food, index) => (
            <FoodCard
              category={getCategoryById(sortedCategories, food.categoryId)}
              disabled={isWriteBlocked}
              eagerImage={index < 3}
              food={food}
              key={food.id}
              onDelete={setFoodToDelete}
              onEdit={openEditFoodModal}
            />
          ))
        ) : (
          <InventoryEmptyState hasFilters={hasAnyFilter} />
        )}
      </section>

      {isFilterModalOpen ? (
        <AdvancedFiltersModal
          categories={sortedCategories}
          filters={filters}
          isOpen={isFilterModalOpen}
          onApply={setFilters}
          onClose={() => setFilterModalOpen(false)}
        />
      ) : null}

      {isCategoryModalOpen ? (
        <CategoryManagerModal
          categories={sortedCategories}
          isOpen={isCategoryModalOpen}
          isSubmitting={isSubmitting}
          isWriteBlocked={isWriteBlocked}
          submitError={mutationError}
          usedCategoryIds={usedCategoryIds}
          onClose={() => {
            setMutationError(null);
            setCategoryModalOpen(false);
          }}
          onCreate={createCustomCategory}
          onDelete={deleteCustomCategory}
          onUpdate={updateCustomCategory}
        />
      ) : null}

      {isFoodModalOpen ? (
        <FoodFormModal
          categories={sortedCategories}
          editingFood={editingFood}
          isOpen={isFoodModalOpen}
          isSubmitting={isSubmitting}
          isWriteBlocked={isWriteBlocked}
          submitError={mutationError}
          onClose={closeFoodModal}
          onSubmit={saveFood}
        />
      ) : null}

      <Modal
        isOpen={Boolean(foodToDelete)}
        title="Excluir alimento"
        onClose={() => setFoodToDelete(null)}
      >
        <p className="text-sm leading-6 text-(--muted-foreground)">
          Tem certeza que deseja excluir {foodToDelete?.name}? Esta ação não
          poderá ser desfeita.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setFoodToDelete(null)}>
            Cancelar
          </Button>
          <Button
            disabled={isSubmitting || isWriteBlocked}
            variant="danger"
            onClick={deleteFood}
          >
            {isSubmitting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </Modal>
    </PageShell>
  );
}
