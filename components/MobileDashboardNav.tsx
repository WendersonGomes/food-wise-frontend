"use client";

import { Boxes, Settings, Sparkles } from "lucide-react";
import { QuickActionNav } from "@/components/QuickActionNav";

const mobileItems = [
  { label: "Estoque", href: "/dashboard/inventory", icon: Boxes },
  { label: "IA de alimentos", href: "/dashboard/ai-food", icon: Sparkles },
  { label: "Configurações", href: "/dashboard/settings", icon: Settings },
];

export function MobileDashboardNav() {
  return <QuickActionNav className="md:hidden" items={mobileItems} />;
}
