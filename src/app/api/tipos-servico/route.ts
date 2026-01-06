import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthContext } from "@/lib/apiAuth";
import { registerAudit } from "@/lib/audit";

const schema = z.object({
  nome: z.string().min(1),
  descricao: z.string().min(1),
  ativo: z.boolean().default(true)
});

export async function GET(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("tipos_servico").select("*").order("nome");
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }
  const payload = schema.parse(await request.json());
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("tipos_servico").insert(payload).select("*").single();
  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Erro ao salvar" }, { status: 500 });
  }
  await registerAudit({
    usuarioId: auth.userId,
    entidade: "tipos_servico",
    entidadeId: data.id,
    acao: "CREATE"
  });
  return NextResponse.json(data, { status: 201 });
}
