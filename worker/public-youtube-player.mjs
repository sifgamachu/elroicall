const PREFIX = "/app-player/";
const APP_REFERRER = "https://com.elroicall.app";

export function publicYouTubePlayer(request) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(PREFIX)) return null;
  const id = /^\/app-player\/youtube\/([a-zA-Z0-9_-]{11})\/$/.exec(
    url.pathname,
  )?.[1];
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    // Only this public, script-free page may be framed by the app. Account
    // routes keep their normal protection. No auth or storage APIs are used.
    "Content-Security-Policy":
      "default-src 'none'; style-src 'unsafe-inline'; frame-src https://www.youtube-nocookie.com; frame-ancestors https://elroicall.com https://www.elroicall.com capacitor://localhost https://localhost http://localhost; base-uri 'none'; form-action 'none'",
  };
  if (!id || url.search) {
    headers["X-Frame-Options"] = "DENY";
    return new Response("Video player not found.", { status: 404, headers });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    headers.Allow = "GET, HEAD";
    return new Response("Method not allowed.", { status: 405, headers });
  }
  const source = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  source.searchParams.set("playsinline", "1");
  source.searchParams.set("rel", "0");
  source.searchParams.set("origin", "https://elroicall.com");
  source.searchParams.set("widget_referrer", APP_REFERRER);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Elroi Calls video player</title>
<style>html,body{margin:0;width:100%;height:100%;background:#000}iframe{display:block;width:100%;height:100%;min-height:200px;border:0}</style></head>
<body><iframe title="Elroi Calls YouTube video" src="${source.href.replaceAll("&", "&amp;")}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></body></html>`;
  return new Response(request.method === "HEAD" ? null : html, { headers });
}
