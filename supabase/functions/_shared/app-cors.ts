// Origins identify the supported app surfaces. Each service still verifies
// bearer tokens and account ownership; CORS never grants account access.
const APP_ORIGINS = [
  'https://elroicall.com',
  'https://www.elroicall.com',
  'https://elroicall.app',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
];

export function withAppCors(
  handler: (request: Request) => Promise<Response>,
  siteOrigin = 'https://elroicall.com',
) {
  const site = siteOrigin || 'https://elroicall.com';
  const allowed = new Set([...APP_ORIGINS, site]);
  return async (request: Request): Promise<Response> => {
    const response = await handler(request);
    const origin = request.headers.get('origin');
    if (origin === null || allowed.has(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || site);
    } else {
      response.headers.delete('Access-Control-Allow-Origin');
    }
    response.headers.set('Access-Control-Allow-Headers', 'authorization,apikey,content-type,x-client-info');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    const vary = response.headers.get('Vary')?.split(',').map(value => value.trim()).filter(Boolean) || [];
    if (!vary.some(value => value.toLowerCase() === 'origin')) vary.push('Origin');
    response.headers.set('Vary', vary.join(', '));
    return response;
  };
}
