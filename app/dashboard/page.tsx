import { Archive, Clock, MapPinned, Snowflake, Thermometer, Warehouse } from "lucide-react";
import { Card } from "@/components/Card";
import { MobileDashboardNav } from "@/components/MobileDashboardNav";
import { PageShell } from "@/components/PageShell";

const stats = [
  { label: "Registered items", value: "27", icon: Archive },
  { label: "Expiring soon", value: "6", icon: Clock },
  { label: "Active locations", value: "3", icon: MapPinned },
];

const locations = [
  { name: "Fridge", items: "8 items", status: "2 expiring soon", icon: Thermometer },
  { name: "Freezer", items: "5 items", status: "Stable inventory", icon: Snowflake },
  { name: "Pantry", items: "14 items", status: "4 to review", icon: Warehouse },
];

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Overview"
      title="Dashboard"
      description="Track your home inventory by expiration date, storage location, and consumption priority."
    >
      <MobileDashboardNav />

      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted-foreground)]">
                {stat.label}
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <stat.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[var(--foreground)]">
              {stat.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {locations.map((location) => (
          <Card
            key={location.name}
            className="p-4 sm:p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <location.icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {location.name}
              </h2>
            </div>
            <p className="mt-4 text-2xl font-bold text-[var(--accent)]">
              {location.items}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {location.status}
            </p>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}
