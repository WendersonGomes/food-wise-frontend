export enum StorageLocation {
  FRIDGE = "FRIDGE",
  FREEZER = "FREEZER",
  PANTRY = "PANTRY",
}

export enum QuantityUnit {
  UNIT = "UNIT",
  GRAM = "GRAM",
  KILOGRAM = "KILOGRAM",
  MILLILITER = "MILLILITER",
  LITER = "LITER",
  PACKAGE = "PACKAGE",
}

export type CategoryIconName =
  | "apple"
  | "carrot"
  | "beef"
  | "milk"
  | "cup-soda"
  | "croissant"
  | "package";

export type SystemCategoryCode =
  | "FRUIT"
  | "VEGETABLE"
  | "MEAT"
  | "DAIRY"
  | "BEVERAGE"
  | "BAKERY"
  | "OTHER";

export type FoodCategory = {
  id: string;
  name: string;
  normalizedName: string;
  icon: CategoryIconName;
  color?: string;
  sortOrder: number;
  isSystem: boolean;
  systemCode?: SystemCategoryCode;
};

export type FoodPhoto = {
  id: string;
  itemId?: string;
  url: string;
  alt?: string;
  isLocalPreview?: boolean;
};

export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  storageLocation: StorageLocation;
  categoryId?: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  manufacturedAt?: string;
  expiresAt?: string;
  openedAt?: string;
  notes?: string;
  photos: FoodPhoto[];
  primaryPhotoId?: string;
  createdAt: string;
  updatedAt?: string;
  version?: number;
};

export type FoodFormSubmitValues = {
  name: string;
  brand?: string;
  storageLocation: StorageLocation;
  categoryId?: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  manufacturedAt?: string;
  expiresAt?: string;
  openedAt?: string;
  notes?: string;
  photoFile?: File;
  removedPhotoIds?: string[];
};

export type InventorySummaryItem = Pick<
  FoodItem,
  | "id"
  | "name"
  | "brand"
  | "categoryId"
  | "storageLocation"
  | "quantity"
  | "quantityUnit"
  | "expiresAt"
  | "primaryPhotoId"
  | "photos"
>;

export type InventoryDashboardSummary = {
  totalItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  fridgeItems: number;
  freezerItems: number;
  pantryItems: number;
  recentItems: InventorySummaryItem[];
  expiringSoon: InventorySummaryItem[];
};

export type ExpirationFilter =
  | "ALL"
  | "EXPIRED"
  | "TODAY"
  | "SOON"
  | "NEXT_3_DAYS"
  | "NEXT_7_DAYS"
  | "NO_DATE";

export type CategoryFilter = "ALL" | "SYSTEM" | "CUSTOM" | string;

export type SortOption =
  | "NAME_ASC"
  | "NAME_DESC"
  | "EXPIRATION_ASC"
  | "EXPIRATION_DESC"
  | "RECENTLY_ADDED"
  | "OLDEST_ADDED"
  | "QUANTITY_DESC"
  | "QUANTITY_ASC";

export type InventoryFilters = {
  storageLocation: StorageLocation | "ALL";
  category: CategoryFilter;
  expiration: ExpirationFilter;
  sort: SortOption;
};

export type ExpirationStatus =
  | "EXPIRED"
  | "EXPIRING_SOON"
  | "VALID"
  | "NO_DATE";
