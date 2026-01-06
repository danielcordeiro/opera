"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PageShell from "@/components/PageShell";
import SectionCard from "@/components/SectionCard";
import DataTable from "@/components/DataTable";
import { fetchWithAuth } from "@/lib/apiClient";

const schema = z.object({
  equipamento_id: z.string().min(1),
  data_referencia: z.string().min(1),
  leitura: z.coerce.number().min(0),
  observacao: z.string().optional().nullable()
});

type Equipamento = {
  id: string;
  codigo: string;
  descricao: string;
};

type Horimetro = {
  id: string;
  equipamento_id: string;
  data_referencia: string;
  leitura: number;
  leitura_anterior?: number | null;
  horas_trabalhadas?: number | null;
  observacao?: string | null;
};

export default function HorimetrosPage() {
  const [items, setItems] = useState<Horimetro[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaLeitura, setUltimaLeitura] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  });

  const equipamentoId = watch("equipamento_id");

  const equipamentoMap = useMemo(() => {
    return new Map(equipamentos.map((item) => [item.id, item]));
  }, [equipamentos]);

  const loadData = async () => {
    setLoading(true);
    const response = await fetchWithAuth("/api/horimetros");
    const data = await response.json();
    setItems(data);
    setLoading(false);
  };

  const loadEquipamentos = async () => {
    const response = await fetchWithAuth("/api/equipamentos");
    const data = await response.json();
    setEquipamentos(data);
  };

  const loadUltimaLeitura = async (id?: string) => {
    if (!id) {
      setUltimaLeitura(null);
      return;
    }
    const response = await fetchWithAuth(`/api/horimetros?equipamentoId=${id}&latest=true`);
    const data = await response.json();
    setUltimaLeitura(data?.leitura ?? null);
  };

  useEffect(() => {
    loadData();
    loadEquipamentos();
  }, []);

  useEffect(() => {
    loadUltimaLeitura(equipamentoId);
  }, [equipamentoId]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await fetchWithAuth("/api/horimetros", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    reset({ equipamento_id: values.equipamento_id, data_referencia: "", leitura: 0, observacao: "" });
    loadData();
    loadUltimaLeitura(values.equipamento_id);
  };

  return (
    <PageShell>
      <div className="grid gap-6">
        <SectionCard title="Novo lançamento de horímetro">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1 md:col-span-2">
              <label>Equipamento</label>
              <select {...register("equipamento_id")}>
                <option value="">Selecione</option>
                {equipamentos.map((equip) => (
                  <option key={equip.id} value={equip.id}>
                    {equip.codigo} - {equip.descricao}
                  </option>
                ))}
              </select>
              {errors.equipamento_id && (
                <p className="text-sm text-red-600">{errors.equipamento_id.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label>Data referência</label>
              <input type="date" {...register("data_referencia")} />
              {errors.data_referencia && (
                <p className="text-sm text-red-600">{errors.data_referencia.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label>Leitura</label>
              <input type="number" step="0.1" {...register("leitura")} />
              {errors.leitura && <p className="text-sm text-red-600">{errors.leitura.message}</p>}
            </div>
            <div className="space-y-1 md:col-span-4">
              <label>Observação</label>
              <textarea {...register("observacao")} rows={2} />
            </div>
            <div className="md:col-span-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span>Última leitura: {ultimaLeitura ?? "-"}</span>
              <button type="submit" className="bg-slate-900 text-white" disabled={isSubmitting}>
                Salvar
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Histórico de horímetros">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <DataTable
              data={items}
              columns={[
                {
                  header: "Equipamento",
                  accessorKey: "equipamento_id",
                  cell: (info) => {
                    const equip = equipamentoMap.get(info.getValue() as string);
                    return equip ? `${equip.codigo} - ${equip.descricao}` : info.getValue();
                  }
                },
                { accessorKey: "data_referencia", header: "Data" },
                { accessorKey: "leitura", header: "Leitura" },
                {
                  accessorKey: "horas_trabalhadas",
                  header: "Horas",
                  cell: (info) => (info.getValue() ?? "-")
                },
                { accessorKey: "observacao", header: "Observação" }
              ]}
            />
          )}
        </SectionCard>
      </div>
    </PageShell>
  );
}
