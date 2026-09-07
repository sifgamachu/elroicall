import type { Session } from "@supabase/supabase-js";
import { PORTAL_API } from "@/lib/api";
import { SUPABASE_ANON_KEY } from "@/lib/supabase";

export type PortalProgress = {
  pct?: number;
  label?: string;
  next?: string;
  chapters_done?: number;
};

export type PortalTrack = {
  mode: string;
  active: boolean;
  journey_day?: number;
  hour_local?: number;
  minute_local?: number;
  tz?: string;
  days?: string;
  caller_name?: string;
  progress?: PortalProgress;
};

export type PortalHistoryItem = {
  created_at?: string;
  figure_name?: string;
  summary?: string;
};

export type PortalMember = {
  email?: string;
  caller_name?: string;
  phone?: string;
  phone_verified?: boolean;
  verify_ready?: boolean;
  total_calls?: number;
  schedules?: PortalTrack[];
  history?: PortalHistoryItem[];
};

export async function portalRequest<T>(
  path: string,
  session: Session,
  body?: unknown,
): Promise<{ status: number; data: T }> {
  const response = await fetch(`${PORTAL_API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as T;
  return { status: response.status, data };
}

export async function getPortalMember(session: Session): Promise<PortalMember> {
  const { status, data } = await portalRequest<PortalMember>("/me", session);
  if (status !== 200) throw new Error(String(status));
  return data;
}
