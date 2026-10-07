type Playable = { id: string; status: string; provider: string; access: string; storage_path: string | null };
type Dependencies = {
  loadMedia: (id: string) => Promise<Playable | null>;
  identify: (token: string) => Promise<string | null>;
  verifyMembership: (userId: string) => Promise<boolean>;
  signVideo: (path: string) => Promise<string>;
};
const ORIGINS = new Set(['https://elroicall.com', 'https://elroicall.app', 'https://localhost', 'capacitor://localhost', 'http://localhost', 'http://127.0.0.1:3000', 'http://localhost:3000']);
export function membershipActive(payload: unknown, now = Date.now()): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const subscriber = (payload as { subscriber?: { entitlements?: Record<string, { expires_date?: string | null; grace_period_expires_date?: string | null }> } }).subscriber;
  const entitlement = subscriber?.entitlements?.elroi_plus;
  if (!entitlement) return false;
  return entitlement.expires_date === null || typeof entitlement.expires_date === 'string' && Date.parse(entitlement.expires_date) > now || typeof entitlement.grace_period_expires_date === 'string' && Date.parse(entitlement.grace_period_expires_date) > now;
}
export function createMediaAccess(deps: Dependencies) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = { 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (origin && ORIGINS.has(origin)) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization,content-type,apikey', 'Access-Control-Allow-Methods': 'GET,OPTIONS' });
    const reply = (status: number, message: string) => Response.json({ message }, { status, headers });
    if (origin && !ORIGINS.has(origin)) return reply(403, 'This app address is not allowed.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'GET') return reply(405, 'Use GET to open a film.');
    const path = new URL(request.url).pathname;
    const match = path.match(/\/media-access\/play\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    if (!match) return reply(404, 'This film address is not available.');
    try {
      const media = await deps.loadMedia(match[1]);
      if (!media || media.status !== 'published') return reply(404, 'This film has not been released.');
      if (media.provider !== 'storage' || !media.storage_path || !/^videos\/[a-f0-9-]{36}\.mp4$/.test(media.storage_path)) return reply(409, 'This film is not ready to stream.');
      if (media.access === 'member') {
        const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
        const userId = bearer ? await deps.identify(bearer) : null;
        if (!userId) return reply(401, 'Sign in to play this member film.');
        if (!await deps.verifyMembership(userId)) return reply(403, 'An active Elroi Plus membership is needed. Restore your purchase from Membership.');
      } else if (media.access !== 'free') return reply(403, 'Playback access could not be verified.');
      return Response.json({ url: await deps.signVideo(media.storage_path) }, { headers });
    } catch { return reply(503, 'Playback access could not be verified right now. Please try again.'); }
  };
}
