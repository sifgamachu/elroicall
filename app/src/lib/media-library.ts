import { supabase } from "./supabase";
import { SUPABASE_URL } from "./api";
import type { MediaItem } from "./media-model";
import { CHANNEL_MESSAGES } from "./youtube-channel";

// Existing, verified channel content remains available if the catalog is offline.
export const CHANNEL_MEDIA: MediaItem[] = CHANNEL_MESSAGES.map(
  (message, index) => ({
    id: message.id,
    slug: message.slug,
    title: message.title,
    synopsis: message.summary,
    section: "watch",
    book: message.passage.startsWith("Psalm") ? "Psalms" : "2 Corinthians",
    passage: message.passage,
    artwork: index === 0 ? "creation" : "worship",
    provider: "youtube",
    youtube_id: message.id,
    storage_path: null,
    duration_seconds: message.duration
      .split(":")
      .reduce((total, value) => total * 60 + Number(value), 0),
    status: "published",
    access: "free",
    reflection_question: message.question,
    study_day: message.readingDays[0] || null,
    position: index,
  })
);
const GENESIS_CHAPTERS = [
  [
    "genesis-creation",
    "In the beginning",
    "Genesis 1–2",
    "creation",
    "Creation, light, life, and a world called good.",
  ],
  [
    "genesis-eden",
    "The garden and the choice",
    "Genesis 3",
    "creation",
    "Trust, temptation, and the first promise of hope.",
  ],
  [
    "genesis-noah",
    "Noah and the covenant",
    "Genesis 6–9",
    "wilderness",
    "The flood, a new beginning, and a covenant marked by a rainbow.",
  ],
  [
    "genesis-abraham",
    "A promise beneath the stars",
    "Genesis 12–15",
    "wilderness",
    "Abraham leaves the familiar and learns to trust the promise of God.",
  ],
  [
    "genesis-hagar",
    "The God who sees",
    "Genesis 16",
    "hagar",
    "Hagar is found beside a spring. The story behind El Roi Calls.",
  ],
  [
    "genesis-jacob",
    "Jacob: the long way home",
    "Genesis 25–35",
    "wilderness",
    "Family conflict, an encounter with God, and a changed name.",
  ],
  [
    "genesis-joseph",
    "Joseph: from pit to purpose",
    "Genesis 37–50",
    "joseph",
    "Betrayal, endurance, reconciliation, and provision for a family.",
  ],
] as const;
export const GENESIS_MEDIA: MediaItem[] = GENESIS_CHAPTERS.map(
  ([slug, title, passage, artwork, synopsis], index) => ({
    id: slug,
    slug,
    title,
    passage,
    artwork,
    synopsis,
    section: "cinema",
    book: "Genesis",
    provider: "storage",
    youtube_id: null,
    storage_path: null,
    duration_seconds: 0,
    status: "coming_soon",
    access: "free",
    reflection_question: `What do you notice about God in ${passage}?`,
    study_day: index < 4 ? 1 : index < 6 ? 2 : 3,
    position: index,
  })
);

export async function getMediaLibrary(editor = false): Promise<MediaItem[]> {
  let query = supabase
    .from("elroi_media")
    .select("*")
    .order("position")
    .order("title")
    .limit(250)
    .abortSignal(AbortSignal.timeout(12000));
  if (!editor) query = query.in("status", ["published", "coming_soon"]);
  const { data, error } = await query;
  if (error)
    throw new Error(
      "The library could not refresh. Your saved channel selection is still available."
    );
  return data as MediaItem[];
}
export async function getMediaPlayback(id: string): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/media-access/play/${encodeURIComponent(id)}`,
    {
      headers: data.session
        ? { Authorization: `Bearer ${data.session.access_token}` }
        : {},
      signal: AbortSignal.timeout(15000),
    }
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.message || "This video could not be opened. Please try again."
    );
  if (
    typeof result.url !== "string" ||
    !result.url.startsWith(
      `${SUPABASE_URL}/storage/v1/object/sign/elroi-media/`
    )
  )
    throw new Error("The video address could not be verified.");
  return result.url;
}
