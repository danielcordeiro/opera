import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const registerAudit = async (params: {
  usuarioId: string;
  entidade: string;
  entidadeId: string;
  acao: "CREATE" | "UPDATE";
}) => {
  const supabase = supabaseAdmin();
  await supabase.from("audit_log").insert({
    usuario_id: params.usuarioId,
    entidade: params.entidade,
    entidade_id: params.entidadeId,
    acao: params.acao
  });
};
