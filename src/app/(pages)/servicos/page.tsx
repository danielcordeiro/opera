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
  tipo_servico_id: z.string().min(1),
  fornecedor_id: z.string().optional().nullable(),
  data_servico: z.string().min(1),
  descricao: z.string().min(1),
  custo: z.coerce.number().min(0)
});

type Option = {
  id: string;
  nome?: string;
  codigo?: string;
  descricao?: string;
};

type Servico = {
  id: string;
  equipamento_id: string;
  tipo_servico_id: string;
  fornecedor_id?: string | null;
  data_servico: string;
  descricao: string;
  custo: number;
};

export default function ServicosPage() {
  const [items, setItems] = useState<Servico[]>([]);
  const [equipamentos, setEquipamentos] = useState<Option[]>([]);
  const [tipos, setTipos] = useState<Option[]>([]);
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
      tipos: new Map(tipos.map((item) => [item.id, item])),
      fornecedores: new Map(fornecedores.map((item) => [item.id, item]))
    };
  }, [equipamentos, tipos, fornecedores]);

  const loadData = async () => {
    setLoading(true);
    const response = await fetchWithAuth("/api/servicos");
    const data = await response.json();
    setItems(data);
    setLoading(false);
  };

  const loadOptions = async () => {
    const [equipRes, tiposRes, fornRes] = await Promise.all([
      fetchWithAuth("/api/equipamentos"),
      fetchWithAuth("/api/tipos-servico"),
      fetchWithAuth("/api/fornecedores")
    ]);
    setEquipamentos(await equipRes.json());
    setTipos(await tiposRes.json());
    setFornecedores(await fornRes.json());
  };

  useEffect(() => {
    loadData();
    loadOptions();
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await fetchWithAuth("/api/servicos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    reset({
      equipamento_id: values.equipamento_id,
      tipo_servico_id: values.tipo_servico_id,
      fornecedor_id: values.fornecedor_id,
      data_servico: "",
      descricao: "",
      custo: 0
    });
    loadData();
  };

  return (
    <PageShell>
      <div className="grid gap-6">
        <SectionCard title="Novo Serviço">
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
              <label>Tipo de Serviço</label>
              <select {...register("tipo_servico_id")}>
                <option value="">Selecione</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
              {errors.tipo_servico_id && (
                <p className="text-sm text-red-600">{errors.tipo_servico_id.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label>Fornecedor (opcional)</label>
              <select {...register("fornecedor_id")}>
                <option value="">Sem fornecedor</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label>Data do serviço</label>
              <input type="date" {...register("data_servico")} />
              {errors.data_servico && (
                <p className="text-sm text-red-600">{errors.data_servico.message}</p>
              )}
            </div>
            <div className="space-y-1 md:col-span-2">
              <label>Descrição</label>
              <input {...register("descricao")} />
              {errors.descricao && <p className="text-sm text-red-600">{errors.descricao.message}</p>}
            </div>
            <div className="space-y-1">
              <label>Custo</label>
              <input type="number" step="0.01" {...register("custo")} />
              {errors.custo && <p className="text-sm text-red-600">{errors.custo.message}</p>}
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="bg-slate-900 text-white" disabled={isSubmitting}>
                Salvar
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Serviços registrados">
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
                  header: "Tipo",
                  accessorKey: "tipo_servico_id",
                  cell: (info) => maps.tipos.get(info.getValue() as string)?.nome ?? info.getValue()
                },
                {
                  header: "Fornecedor",
                  accessorKey: "fornecedor_id",
                  cell: (info) =>
                    info.getValue()
                      ? maps.fornecedores.get(info.getValue() as string)?.nome ?? info.getValue()
                      : "-"
                },
                { accessorKey: "data_servico", header: "Data" },
                { accessorKey: "descricao", header: "Descrição" },
                {
                  accessorKey: "custo",
                  header: "Custo",
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
