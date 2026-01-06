import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AuthContext = {
  userId: string;
  role: "ADMIN" | "OPERADOR" | "GESTOR";
};

export const getAuthContext = async (request: Request): Promise<AuthContext | null> => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("role, ativo")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile || profile.ativo === false) {
    return null;
  }

  return {
    userId: data.user.id,
    role: profile.role
  };
};
