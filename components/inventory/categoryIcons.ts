import {
  Apple,
  Beef,
  Carrot,
  Croissant,
  CupSoda,
  Milk,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIconName } from "@/types/inventory";

export const categoryIcons: Record<CategoryIconName, LucideIcon> = {
  apple: Apple,
  carrot: Carrot,
  beef: Beef,
  milk: Milk,
  "cup-soda": CupSoda,
  croissant: Croissant,
  package: Package,
};
