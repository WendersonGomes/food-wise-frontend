import { PageShell } from "@/components/PageShell";

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Preferências"
      title="Configurações"
      description="Ajustes da conta, preferências e experiência do FoodWise."
    >
      <section className="grid gap-4 md:grid-cols-2" />
    </PageShell>
  );
}
