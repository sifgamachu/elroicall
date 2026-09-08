export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL ?? "https://mkocnufwmsfchivfbhuf.supabase.co";

export const INTAKE_API = `${SUPABASE_URL}/functions/v1/intake`;
export const GIFT_API = `${SUPABASE_URL}/functions/v1/gift`;
export const PORTAL_API = `${SUPABASE_URL}/functions/v1/portal`;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Keep the deadline active through body parsing, not just response headers.
// Never automatically retry a write: the server may already have accepted it.
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  timeoutMs = 20_000,
  client: typeof fetch = fetch,
): Promise<{ status: number; data: T }> {
  const controller = new AbortController();
  const abort = () => controller.abort(init?.signal?.reason);
  if (init?.signal?.aborted) abort();
  else init?.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException("Request timed out", "TimeoutError")), timeoutMs);
  try {
    const response = await client(url, { ...init, signal: controller.signal });
    const data = await response.json().catch((error: unknown) => {
      if (controller.signal.aborted) throw controller.signal.reason;
      if (response.ok) throw new ApiError("invalid_response", response.status);
      if (error instanceof SyntaxError) return {};
      throw error;
    }) as T;
    return { status: response.status, data };
  } finally {
    clearTimeout(timer);
    init?.signal?.removeEventListener("abort", abort);
  }
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const { status, data: payload } = await fetchJson<T>(url, init);

  if (status < 200 || status >= 300) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: unknown }).error ?? status)
        : String(status);
    throw new ApiError(message, status);
  }

  return payload;
}

export function postJson<T>(url: string, body: unknown, signal?: AbortSignal) {
  return requestJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
}
