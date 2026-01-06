import PageShell from "@/components/PageShell";
import SectionCard from "@/components/SectionCard";
import Link from "next/link";

const items = [
  { href: "/equipamentos", label: "Equipamentos" },
  { href: "/horimetros", label: "Horímetro" },
  { href: "/servicos", label: "Serviços" },
  { href: "/abastecimentos", label: "Abastecimentos" },
  { href: "/relatorios", label: "Relatórios" }
];

export default function DashboardPage() {
  return (
    <PageShell>
      <SectionCard title="Atalhos">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
            >
              <p className="font-medium">{item.label}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
