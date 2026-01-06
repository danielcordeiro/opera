import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthContext } from "@/lib/apiAuth";
import { registerAudit } from "@/lib/audit";

const schema = z.object({
  equipamento_id: z.string().min(1),
  data_referencia: z.string().min(1),
  leitura: z.number().min(0),
  observacao: z.string().optional().nullable()
});

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const equipamentoId = url.searchParams.get("equipamentoId");
  const latest = url.searchParams.get("latest");

  const supabase = supabaseAdmin();

  if (latest === "true" && equipamentoId) {
    const { data, error } = await supabase
      .from("horimetros")
      .select("*")
      .eq("equipamento_id", equipamentoId)
      .order("data_referencia", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? null);
  }

  const { data, error } = await supabase
    .from("horimetros")
    .select("*")
    .order("data_referencia", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const items = (data ?? []).slice();
  const lastReadings = new Map<string, number>();

  const sortedAsc = items.slice().sort((a, b) => {
    if (a.equipamento_id === b.equipamento_id) {
      return a.data_referencia.localeCompare(b.data_referencia);
    }
    return a.equipamento_id.localeCompare(b.equipamento_id);
  });

  for (const item of sortedAsc) {
    const previous = lastReadings.get(item.equipamento_id) ?? null;
    item.leitura_anterior = previous;
    item.horas_trabalhadas = previous !== null ? item.leitura - previous : null;
    lastReadings.set(item.equipamento_id, item.leitura);
  }

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  const payload = schema.parse(await request.json());
  const supabase = supabaseAdmin();

  const { data: lastReading, error: lastError } = await supabase
    .from("horimetros")
    .select("leitura")
    .eq("equipamento_id", payload.equipamento_id)
    .order("data_referencia", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError) {
    return NextResponse.json({ message: lastError.message }, { status: 500 });
  }

  if (lastReading && payload.leitura < lastReading.leitura) {
    return NextResponse.json(
      { message: "Leitura não pode ser menor que a última registrada." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("horimetros")
    .insert({
      ...payload,
      usuario_id: auth.userId
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Erro ao salvar" }, { status: 500 });
  }

  await registerAudit({
    usuarioId: auth.userId,
    entidade: "horimetros",
    entidadeId: data.id,
    acao: "CREATE"
  });

  return NextResponse.json(data, { status: 201 });
}
