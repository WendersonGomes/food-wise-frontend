import { PageShell } from "@/components/PageShell";

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Preferences"
      title="Settings"
      description="Settings page."
    >
      <section className="grid gap-4 md:grid-cols-2" />
    </PageShell>
  );
}
