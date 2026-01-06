import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthContext } from "@/lib/apiAuth";
import { registerAudit } from "@/lib/audit";

const schema = z.object({
  data_referencia: z.string().min(1).optional(),
  leitura: z.number().min(0).optional(),
  observacao: z.string().optional().nullable()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  const payload = schema.parse(await request.json());
  const supabase = supabaseAdmin();

  const { data: current, error: currentError } = await supabase
    .from("horimetros")
    .select("equipamento_id")
    .eq("id", params.id)
    .single();

  if (currentError || !current) {
    return NextResponse.json({ message: currentError?.message ?? "Registro não encontrado" }, { status: 404 });
  }

  if (payload.leitura !== undefined) {
    const { data: lastReading, error: lastError } = await supabase
      .from("horimetros")
      .select("leitura")
      .eq("equipamento_id", current.equipamento_id)
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
  }

  const { data, error } = await supabase
    .from("horimetros")
    .update(payload)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Erro ao atualizar" }, { status: 500 });
  }

  await registerAudit({
    usuarioId: auth.userId,
    entidade: "horimetros",
    entidadeId: data.id,
    acao: "UPDATE"
  });

  return NextResponse.json(data);
}
