# Autumn 2026 experience

The original voice-first homepage remains primary. During the campaign it receives an autumn visual layer and a secondary promotion; `/bible-challenge/` and `/journey/` use the approved emerald-and-gold reading design. Standalone background and card art were generated from the exact user-selected reference with the built-in image generator. Responsive WebP assets live in `app/public/images/`.

The 84 daily reading assignments and companion questions come from the user's `12_Weeks_Through_the_Bible_84_Day_Challenge.pdf`. Weekly titles match the actual assigned chapters. A regression test verifies all 1,189 chapters across 66 books, in order, without gaps or duplicates.

- `/journey/` lists every week and day; `/journey/:day/` opens Read, Listen and Reflect.
- Full readings open Bible Gateway's KJV passage. Browser speech reads a clearly labeled short overview, not the full text or a promised ten-minute recording.
- Completed days stay on the device under `elroi-autumn-2026-v1`, separately from the existing seven-day reflection progress. Storage failures are shown and keep the visit usable.
- A reading's call action pre-fills the existing scheduling form with its passage. It does not create or consent to a recurring 84-call schedule.
- Existing account, call, reflection, gift and dashboard routes remain available through navigation.

## Seasonal presentation and the ElroiCall foundation

`app/src/lib/seasonal-experience.ts` owns the dated campaign. Its preview begins September 22, 2026. The October 1–December 31 campaign ends at midnight on January 1, 2027 in America/New_York. Set `enabled` to false to end it early. The provider rechecks the date every minute and when the window regains focus.

The homepage always renders the original ElroiCall components in their original order: personal conversation entry, Call Journeys, daily reflections, call formats, and the other existing services. The fall class changes only the public hero and header appearance. A compact, optional promotion appears after Call Journeys and opens `/bible-challenge/`. The promotion does not replace the service homepage. After expiry, the visual layer and promotion disappear; `/bible-challenge/` redirects to the permanently available readings.

The member dashboard remains exactly as before: Overview, Scheduled calls, Saved notes, Call history and Preferences, including nickname/PIN, phone setup and the existing scheduling-service availability notice. No dashboard, authentication, consent, calling, private notes, or backend source was changed.

The `/journey/` routes, all 84 assignments, passage handoff and the existing `elroi-autumn-2026-v1` progress key remain available. The journey adopts the foundation navigation and a neutral reading surface outside the season. Homepage and static social metadata represent ElroiCall year-round; campaign metadata belongs only to the optional challenge page.

## Scripture-led artwork

`app/src/lib/reading-artwork.ts` maps every reading day to a specific title, image and chapter within its assignment. Art is selected by the reader’s day, never by the seasonal date. Each caption names its Scripture reference and describes the image as Scripture-inspired artwork. Images illustrate a scene or theme within the full assigned reading; they are not archaeological reconstructions or a claim to picture every chapter.

There are 28 scenes, including 26 new standalone images made with the built-in image generator and 2 existing approved scenes. Related readings may share an appropriate scene. Assets live in `app/public/images/readings/`, as 1280px and 640px WebP variants. Each new prompt specified its biblical subject, cinematic natural light, realistic textures, a wide 16:9 frame, and no interface, lettering or modern objects. Full scene briefs are in `docs/READING_ART_PROMPTS.md`.

The optional challenge page’s reading card uses the first unfinished day on that browser; each daily page shows its matching image and title. Weekly highlight cards use Scripture scenes. The autumn valley is decorative seasonal scenery only; it never selects a day’s Scripture artwork.

A validation test checks all 84 art references against their assigned chapters, both image sizes, and the campaign date boundaries, including the Eastern-time cutoff. The original chapter-coverage, progress and scheduling tests remain in place.

The October 1–December 31 window has 92 calendar days: 84 reading days plus 8 flexible days. Readers may begin at any time; progress is explicit, not inferred from the calendar.
