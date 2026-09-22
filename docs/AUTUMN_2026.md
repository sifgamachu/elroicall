# Autumn 2026 experience

The homepage and `/journey/` use the approved emerald-and-gold autumn design. Standalone background and card art were generated from the exact user-selected reference with the built-in image generator. Responsive WebP assets live in `app/public/images/`.

The 84 daily reading assignments and companion questions come from the user's `12_Weeks_Through_the_Bible_84_Day_Challenge.pdf`. Weekly titles match the actual assigned chapters. A regression test verifies all 1,189 chapters across 66 books, in order, without gaps or duplicates.

- `/journey/` lists every week and day; `/journey/:day/` opens Read, Listen and Reflect.
- Full readings open Bible Gateway's KJV passage. Browser speech reads a clearly labeled short overview, not the full text or a promised ten-minute recording.
- Completed days stay on the device under `elroi-autumn-2026-v1`, separately from the existing seven-day reflection progress. Storage failures are shown and keep the visit usable.
- A reading's call action pre-fills the existing scheduling form with its passage. It does not create or consent to a recurring 84-call schedule.
- Existing account, call, reflection, gift and dashboard routes remain available through navigation.

## Seasonal switch

`AUTUMN_HOME_ENABLED` in `app/src/lib/autumn-readings.ts` selects the autumn homepage. Set it to false to restore the previous homepage; its source remains in `Home.tsx`. This is an explicit editorial switch, with no automatic expiry that could interrupt a reader. Update static home metadata in `app/index.html` with the next season. The reading routes and saved device progress can remain available after the homepage changes.

The October 1–December 31 window has 92 calendar days: 84 reading days plus 8 flexible days. Visitors can begin at any time; day completion is explicit, not inferred from the calendar.
