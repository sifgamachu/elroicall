import { canPlayMedia, type MediaItem } from "./media-model.ts";

export function selectCinematicFeedItems(items: MediaItem[], limit = 14) {
  const releasedCinema = items.filter(
    item =>
      item.section === "cinema" &&
      item.status === "published" &&
      item.access === "free" &&
      canPlayMedia(item)
  );
  const releasedMessages = items.filter(
    item =>
      item.section === "watch" &&
      item.status === "published" &&
      item.access === "free" &&
      canPlayMedia(item)
  );
  const upcomingCinema = items.filter(
    item => item.section === "cinema" && item.status === "coming_soon"
  );
  return [...releasedCinema, ...releasedMessages, ...upcomingCinema].slice(
    0,
    Math.max(1, limit)
  );
}
