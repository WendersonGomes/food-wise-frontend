export type NavigationItem = {
  label: string;
  href: string;
  icon: "dashboard" | "stock" | "ai" | "settings";
};

export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Inventory", href: "/dashboard/inventory", icon: "stock" },
  { label: "Food AI", href: "/dashboard/ai-food", icon: "ai" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
];
