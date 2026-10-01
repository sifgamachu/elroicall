const PUBLIC_PLAYER_ORIGIN = "https://elroicall.com";

function videoId(value: string | null): string {
  if (!value || !/^[a-zA-Z0-9_-]{11}$/.test(value))
    throw new Error("This video does not have a valid playback source.");
  return value;
}

export function youtubePlayerUrl(
  id: string | null,
  native: boolean,
  webOrigin: string
): string {
  const checked = videoId(id);
  // The isolated HTTPS page supplies a web Referer to the nested player.
  // It never loads account code or receives a session or private video URL.
  if (native) return `${PUBLIC_PLAYER_ORIGIN}/app-player/youtube/${checked}/`;
  const url = new URL(`https://www.youtube-nocookie.com/embed/${checked}`);
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("rel", "0");
  try {
    const origin = new URL(webOrigin);
    if (origin.protocol === "https:" || origin.protocol === "http:")
      url.searchParams.set("origin", origin.origin);
  } catch {
    // The player still works in a normal browser without an explicit origin.
  }
  return url.href;
}

export function youtubeWatchUrl(id: string | null): string {
  return `https://www.youtube.com/watch?v=${videoId(id)}`;
}
