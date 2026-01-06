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
  codigo: z.string().min(1),
  descricao: z.string().min(1),
  ativo: z.boolean().default(true)
});

type Equipamento = {
  id: string;
  codigo: string;
  descricao: string;
  ativo: boolean;
  created_at: string;
};

export default function EquipamentosPage() {
  const [items, setItems] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { ativo: true }
  });

  const loadData = async () => {
    setLoading(true);
    const response = await fetchWithAuth("/api/equipamentos");
    const data = await response.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await fetchWithAuth("/api/equipamentos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    reset({ codigo: "", descricao: "", ativo: true });
    loadData();
  };

  return (
    <PageShell>
      <div className="grid gap-6">
        <SectionCard title="Novo Equipamento">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label>Código</label>
              <input {...register("codigo")} />
              {errors.codigo && <p className="text-sm text-red-600">{errors.codigo.message}</p>}
            </div>
            <div className="space-y-1 md:col-span-2">
              <label>Descrição</label>
              <input {...register("descricao")} />
              {errors.descricao && <p className="text-sm text-red-600">{errors.descricao.message}</p>}
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

        <SectionCard title="Equipamentos cadastrados">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <DataTable
              data={items}
              columns={[
                { accessorKey: "codigo", header: "Código" },
                { accessorKey: "descricao", header: "Descrição" },
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
