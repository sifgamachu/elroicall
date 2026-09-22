# El Roi Calls: watch, reflect, talk

Channel: https://www.youtube.com/channel/UC7WApBz8RPb6H9aERdsOBMQ

## Placement

- Homepage: after the core call formats, before the deeper conversation walkthrough.
- Public navigation: Watch & reflect; footer also links directly to YouTube.
- Reading days: optional links only when the video's Scripture is in the day's assignment (currently days 34 and 77).
- Member dashboard and seasonal promotion retain their existing purpose and layout.

## Curated content

Descriptions and English captions were reviewed on 2026-09-22. Website titles are editorial companion titles; player titles use the YouTube titles. Scripture quotations are KJV. Companion reflections are original editorial copy. Videos are selected, not an automatic latest-upload feed.

| Website URL | YouTube ID | Main Scripture |
| --- | --- | --- |
| https://elroicall.com/watch/rooted-in-god/ | 7bT1Tzisz-A | Psalm 1:3 |
| https://elroicall.com/watch/morning-prayer/ | UPNGrIWqtSE | Psalm 5:12 |
| https://elroicall.com/watch/night-prayer/ | y_mAxFernTY | Psalm 8:5 |
| https://elroicall.com/watch/walk-by-faith/ | ZG983G9I0FY | 2 Corinthians 5:7 |

These public URLs can be added to the corresponding video descriptions. No YouTube descriptions or comments were changed by this release. New messages belong in `app/src/lib/youtube-channel.ts`; verify ownership, captions, Scripture, embedding availability, duration, and matching reading assignments before adding them. Add their public pages to the sitemap.

## Behavior

The YouTube privacy-enhanced player loads on request. It keeps normal player controls and a visible link to watch directly on YouTube. Public page sharing copies only the canonical message URL. Reflection text stays in React memory; continuing to `/begin/` includes the topic, passage, and reflection for review under the existing consent flow. Existing drafts are retained, and oversized combined drafts require editing rather than silent truncation. Schedule links carry only public message context. The saved-notes link opens the existing member space and does not claim to save the reflection automatically.

The original call scheduling availability checks continue to apply. This integration does not activate scheduled outbound calling.
