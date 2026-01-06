import { createBrowserClient } from "@/lib/supabaseClient";

export const fetchWithAuth = async (input: RequestInfo, init?: RequestInit) => {
  const supabase = createBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers
  });
};
