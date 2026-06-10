"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { CategoryDisplayItem } from "@/components/inventory/CategoryDisplayItem";
import { Notification } from "@/components/ui/Notification";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { validateInventoryPhotoFile } from "@/features/inventory/api/photos-api";
import { quantityUnitLabels, storageLocationLabels } from "@/lib/inventory";
import {
  QuantityUnit,
  StorageLocation,
  type FoodCategory,
  type FoodFormSubmitValues,
  type FoodItem,
  type FoodPhoto,
} from "@/types/inventory";

type FoodFormValues = {
  name: string;
  brand: string;
  storageLocation: StorageLocation;
  categoryId: string;
  quantity: string;
  quantityUnit: QuantityUnit;
  manufacturedAt: string;
  expiresAt: string;
  openedAt: string;
  notes: string;
  photos: FoodPhoto[];
  photoFile?: File;
  removedPhotoIds: string[];
};

type FoodFormModalProps = {
  categories: FoodCategory[];
  editingFood: FoodItem | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  isWriteBlocked?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (values: FoodFormSubmitValues) => Promise<void>;
};

const fieldClassName =
  "min-h-11 rounded-3xl bg-background px-4 text-sm text-foreground outline-none";

function createEmptyForm(): FoodFormValues {
  return {
    name: "",
    brand: "",
    storageLocation: StorageLocation.FRIDGE,
    categoryId: "",
    quantity: "1",
    quantityUnit: QuantityUnit.UNIT,
    manufacturedAt: "",
    expiresAt: "",
    openedAt: "",
    notes: "",
    photos: [],
    removedPhotoIds: [],
  };
}

function mapFoodToForm(food: FoodItem): FoodFormValues {
  return {
    name: food.name,
    brand: food.brand ?? "",
    storageLocation: food.storageLocation,
    categoryId: food.categoryId ?? "",
    quantity: String(food.quantity).replace(".", ","),
    quantityUnit: food.quantityUnit,
    manufacturedAt: food.manufacturedAt ?? "",
    expiresAt: food.expiresAt ?? "",
    openedAt: food.openedAt ?? "",
    notes: food.notes ?? "",
    photos: food.photos,
    removedPhotoIds: [],
  };
}

function parsePositiveDecimal(value: string) {
  const normalizedValue = value.replace(",", ".");
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

export function FoodFormModal({
  categories,
  editingFood,
  isOpen,
  isSubmitting = false,
  isWriteBlocked = false,
  submitError,
  onClose,
  onSubmit,
}: FoodFormModalProps) {
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const [form, setForm] = useState<FoodFormValues>(() =>
    editingFood ? mapFoodToForm(editingFood) : createEmptyForm(),
  );
  const [error, setError] = useState<string | null>(null);
  const disabledReason = isWriteBlocked
    ? "Disponivel novamente em instantes."
    : undefined;

  useEffect(() => {
    return () => {
      for (const photo of form.photos) {
        if (photo.isLocalPreview) {
          URL.revokeObjectURL(photo.url);
        }
      }
    };
  }, [form.photos]);

  function updateField(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileError = validateInventoryPhotoFile(file);

    if (fileError) {
      setError(fileError);
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setForm((currentForm) => ({
      ...currentForm,
      photoFile: file,
      photos: [
        {
          id: `local-${crypto.randomUUID()}`,
          url: previewUrl,
          alt: file.name,
          isLocalPreview: true,
        },
      ],
    }));
    event.target.value = "";
  }

  function removeImage() {
    setForm((currentForm) => ({
      ...currentForm,
      photoFile: undefined,
      photos: [],
      removedPhotoIds: [
        ...currentForm.removedPhotoIds,
        ...currentForm.photos
          .filter((photo) => !photo.isLocalPreview)
          .map((photo) => photo.id),
      ],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = parsePositiveDecimal(form.quantity);

    if (!form.name.trim()) {
      setError("Informe o nome do alimento.");
      return;
    }

    if (!quantity) {
      setError("Informe uma quantidade positiva.");
      return;
    }

    setError(null);
    await onSubmit({
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      storageLocation: form.storageLocation,
      categoryId: form.categoryId || undefined,
      quantity,
      quantityUnit: form.quantityUnit,
      manufacturedAt: form.manufacturedAt || undefined,
      expiresAt: form.expiresAt || undefined,
      openedAt: form.openedAt || undefined,
      notes: form.notes.trim() || undefined,
      photoFile: form.photoFile,
      removedPhotoIds: form.removedPhotoIds,
    });
  }

  const preview = form.photos[0];
  const categoryOptions = [
    {
      value: "",
      label: "Sem categoria",
      description: "Opcional",
    },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
      description: category.isSystem ? "Padrão" : "Personalizada",
    })),
  ];

  function renderCategory(categoryId: string) {
    const category = categoriesById.get(categoryId);

    if (!category) {
      return <span className="block truncate">Sem categoria</span>;
    }

    return <CategoryDisplayItem category={category} />;
  }

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      title={editingFood ? "Editar alimento" : "Adicionar alimento"}
      onClose={onClose}
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <section className="grid gap-3">
          <p className="text-sm font-semibold text-foreground">Imagem</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-32 w-full overflow-hidden rounded-3xl bg-background sm:w-40">
              {preview ? (
                <Image
                  unoptimized
                  alt={preview.alt ?? "Prévia do alimento"}
                  className="object-cover"
                  fill
                  sizes="160px"
                  src={preview.url}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-(--accent)">
                  <ImagePlus className="h-8 w-8" strokeWidth={1.9} />
                </div>
              )}
            </div>
            <div className="grid flex-1 gap-2">
              <label
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-3xl bg-(--surface-strong) px-4 text-sm font-semibold text-foreground transition-colors hover:bg-(--accent-soft) has-disabled:cursor-not-allowed has-disabled:opacity-60"
                title={disabledReason}
              >
                <Camera className="h-4 w-4" strokeWidth={1.9} />
                Selecionar ou capturar imagem
                <input
                  accept="image/jpeg,image/webp,image/*"
                  capture="environment"
                  className="sr-only"
                  disabled={isWriteBlocked}
                  type="file"
                  onChange={handleImageChange}
                />
              </label>
              {preview ? (
                <Button
                  icon={<Trash2 className="h-4 w-4" strokeWidth={1.9} />}
                  disabled={isWriteBlocked}
                  title={disabledReason}
                  variant="ghost"
                  onClick={removeImage}
                >
                  Remover imagem
                </Button>
              ) : null}
              <p className="text-xs leading-5 text-(--muted-foreground)">
                Use uma imagem nitida do alimento. Tamanho maximo:
                2 MB.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Nome
            <input
              className={fieldClassName}
              name="name"
              required
              type="text"
              value={form.name}
              onChange={updateField}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Marca
            <input
              className={fieldClassName}
              name="brand"
              type="text"
              value={form.brand}
              onChange={updateField}
            />
          </label>

          <SelectDropdown
            label="Categoria"
            options={categoryOptions}
            value={form.categoryId}
            onChange={(categoryId) =>
              setForm((currentForm) => ({ ...currentForm, categoryId }))
            }
            renderOption={(option) => renderCategory(option.value)}
            renderValue={(option) => renderCategory(option.value)}
          />

          <SelectDropdown<StorageLocation>
            label="Local"
            options={Object.values(StorageLocation).map((location) => ({
              value: location,
              label: storageLocationLabels[location],
            }))}
            value={form.storageLocation}
            onChange={(storageLocation) =>
              setForm((currentForm) => ({
                ...currentForm,
                storageLocation,
              }))
            }
          />

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Quantidade
            <input
              className={fieldClassName}
              inputMode="decimal"
              min="0.01"
              name="quantity"
              required
              step="0.01"
              type="number"
              value={form.quantity.replace(",", ".")}
              onChange={updateField}
            />
          </label>

          <SelectDropdown<QuantityUnit>
            label="Unidade de medida"
            options={Object.values(QuantityUnit).map((unit) => ({
              value: unit,
              label: quantityUnitLabels[unit],
            }))}
            value={form.quantityUnit}
            onChange={(quantityUnit) =>
              setForm((currentForm) => ({
                ...currentForm,
                quantityUnit,
              }))
            }
          />

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Fabricação
            <input
              className={fieldClassName}
              name="manufacturedAt"
              type="date"
              value={form.manufacturedAt}
              onChange={updateField}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Validade
            <input
              className={fieldClassName}
              name="expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={updateField}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Aberto em
            <input
              className={fieldClassName}
              name="openedAt"
              type="date"
              value={form.openedAt}
              onChange={updateField}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Observações
            <input
              className={fieldClassName}
              name="notes"
              type="text"
              value={form.notes}
              onChange={updateField}
            />
          </label>
        </div>

        {error || submitError ? (
          <Notification context="modal" title={error ?? submitError} />
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={isSubmitting || isWriteBlocked}
            title={disabledReason}
            type="submit"
          >
            {isSubmitting
              ? "Salvando..."
              : editingFood
                ? "Salvar"
                : "Adicionar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
