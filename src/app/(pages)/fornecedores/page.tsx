"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PageShell from "@/components/PageShell";
import SectionCard from "@/components/SectionCard";
import DataTable from "@/components/DataTable";
import { fetchWithAuth } from "@/lib/apiClient";

const schema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(["COMBUSTIVEL", "MANUTENCAO", "INSUMO"]),
  ativo: z.boolean().default(true)
});

type Fornecedor = {
  id: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  created_at: string;
};

export default function FornecedoresPage() {
  const [items, setItems] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: "COMBUSTIVEL", ativo: true }
  });

  const loadData = async () => {
    setLoading(true);
    const response = await fetchWithAuth("/api/fornecedores");
    const data = await response.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await fetchWithAuth("/api/fornecedores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    reset({ nome: "", tipo: "COMBUSTIVEL", ativo: true });
    loadData();
  };

  return (
    <PageShell>
      <div className="grid gap-6">
        <SectionCard title="Novo Fornecedor">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1 md:col-span-2">
              <label>Nome</label>
              <input {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>
            <div className="space-y-1">
              <label>Tipo</label>
              <select {...register("tipo")}>
                <option value="COMBUSTIVEL">Combustível</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="INSUMO">Insumo</option>
              </select>
              {errors.tipo && <p className="text-sm text-red-600">{errors.tipo.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("ativo")} className="w-auto" />
              Ativo
            </label>
            <div className="md:col-span-3">
              <button type="submit" className="bg-slate-900 text-white" disabled={isSubmitting}>
                Salvar
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Fornecedores cadastrados">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <DataTable
              data={items}
              columns={[
                { accessorKey: "nome", header: "Nome" },
                { accessorKey: "tipo", header: "Tipo" },
                {
                  accessorKey: "ativo",
                  header: "Ativo",
                  cell: (info) => (info.getValue() ? "Sim" : "Não")
                }
              ]}
            />
          )}
        </SectionCard>
      </div>
    </PageShell>
  );
}
