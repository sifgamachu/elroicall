// El Roi Call — asset server + search-engine indexing pinger.
// Assets are served directly by the platform; this worker only handles
// asset misses (passthrough) and the indexing duties below.
//   • Daily cron pings IndexNow (Bing, DuckDuckGo, Yandex, Naver, Seznam)
//   • GET /_indexnow?t=<token> fires an immediate ping from any browser

const KEY = "54a69a9616b3d4daebf14fd26db02f90";
const HOST = "elroicall.com";
const TOKEN = "dc_c914f06284ddf06275238b88";
const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/about/`,
  `https://${HOST}/begin/`,
  `https://${HOST}/gift/`,
  `https://${HOST}/privacy/`,
  `https://${HOST}/terms/`,
];

async function pingIndexNow() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: URLS }),
  });
  return res.status; // 200 or 202 = accepted
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/_indexnow" && url.searchParams.get("t") === TOKEN) {
      const status = await pingIndexNow();
      return new Response(JSON.stringify({ ok: status === 200 || status === 202, urls: URLS.length, indexnow_status: status }), {
        headers: { "content-type": "application/json" },
      });
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(pingIndexNow());
  },
};
