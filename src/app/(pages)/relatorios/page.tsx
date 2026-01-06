"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import SectionCard from "@/components/SectionCard";
import { fetchWithAuth } from "@/lib/apiClient";

const downloadCsv = (filename: string, rows: Record<string, any>[]) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")]
    .concat(
      rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      )
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function RelatoriosPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (resource: string, label: string) => {
    setLoading(resource);
    const response = await fetchWithAuth(`/api/${resource}`);
    const data = await response.json();
    downloadCsv(`${label}.csv`, data);
    setLoading(null);
  };

  return (
    <PageShell>
      <SectionCard title="Relatórios (CSV)">
        <div className="grid gap-4 md:grid-cols-3">
          <button
            className="bg-slate-900 text-white"
            onClick={() => handleExport("horimetros", "horimetros")}
            disabled={loading !== null}
          >
            {loading === "horimetros" ? "Exportando..." : "Horímetro por período"}
          </button>
          <button
            className="bg-slate-900 text-white"
            onClick={() => handleExport("servicos", "servicos")}
            disabled={loading !== null}
          >
            {loading === "servicos" ? "Exportando..." : "Serviços por período"}
          </button>
          <button
            className="bg-slate-900 text-white"
            onClick={() => handleExport("abastecimentos", "abastecimentos")}
            disabled={loading !== null}
          >
            {loading === "abastecimentos" ? "Exportando..." : "Abastecimentos por período"}
          </button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
