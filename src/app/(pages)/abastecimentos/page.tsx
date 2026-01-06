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
  fornecedor_id: z.string().min(1),
  data_abastecimento: z.string().min(1),
  litros: z.coerce.number().min(0),
  valor_total: z.coerce.number().min(0)
});

type Option = {
  id: string;
  nome?: string;
  codigo?: string;
  descricao?: string;
};

type Abastecimento = {
  id: string;
  equipamento_id: string;
  fornecedor_id: string;
  data_abastecimento: string;
  litros: number;
  valor_total: number;
};

export default function AbastecimentosPage() {
  const [items, setItems] = useState<Abastecimento[]>([]);
  const [equipamentos, setEquipamentos] = useState<Option[]>([]);
  const [fornecedores, setFornecedores] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  });

  const maps = useMemo(() => {
    return {
      equipamentos: new Map(equipamentos.map((item) => [item.id, item])),
      fornecedores: new Map(fornecedores.map((item) => [item.id, item]))
    };
  }, [equipamentos, fornecedores]);

  const loadData = async () => {
    setLoading(true);
    const response = await fetchWithAuth("/api/abastecimentos");
    const data = await response.json();
    setItems(data);
    setLoading(false);
  };

  const loadOptions = async () => {
    const [equipRes, fornRes] = await Promise.all([
      fetchWithAuth("/api/equipamentos"),
      fetchWithAuth("/api/fornecedores")
    ]);
    setEquipamentos(await equipRes.json());
    setFornecedores(await fornRes.json());
  };

  useEffect(() => {
    loadData();
    loadOptions();
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await fetchWithAuth("/api/abastecimentos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    reset({
      equipamento_id: values.equipamento_id,
      fornecedor_id: values.fornecedor_id,
      data_abastecimento: "",
      litros: 0,
      valor_total: 0
    });
    loadData();
  };

  return (
    <PageShell>
      <div className="grid gap-6">
        <SectionCard title="Novo Abastecimento">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
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
              <label>Fornecedor</label>
              <select {...register("fornecedor_id")}>
                <option value="">Selecione</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
              {errors.fornecedor_id && (
                <p className="text-sm text-red-600">{errors.fornecedor_id.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label>Data do abastecimento</label>
              <input type="date" {...register("data_abastecimento")} />
              {errors.data_abastecimento && (
                <p className="text-sm text-red-600">{errors.data_abastecimento.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label>Litros</label>
              <input type="number" step="0.1" {...register("litros")} />
              {errors.litros && <p className="text-sm text-red-600">{errors.litros.message}</p>}
            </div>
            <div className="space-y-1">
              <label>Valor total</label>
              <input type="number" step="0.01" {...register("valor_total")} />
              {errors.valor_total && (
                <p className="text-sm text-red-600">{errors.valor_total.message}</p>
              )}
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="bg-slate-900 text-white" disabled={isSubmitting}>
                Salvar
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Abastecimentos registrados">
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
                    const equip = maps.equipamentos.get(info.getValue() as string);
                    return equip ? `${equip.codigo} - ${equip.descricao}` : info.getValue();
                  }
                },
                {
                  header: "Fornecedor",
                  accessorKey: "fornecedor_id",
                  cell: (info) => maps.fornecedores.get(info.getValue() as string)?.nome ?? info.getValue()
                },
                { accessorKey: "data_abastecimento", header: "Data" },
                { accessorKey: "litros", header: "Litros" },
                {
                  accessorKey: "valor_total",
                  header: "Valor",
                  cell: (info) => `R$ ${Number(info.getValue()).toFixed(2)}`
                }
              ]}
            />
          )}
        </SectionCard>
      </div>
    </PageShell>
  );
}
