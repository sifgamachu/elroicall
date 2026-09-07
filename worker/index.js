// El Roi Call — asset server + search-engine indexing pinger.
// Assets are served directly by the platform. This worker handles:
//   • daily IndexNow submission
//   • an optional authenticated manual IndexNow trigger
//
// Security note: no access tokens belong in this repository. If manual
// triggering is needed, configure INDEXNOW_TRIGGER_TOKEN as a Worker secret.

const KEY = "54a69a9616b3d4daebf14fd26db02f90";
const HOST = "elroicall.com";
const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/about/`,
  `https://${HOST}/begin/`,
  `https://${HOST}/gift/`,
];

async function pingIndexNow() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: URLS,
    }),
  });

  return res.status;
}

function authorizedManualTrigger(request, env) {
  const expected = env.INDEXNOW_TRIGGER_TOKEN;
  if (!expected) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/_indexnow") {
      if (request.method !== "POST") {
        return new Response("method not allowed", {
          status: 405,
          headers: { Allow: "POST" },
        });
      }

      // Return 404 instead of advertising whether the endpoint exists.
      if (!authorizedManualTrigger(request, env)) {
        return new Response("not found", { status: 404 });
      }

      const status = await pingIndexNow();
      return Response.json({
        ok: status === 200 || status === 202,
        urls: URLS.length,
        indexnow_status: status,
      });
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(pingIndexNow());
  },
};
