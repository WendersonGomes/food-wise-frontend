"use client";

import { Archive, Snowflake, Thermometer, Warehouse } from "lucide-react";
import { QuickActionNav } from "@/components/QuickActionNav";
import { storageLocationLabels } from "@/lib/inventory";
import { StorageLocation } from "@/types/inventory";

type StorageQuickFiltersProps = {
  value: StorageLocation | "ALL";
  onChange: (value: StorageLocation | "ALL") => void;
};

const storageFilters = [
  { type: "button" as const, label: "Todos", value: "ALL", icon: Archive },
  {
    type: "button" as const,
    label: storageLocationLabels[StorageLocation.FRIDGE],
    value: StorageLocation.FRIDGE,
    icon: Thermometer,
  },
  {
    type: "button" as const,
    label: storageLocationLabels[StorageLocation.FREEZER],
    value: StorageLocation.FREEZER,
    icon: Snowflake,
  },
  {
    type: "button" as const,
    label: storageLocationLabels[StorageLocation.PANTRY],
    value: StorageLocation.PANTRY,
    icon: Warehouse,
  },
];

export function StorageQuickFilters({
  value,
  onChange,
}: StorageQuickFiltersProps) {
  return (
    <QuickActionNav
      activeValue={value}
      items={storageFilters}
      onSelect={(nextValue) => onChange(nextValue as StorageLocation | "ALL")}
    />
  );
}
