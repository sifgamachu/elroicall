export type MediaItem = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  section: "watch" | "cinema";
  book: string;
  passage: string;
  artwork: string;
  provider: "youtube" | "storage";
  youtube_id: string | null;
  storage_path: string | null;
  duration_seconds: number;
  status: "draft" | "coming_soon" | "published";
  access: "free" | "member";
  reflection_question: string;
  study_day: number | null;
  position: number;
};

export const MEDIA_ARTWORK = [
  "creation",
  "hagar",
  "joseph",
  "rescue",
  "wilderness",
  "wisdom",
  "galilee",
  "empty-tomb",
  "new-creation",
  "worship",
] as const;
export function mediaArtwork(item: Pick<MediaItem, "artwork">) {
  return `/images/readings/${MEDIA_ARTWORK.includes(item.artwork as (typeof MEDIA_ARTWORK)[number]) ? item.artwork : "creation"}.webp`;
}
export function mediaDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
export function mediaScheduleUrl(item: Pick<MediaItem, "title" | "passage">) {
  return `/schedule/?${new URLSearchParams({ source: "app", content: "bible_study", topic: `Bible study on ${item.passage}: ${item.title}` })}`;
}
export function safeStoragePath(path: unknown): path is string {
  return typeof path === "string" && /^videos\/[a-f0-9-]{36}\.mp4$/.test(path);
}
export function canPlayMedia(item: MediaItem) {
  return (
    item.status === "published" &&
    (item.provider === "youtube"
      ? /^[a-zA-Z0-9_-]{11}$/.test(item.youtube_id || "")
      : safeStoragePath(item.storage_path))
  );
}
