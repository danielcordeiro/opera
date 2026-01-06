import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthContext } from "@/lib/apiAuth";
import { registerAudit } from "@/lib/audit";

const schema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().min(1).optional(),
  ativo: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  const payload = schema.parse(await request.json());
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("tipos_servico")
    .update(payload)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Erro ao atualizar" }, { status: 500 });
  }

  await registerAudit({
    usuarioId: auth.userId,
    entidade: "tipos_servico",
    entidadeId: data.id,
    acao: "UPDATE"
  });

  return NextResponse.json(data);
}
