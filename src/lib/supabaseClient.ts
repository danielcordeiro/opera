import { createClient } from "@supabase/supabase-js";

export const createBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase env vars não configuradas");
  }
  return createClient(url, anonKey);
};
