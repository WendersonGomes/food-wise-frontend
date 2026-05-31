"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Apple, Beef, Edit3, Milk, Package, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { PageShell } from "@/components/PageShell";

type StoragePlace = "Fridge" | "Freezer" | "Pantry";

type FoodItem = {
  id: number;
  name: string;
  place: StoragePlace;
  quantity: string;
  expiresAt: string;
};

const initialFoods: FoodItem[] = [
  { id: 1, name: "Milk", place: "Fridge", quantity: "1 bottle", expiresAt: "2026-05-26" },
  { id: 2, name: "Chicken", place: "Freezer", quantity: "600 g", expiresAt: "2026-06-12" },
  { id: 3, name: "Rice", place: "Pantry", quantity: "2 kg", expiresAt: "2026-08-23" },
  { id: 4, name: "Tomato", place: "Fridge", quantity: "5 units", expiresAt: "2026-05-28" },
];

const foodIcons = [Milk, Beef, Package, Apple];
const emptyForm: Omit<FoodItem, "id"> = {
  name: "",
  place: "Fridge",
  quantity: "",
  expiresAt: "",
};

function formatExpiration(date: string) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function InventoryPage() {
  const [foods, setFoods] = useState(initialFoods);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const isModalOpen = isCreateOpen || Boolean(editingItem);

  const modalTitle = editingItem ? "Edit item" : "Add item";

  const nextId = useMemo(
    () => Math.max(...foods.map((food) => food.id), 0) + 1,
    [foods],
  );

  function openCreateModal() {
    setCreateOpen(true);
    setEditingItem(null);
    setForm(emptyForm);
  }

  function openEditModal(food: FoodItem) {
    setCreateOpen(false);
    setEditingItem(food);
    setForm({
      name: food.name,
      place: food.place,
      quantity: food.quantity,
      expiresAt: food.expiresAt,
    });
  }

  function closeModal() {
    setCreateOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingItem) {
      setFoods((currentFoods) =>
        currentFoods.map((food) =>
          food.id === editingItem.id ? { ...food, ...form } : food,
        ),
      );
    } else {
      setFoods((currentFoods) => [...currentFoods, { id: nextId, ...form }]);
    }

    closeModal();
  }

  return (
    <PageShell
      eyebrow="Organization"
      title="Inventory"
      description="Items grouped by fridge, freezer, and pantry with focus on the next expiration date."
    >
      <div className="flex justify-end">
        <Button icon={<Plus className="h-5 w-5" strokeWidth={1.9} />} onClick={openCreateModal}>
          Add item
        </Button>
      </div>

      <section className="grid gap-3">
        {foods.map((food, index) => {
          const Icon = foodIcons[index % foodIcons.length];

          return (
            <Card
              key={food.id}
              className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1.2fr_0.8fr_0.8fr_auto]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-3xl bg-(--accent-soft) text-(--accent)">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div>
                  <p className="font-semibold text-foreground">
                    {food.name}
                  </p>
                  <p className="text-sm text-(--muted-foreground)">
                    {food.quantity}
                  </p>
                </div>
              </div>
              <span className="text-sm text(--muted-foreground)">
                {food.place}
              </span>
              <span className="text-sm text-(--accent)">
                {formatExpiration(food.expiresAt)}
              </span>
              <Button
                aria-label={`Edit ${food.name}`}
                icon={<Edit3 className="h-4 w-4" strokeWidth={1.9} />}
                size="sm"
                variant="secondary"
                onClick={() => openEditModal(food)}
              >
                Edit
              </Button>
            </Card>
          );
        })}
      </section>

      <Modal isOpen={isModalOpen} title={modalTitle} onClose={closeModal}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text(--foreground]">
            Name
            <input
              className="min-h-11 rounded-3xl bg-background px-4 text-sm text-foreground outline-none"
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  name: event.target.value,
                }))
              }
              required
              type="text"
              value={form.name}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Storage
            <select
              className="min-h-11 rounded-3xl bg--background px-4 text-sm text-foreground outline-none"
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  place: event.target.value as StoragePlace,
                }))
              }
              value={form.place}
            >
              <option>Fridge</option>
              <option>Freezer</option>
              <option>Pantry</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Quantity
            <input
              className="min-h-11 rounded-3xl bg--background px-4 text-sm text-foreground outline-none"
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  quantity: event.target.value,
                }))
              }
              required
              type="text"
              value={form.quantity}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Expiration date
            <input
              className="min-h-11 rounded-3xl bg--background px-4 text-sm text-foreground outline-none"
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  expiresAt: event.target.value,
                }))
              }
              required
              type="date"
              value={form.expiresAt}
            />
          </label>

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">{editingItem ? "Save changes" : "Add item"}</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
