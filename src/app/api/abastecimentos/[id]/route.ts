import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthContext } from "@/lib/apiAuth";
import { registerAudit } from "@/lib/audit";

const schema = z.object({
  equipamento_id: z.string().min(1).optional(),
  fornecedor_id: z.string().min(1).optional(),
  data_abastecimento: z.string().min(1).optional(),
  litros: z.number().min(0).optional(),
  valor_total: z.number().min(0).optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  const payload = schema.parse(await request.json());
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("abastecimentos")
    .update(payload)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Erro ao atualizar" }, { status: 500 });
  }

  await registerAudit({
    usuarioId: auth.userId,
    entidade: "abastecimentos",
    entidadeId: data.id,
    acao: "UPDATE"
  });

  return NextResponse.json(data);
}
