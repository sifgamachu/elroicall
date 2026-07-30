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
  `https://${HOST}/account/`,
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
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Temporary utility: transcribe an audio file with Workers AI Whisper.
    // GET /_transcribe?t=<token>&u=<raw.githubusercontent url>. Cached; safe to poll.
    if (url.pathname === "/_transcribe" && url.searchParams.get("t") === TOKEN) {
      const u = url.searchParams.get("u") || "";
      if (!u.startsWith("https://raw.githubusercontent.com/")) return new Response("bad source", { status: 400 });
      const cache = caches.default;
      const cacheKey = new Request("https://elroicall.com/_transcribe_result?u=" + encodeURIComponent(u));
      const hit = await cache.match(cacheKey);
      if (hit) return hit;
      const work = (async () => {
        const audio = await (await fetch(u)).arrayBuffer();
        let out;
        try {
          out = await env.AI.run("@cf/openai/whisper", { audio: [...new Uint8Array(audio)] });
        } catch (e1) {
          try {
            let b = ""; const bytes = new Uint8Array(audio);
            for (let i = 0; i < bytes.length; i += 0x8000) b += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
            out = await env.AI.run("@cf/openai/whisper-large-v3-turbo", { audio: btoa(b) });
          } catch (e2) {
            out = { error: String(e1).slice(0, 300) + " || " + String(e2).slice(0, 300) };
          }
        }
        const resp = new Response(JSON.stringify({ done: true, text: out.text ?? null, vtt: out.vtt ?? null, error: out.error ?? null }), {
          headers: { "content-type": "application/json", "cache-control": "max-age=3600" },
        });
        await cache.put(cacheKey, resp.clone());
        return resp;
      })();
      ctx.waitUntil(work.catch(() => {}));
      const timer = new Promise((r) => setTimeout(() => r(null), 20000));
      const first = await Promise.race([work, timer]);
      if (first) return first;
      return new Response(JSON.stringify({ pending: true }), { headers: { "content-type": "application/json" } });
    }

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
