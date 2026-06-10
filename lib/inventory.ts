import {
  type CategoryFilter,
  type ExpirationFilter,
  QuantityUnit,
  StorageLocation,
  type CategoryIconName,
  type ExpirationStatus,
  type FoodCategory,
  type FoodItem,
  type InventoryFilters,
} from "@/types/inventory";
import { buildGatewayUrl } from "@/lib/api/gateway-client";

export const quantityUnitLabels: Record<QuantityUnit, string> = {
  [QuantityUnit.UNIT]: "Unidade",
  [QuantityUnit.GRAM]: "Grama",
  [QuantityUnit.KILOGRAM]: "Quilograma",
  [QuantityUnit.MILLILITER]: "Mililitro",
  [QuantityUnit.LITER]: "Litro",
  [QuantityUnit.PACKAGE]: "Pacote",
};

export const quantityUnitShortLabels: Record<QuantityUnit, string> = {
  [QuantityUnit.UNIT]: "unidade",
  [QuantityUnit.GRAM]: "g",
  [QuantityUnit.KILOGRAM]: "kg",
  [QuantityUnit.MILLILITER]: "ml",
  [QuantityUnit.LITER]: "L",
  [QuantityUnit.PACKAGE]: "pacote",
};

export const storageLocationLabels: Record<StorageLocation, string> = {
  [StorageLocation.FRIDGE]: "Geladeira",
  [StorageLocation.FREEZER]: "Freezer",
  [StorageLocation.PANTRY]: "Despensa",
};

export const systemCategories: FoodCategory[] = [
  {
    id: "system-fruit",
    systemCode: "FRUIT",
    name: "Frutas",
    normalizedName: "frutas",
    icon: "apple",
    sortOrder: 10,
    isSystem: true,
  },
  {
    id: "system-vegetable",
    systemCode: "VEGETABLE",
    name: "Vegetais",
    normalizedName: "vegetais",
    icon: "carrot",
    sortOrder: 20,
    isSystem: true,
  },
  {
    id: "system-meat",
    systemCode: "MEAT",
    name: "Carnes",
    normalizedName: "carnes",
    icon: "beef",
    sortOrder: 30,
    isSystem: true,
  },
  {
    id: "system-dairy",
    systemCode: "DAIRY",
    name: "Laticínios",
    normalizedName: "laticinios",
    icon: "milk",
    sortOrder: 40,
    isSystem: true,
  },
  {
    id: "system-beverage",
    systemCode: "BEVERAGE",
    name: "Bebidas",
    normalizedName: "bebidas",
    icon: "cup-soda",
    sortOrder: 50,
    isSystem: true,
  },
  {
    id: "system-bakery",
    systemCode: "BAKERY",
    name: "Padaria",
    normalizedName: "padaria",
    icon: "croissant",
    sortOrder: 60,
    isSystem: true,
  },
  {
    id: "system-other",
    systemCode: "OTHER",
    name: "Outros",
    normalizedName: "outros",
    icon: "package",
    sortOrder: 999,
    isSystem: true,
  },
];

export const categoryIconLabels: Record<CategoryIconName, string> = {
  apple: "Maçã",
  carrot: "Cenoura",
  beef: "Carne",
  milk: "Leite",
  "cup-soda": "Bebida",
  croissant: "Padaria",
  package: "Pacote",
};

const systemCategoryByCode = new Map(
  systemCategories
    .filter((category) => category.systemCode)
    .map((category) => [category.systemCode, category]),
);

export const defaultInventoryFilters: InventoryFilters = {
  storageLocation: "ALL",
  category: "ALL",
  expiration: "ALL",
  sort: "EXPIRATION_ASC",
};

export function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function formatQuantity(quantity: number, unit: QuantityUnit) {
  const formattedQuantity = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(quantity);

  if (unit === QuantityUnit.UNIT) {
    return quantity === 1
      ? `${formattedQuantity} unidade`
      : `${formattedQuantity} unidades`;
  }

  if (unit === QuantityUnit.PACKAGE) {
    return quantity === 1
      ? `${formattedQuantity} pacote`
      : `${formattedQuantity} pacotes`;
  }

  return `${formattedQuantity} ${quantityUnitShortLabels[unit]}`;
}

function parseInventoryDate(date?: string) {
  if (!date) {
    return null;
  }

  const normalizedDate = date.trim();

  if (!normalizedDate) {
    return null;
  }

  const parsedDate = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)
      ? `${normalizedDate}T00:00:00`
      : normalizedDate,
  );

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatExpirationDate(date?: string) {
  const expiration = parseInventoryDate(date);

  if (!expiration) {
    return "Sem validade";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(expiration);
}

export function getExpirationStatus(expiresAt?: string): ExpirationStatus {
  const expiration = parseInventoryDate(expiresAt);

  if (!expiration) {
    return "NO_DATE";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  expiration.setHours(0, 0, 0, 0);

  const diffInDays = Math.ceil(
    (expiration.getTime() - today.getTime()) / 86_400_000,
  );

  if (diffInDays < 0) {
    return "EXPIRED";
  }

  if (diffInDays <= 3) {
    return "EXPIRING_SOON";
  }

  return "VALID";
}

export const expirationStatusLabels: Record<ExpirationStatus, string> = {
  EXPIRED: "Vencido",
  EXPIRING_SOON: "Próximo do vencimento",
  VALID: "Dentro da validade",
  NO_DATE: "Sem data cadastrada",
};

export function getCategoryById(
  categories: FoodCategory[],
  categoryId?: string,
) {
  if (!categoryId) {
    return undefined;
  }

  return categories.find(
    (category) =>
      category.id === categoryId ||
      category.systemCode === categoryId ||
      systemCategoryByCode.get(category.systemCode)?.id === categoryId,
  );
}

export function mergeWithSystemCategories(categories: FoodCategory[]) {
  const categoriesByKey = new Map<string, FoodCategory>();

  for (const category of systemCategories) {
    categoriesByKey.set(category.systemCode ?? category.id, category);
  }

  for (const category of categories) {
    const key = category.systemCode ?? category.id;
    categoriesByKey.set(key, category);
  }

  return [...categoriesByKey.values()].sort((a, b) => {
    if (a.isSystem !== b.isSystem) {
      return a.isSystem ? -1 : 1;
    }

    return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "pt-BR");
  });
}

export function isAdvancedFilterActive(filters: InventoryFilters) {
  return (
    filters.category !== defaultInventoryFilters.category ||
    filters.expiration !== defaultInventoryFilters.expiration ||
    filters.sort !== defaultInventoryFilters.sort
  );
}

export function getFoodThumbnail(
  food: Pick<FoodItem, "photos" | "primaryPhotoId">,
) {
  if (food.photos[0]?.url) {
    return food.photos[0].url;
  }

  if (food.primaryPhotoId) {
    return buildGatewayUrl(
      `/api/inventory/photos/${food.primaryPhotoId}/content?variant=thumbnail`,
    );
  }

  return food.photos[0]?.url;
}

function getDaysUntilExpiration(expiresAt?: string) {
  const expiration = parseInventoryDate(expiresAt);

  if (!expiration) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  expiration.setHours(0, 0, 0, 0);

  return Math.ceil((expiration.getTime() - today.getTime()) / 86_400_000);
}

function matchesCategoryFilter(
  food: FoodItem,
  categories: FoodCategory[],
  categoryFilter: CategoryFilter,
) {
  if (categoryFilter === "ALL") {
    return true;
  }

  const category = getCategoryById(categories, food.categoryId);

  if (categoryFilter === "SYSTEM") {
    return Boolean(category?.isSystem);
  }

  if (categoryFilter === "CUSTOM") {
    return Boolean(category && !category.isSystem);
  }

  return food.categoryId === categoryFilter;
}

function matchesExpirationFilter(
  food: FoodItem,
  expirationFilter: ExpirationFilter,
) {
  if (expirationFilter === "ALL") {
    return true;
  }

  const days = getDaysUntilExpiration(food.expiresAt);

  if (expirationFilter === "NO_DATE") {
    return days === null;
  }

  if (days === null) {
    return false;
  }

  if (expirationFilter === "EXPIRED") {
    return days < 0;
  }

  if (expirationFilter === "TODAY") {
    return days === 0;
  }

  if (expirationFilter === "SOON") {
    return days >= 0 && days <= 3;
  }

  if (expirationFilter === "NEXT_3_DAYS") {
    return days >= 0 && days <= 3;
  }

  return days >= 0 && days <= 7;
}

function compareExpiration(a?: string, b?: string) {
  const dateA = parseInventoryDate(a);
  const dateB = parseInventoryDate(b);

  if (!dateA && !dateB) {
    return 0;
  }

  if (!dateA) {
    return 1;
  }

  if (!dateB) {
    return -1;
  }

  return dateA.getTime() - dateB.getTime();
}

export function applyInventoryFilters(
  foods: FoodItem[],
  categories: FoodCategory[],
  filters: InventoryFilters,
) {
  const filteredFoods = foods.filter((food) => {
    const matchesStorage =
      filters.storageLocation === "ALL" ||
      food.storageLocation === filters.storageLocation;

    return (
      matchesStorage &&
      matchesCategoryFilter(food, categories, filters.category) &&
      matchesExpirationFilter(food, filters.expiration)
    );
  });

  return [...filteredFoods].sort((a, b) => {
    if (filters.sort === "NAME_ASC") {
      return a.name.localeCompare(b.name, "pt-BR");
    }

    if (filters.sort === "NAME_DESC") {
      return b.name.localeCompare(a.name, "pt-BR");
    }

    if (filters.sort === "EXPIRATION_ASC") {
      return compareExpiration(a.expiresAt, b.expiresAt);
    }

    if (filters.sort === "EXPIRATION_DESC") {
      return compareExpiration(b.expiresAt, a.expiresAt);
    }

    if (filters.sort === "RECENTLY_ADDED") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (filters.sort === "OLDEST_ADDED") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    if (filters.sort === "QUANTITY_DESC") {
      return b.quantity - a.quantity;
    }

    return a.quantity - b.quantity;
  });
}
