export const SUPABASE_URL = "https://mkocnufwmsfchivfbhuf.supabase.co";

export const INTAKE_API = `${SUPABASE_URL}/functions/v1/intake`;
export const GIFT_API = `${SUPABASE_URL}/functions/v1/gift`;
export const PORTAL_API = `${SUPABASE_URL}/functions/v1/portal`;

export async function requestJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => ({}))) as T;

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: unknown }).error ?? response.status)
        : String(response.status);
    throw new Error(message);
  }

  return payload;
}

export function postJson<T>(url: string, body: unknown) {
  return requestJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
