import test from "node:test";
import assert from "node:assert/strict";
import { selectCinematicFeedItems } from "../src/lib/cinematic-feed.ts";

const base = {
  synopsis: "Story",
  book: "Genesis",
  passage: "Genesis 1",
  artwork: "creation",
  youtube_id: null,
  storage_path: null,
  duration_seconds: 10,
  access: "free",
  reflection_question: "What do you notice?",
  study_day: 1,
  position: 0,
};

test("cinematic feed prioritizes released free Bible films", () => {
  const items = [
    {
      ...base,
      id: "message",
      slug: "message",
      title: "Message",
      section: "watch",
      provider: "youtube",
      youtube_id: "abcdefghijk",
      status: "published",
    },
    {
      ...base,
      id: "film",
      slug: "film",
      title: "Film",
      section: "cinema",
      provider: "storage",
      storage_path: "videos/123e4567-e89b-12d3-a456-426614174000.mp4",
      status: "published",
    },
    {
      ...base,
      id: "upcoming",
      slug: "upcoming",
      title: "Upcoming",
      section: "cinema",
      provider: "storage",
      status: "coming_soon",
    },
  ];
  assert.deepEqual(
    selectCinematicFeedItems(items).map(item => item.id),
    ["film", "message", "upcoming"]
  );
});

test("member films are not auto-surfaced as free scrolling previews", () => {
  const items = [
    {
      ...base,
      id: "member-film",
      slug: "member-film",
      title: "Member Film",
      section: "cinema",
      provider: "storage",
      storage_path: "videos/123e4567-e89b-12d3-a456-426614174000.mp4",
      status: "published",
      access: "member",
    },
  ];
  assert.equal(selectCinematicFeedItems(items).length, 0);
});
