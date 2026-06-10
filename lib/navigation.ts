export type NavigationItem = {
  label: string;
  href: string;
  icon: "dashboard" | "stock" | "ai" | "settings";
};

export const navigationItems: NavigationItem[] = [
  { label: "Painel", href: "/dashboard", icon: "dashboard" },
  { label: "Estoque", href: "/dashboard/inventory", icon: "stock" },
  { label: "IA de alimentos", href: "/dashboard/ai-food", icon: "ai" },
  { label: "Configurações", href: "/dashboard/settings", icon: "settings" },
];
