"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabaseClient";
import classNames from "classnames";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/equipamentos", label: "Equipamentos" },
  { href: "/fornecedores", label: "Fornecedores" },
  { href: "/tipos-servico", label: "Tipos de Serviço" },
  { href: "/horimetros", label: "Horímetro" },
  { href: "/servicos", label: "Serviços" },
  { href: "/abastecimentos", label: "Abastecimentos" },
  { href: "/relatorios", label: "Relatórios" }
];

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">LOCPEL</h1>
          <nav className="flex flex-wrap gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  "rounded-md px-3 py-1.5",
                  pathname === link.href
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="bg-slate-200 text-slate-700">
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
