"use client";

import { useState, type FormEvent } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { CategoryDisplayItem } from "@/components/inventory/CategoryDisplayItem";
import { categoryIcons } from "@/components/inventory/categoryIcons";
import { Notification } from "@/components/ui/Notification";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { categoryIconLabels, normalizeName } from "@/lib/inventory";
import type { CategoryIconName, FoodCategory } from "@/types/inventory";

type CategoryManagerModalProps = {
  categories: FoodCategory[];
  isSubmitting?: boolean;
  isWriteBlocked?: boolean;
  isOpen: boolean;
  usedCategoryIds: Set<string>;
  submitError?: string | null;
  onClose: () => void;
  onCreate: (
    category: Omit<FoodCategory, "id" | "isSystem" | "sortOrder">,
  ) => Promise<void>;
  onDelete: (category: FoodCategory) => Promise<void>;
  onUpdate: (category: FoodCategory) => Promise<void>;
};

const iconOptions = Object.keys(categoryIcons) as CategoryIconName[];
const fieldClassName =
  "min-h-11 rounded-3xl bg-background px-4 text-sm text-foreground outline-none";

export function CategoryManagerModal({
  categories,
  isSubmitting = false,
  isWriteBlocked = false,
  isOpen,
  usedCategoryIds,
  submitError,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
}: CategoryManagerModalProps) {
  const [editingCategory, setEditingCategory] = useState<FoodCategory | null>(
    null,
  );
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<CategoryIconName>("package");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const disabledReason = isWriteBlocked
    ? "Disponivel novamente em instantes."
    : undefined;

  function startEditing(category: FoodCategory) {
    if (category.isSystem) {
      return;
    }

    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon);
    setError(null);
    setSuccessMessage(null);
  }

  function resetForm() {
    setEditingCategory(null);
    setName("");
    setIcon("package");
    setError(null);
    setSuccessMessage(null);
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = normalizeName(name);
    const trimmedName = name.trim();

    setSuccessMessage(null);

    if (!normalizedName) {
      setError("Informe o nome da categoria.");
      return;
    }

    const duplicatedCategory = categories.find(
      (category) =>
        category.normalizedName === normalizedName &&
        category.id !== editingCategory?.id,
    );

    if (duplicatedCategory) {
      setError("Já existe uma categoria com esse nome.");
      return;
    }

    if (editingCategory) {
      await onUpdate({
        ...editingCategory,
        name: trimmedName,
        normalizedName,
        icon,
      });
      resetForm();
    } else {
      await onCreate({
        name: trimmedName,
        normalizedName,
        icon,
      });
      setEditingCategory(null);
      setName("");
      setIcon("package");
      setError(null);
      setSuccessMessage(`Categoria "${trimmedName}" criada com sucesso.`);
    }
  }

  async function deleteCategory(category: FoodCategory) {
    if (category.isSystem) {
      return;
    }

    if (
      usedCategoryIds.has(category.id) &&
      !window.confirm(
        "Esta categoria está sendo usada por alimentos. Deseja excluir mesmo assim?",
      )
    ) {
      return;
    }

    await onDelete(category);
    if (editingCategory?.id === category.id) {
      resetForm();
    }
  }

  return (
    <Modal isOpen={isOpen} size="lg" title="Categorias" onClose={onClose}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <form className="grid content-start gap-4" onSubmit={submitCategory}>
          <h3 className="text-sm font-semibold text-foreground">
            {editingCategory ? "Editar categoria" : "Nova categoria"}
          </h3>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Nome
            <input
              className={fieldClassName}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <SelectDropdown<CategoryIconName>
            label="Ícone"
            options={iconOptions.map((iconName) => ({
              value: iconName,
              label: categoryIconLabels[iconName],
            }))}
            value={icon}
            onChange={setIcon}
          />

          {error || submitError ? (
            <Notification context="modal" title={error ?? submitError} />
          ) : successMessage ? (
            <Notification
              context="modal"
              title={successMessage}
              variant="success"
            />
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {editingCategory ? (
              <Button variant="secondary" onClick={resetForm}>
                Cancelar edição
              </Button>
            ) : null}
            <Button
              disabled={isSubmitting || isWriteBlocked}
              icon={<Plus className="h-4 w-4" strokeWidth={1.9} />}
              title={disabledReason}
              type="submit"
            >
              {isSubmitting
                ? "Salvando..."
                : editingCategory
                  ? "Salvar categoria"
                  : "Criar categoria"}
            </Button>
          </div>
        </form>

        <section className="grid max-h-96 gap-2 overflow-y-auto pr-1">
          {categories.map((category) => {
            return (
              <CategoryDisplayItem
                actions={
                  !category.isSystem ? (
                    <>
                      <Button
                        aria-label={`Editar ${category.name}`}
                        icon={<Edit3 className="h-4 w-4" strokeWidth={1.9} />}
                        size="icon"
                        title={disabledReason}
                        variant="ghost"
                        disabled={isSubmitting || isWriteBlocked}
                        onClick={() => startEditing(category)}
                      />
                      <Button
                        aria-label={`Excluir ${category.name}`}
                        icon={<Trash2 className="h-4 w-4" strokeWidth={1.9} />}
                        size="icon"
                        title={disabledReason}
                        variant="ghost"
                        disabled={isSubmitting || isWriteBlocked}
                        onClick={() => void deleteCategory(category)}
                      />
                    </>
                  ) : null
                }
                category={category}
                className="rounded-3xl bg-background p-3"
                key={category.id}
                showNormalizedName
              />
            );
          })}
        </section>
      </div>
    </Modal>
  );
}
