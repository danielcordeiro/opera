"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import SectionCard from "@/components/SectionCard";
import DataTable from "@/components/DataTable";
import { fetchWithAuth } from "@/lib/apiClient";

type Equipamento = {
  id: string;
  codigo?: string;
  descricao?: string;
};

type TipoServico = {
  id: string;
  nome?: string;
};

type Fornecedor = {
  id: string;
  nome?: string;
};

type Horimetro = {
  id: string;
  equipamento_id: string;
  data_referencia: string;
  leitura: number;
  horas_trabalhadas?: number | null;
  observacao?: string | null;
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

type Abastecimento = {
  id: string;
  equipamento_id: string;
  fornecedor_id: string;
  data_abastecimento: string;
  litros: number;
  valor_total: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);

const parseDate = (value?: string, isEnd = false) => {
  if (!value) return null;
  return new Date(`${value}T${isEnd ? "23:59:59" : "00:00:00"}`);
};

export default function RelatoriosPage() {
  const [horimetros, setHorimetros] = useState<Horimetro[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const loadData = async () => {
    setLoading(true);
    const [horRes, servRes, abastRes, equipRes, tipoRes, fornRes] = await Promise.all([
      fetchWithAuth("/api/horimetros"),
      fetchWithAuth("/api/servicos"),
      fetchWithAuth("/api/abastecimentos"),
      fetchWithAuth("/api/equipamentos"),
      fetchWithAuth("/api/tipos-servico"),
      fetchWithAuth("/api/fornecedores")
    ]);

    setHorimetros(await horRes.json());
    setServicos(await servRes.json());
    setAbastecimentos(await abastRes.json());
    setEquipamentos(await equipRes.json());
    setTiposServico(await tipoRes.json());
    setFornecedores(await fornRes.json());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const maps = useMemo(() => {
    return {
      equipamentos: new Map(equipamentos.map((item) => [item.id, item])),
      tipos: new Map(tiposServico.map((item) => [item.id, item])),
      fornecedores: new Map(fornecedores.map((item) => [item.id, item]))
    };
  }, [equipamentos, fornecedores, tiposServico]);

  const startDate = useMemo(() => parseDate(startDateInput), [startDateInput]);
  const endDate = useMemo(() => parseDate(endDateInput, true), [endDateInput]);

  const isWithinRange = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  };

  const filteredHorimetros = useMemo(
    () => horimetros.filter((item) => isWithinRange(item.data_referencia)),
    [horimetros, startDate, endDate]
  );
  const filteredServicos = useMemo(
    () => servicos.filter((item) => isWithinRange(item.data_servico)),
    [servicos, startDate, endDate]
  );
  const filteredAbastecimentos = useMemo(
    () => abastecimentos.filter((item) => isWithinRange(item.data_abastecimento)),
    [abastecimentos, startDate, endDate]
  );

  const horimetroIndicadores = useMemo(() => {
    const totalHoras = filteredHorimetros.reduce(
      (acc, item) => acc + (item.horas_trabalhadas ?? 0),
      0
    );
    const mediaLeitura =
      filteredHorimetros.length > 0
        ? filteredHorimetros.reduce((acc, item) => acc + item.leitura, 0) /
          filteredHorimetros.length
        : 0;
    return {
      total: filteredHorimetros.length,
      totalHoras,
      mediaLeitura
    };
  }, [filteredHorimetros]);

  const servicoIndicadores = useMemo(() => {
    const totalCusto = filteredServicos.reduce((acc, item) => acc + item.custo, 0);
    const mediaCusto = filteredServicos.length > 0 ? totalCusto / filteredServicos.length : 0;
    return {
      total: filteredServicos.length,
      totalCusto,
      mediaCusto
    };
  }, [filteredServicos]);

  const abastecimentoIndicadores = useMemo(() => {
    const totalLitros = filteredAbastecimentos.reduce((acc, item) => acc + item.litros, 0);
    const totalValor = filteredAbastecimentos.reduce((acc, item) => acc + item.valor_total, 0);
    return {
      total: filteredAbastecimentos.length,
      totalLitros,
      totalValor
    };
  }, [filteredAbastecimentos]);

  const handleClearFilters = () => {
    setStartDateInput("");
    setEndDateInput("");
  };

  return (
    <PageShell>
      <div className="grid gap-6">
        <SectionCard title="Filtros de data">
          <div className="grid gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))_auto]">
            <div className="space-y-1">
              <label>Data inicial</label>
              <input
                type="date"
                value={startDateInput}
                onChange={(event) => setStartDateInput(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label>Data final</label>
              <input
                type="date"
                value={endDateInput}
                onChange={(event) => setEndDateInput(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button type="button" className="border border-slate-200" onClick={handleClearFilters}>
                Limpar filtros
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Horímetro">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Registros</p>
                  <p className="text-2xl font-semibold">{horimetroIndicadores.total}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Horas trabalhadas</p>
                  <p className="text-2xl font-semibold">
                    {formatNumber(horimetroIndicadores.totalHoras)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Média de leitura</p>
                  <p className="text-2xl font-semibold">
                    {formatNumber(horimetroIndicadores.mediaLeitura)}
                  </p>
                </div>
              </div>
              <DataTable
                data={filteredHorimetros}
                columns={[
                  {
                    header: "Equipamento",
                    accessorKey: "equipamento_id",
                    cell: (info) => {
                      const equip = maps.equipamentos.get(info.getValue() as string);
                      return equip ? `${equip.codigo} - ${equip.descricao}` : info.getValue();
                    }
                  },
                  { accessorKey: "data_referencia", header: "Data" },
                  { accessorKey: "leitura", header: "Leitura" },
                  {
                    accessorKey: "horas_trabalhadas",
                    header: "Horas",
                    cell: (info) => info.getValue() ?? "-"
                  },
                  { accessorKey: "observacao", header: "Observação" }
                ]}
              />
            </div>
          )}
        </SectionCard>

        <SectionCard title="Serviços">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Serviços</p>
                  <p className="text-2xl font-semibold">{servicoIndicadores.total}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Custo total</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(servicoIndicadores.totalCusto)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Custo médio</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(servicoIndicadores.mediaCusto)}
                  </p>
                </div>
              </div>
              <DataTable
                data={filteredServicos}
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
                    cell: (info) => formatCurrency(Number(info.getValue() || 0))
                  }
                ]}
              />
            </div>
          )}
        </SectionCard>

        <SectionCard title="Abastecimentos">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Abastecimentos</p>
                  <p className="text-2xl font-semibold">{abastecimentoIndicadores.total}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Litros totais</p>
                  <p className="text-2xl font-semibold">
                    {formatNumber(abastecimentoIndicadores.totalLitros)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Valor total</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(abastecimentoIndicadores.totalValor)}
                  </p>
                </div>
              </div>
              <DataTable
                data={filteredAbastecimentos}
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
                    cell: (info) => formatCurrency(Number(info.getValue() || 0))
                  }
                ]}
              />
            </div>
          )}
        </SectionCard>
      </div>
    </PageShell>
  );
}
