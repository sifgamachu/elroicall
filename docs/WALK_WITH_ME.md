# Walk With Me — accountability without judgment

Walk With Me is an opt-in ELROICALL mobile feature that helps a person remember goals they chose for themselves. It is not a parental-control feature, a morality classifier, or content surveillance.

## Product contract

- The user must turn Walk With Me on.
- The user chooses which supported apps they want help with.
- The user chooses a daily usage goal for each selected app.
- ELROICALL does not label an app, song, video, creator, website, or person as good or bad.
- Reminder copy refers back to the user's own intention.
- "Continue anyway" always remains available.
- A user can turn Walk With Me off or make it quiet for the rest of the day.
- The first Android version sends at most one background Walk With Me notification per local calendar day.
- Background reminders are deliberately low priority and silent.
- The feature does not read messages, photos, audio, search terms, browsing content, video titles, or the content inside another app.
- Usage totals and goals remain device-local in this first version. They are not uploaded into the ELROICALL account database.

## Reset choices

A gentle check-in should lead somewhere useful rather than simply blocking behavior. Current reset paths can include:

- Bible Cinema
- today's Bible study / Scripture reading
- a quiet prayer or written reflection
- Talk with El Roi
- continue without changing anything

Future integrations such as worship playlists must use explicit user authorization and provider-supported APIs rather than cross-app scraping.

## Android implementation

Android uses `UsageStatsManager` only after the device owner grants Usage Access in system settings. Selected package names and goal minutes are copied from the web layer into app-private Android preferences.

When Walk With Me is enabled, Android WorkManager performs a periodic local check. Android controls the exact execution time; this is not real-time or continuous tracking. If a selected app has reached the user's goal, the worker may create one quiet notification for that day. Tapping it opens `/app/walk/?checkin=1`.

Android 13+ also requires explicit notification permission. No background reminder should be described as active until both Usage Access and notification permission are available.

## iPhone and iPad

The shared Walk With Me product interface is present, but iOS activity monitoring must not be presented as active until the Apple Family Controls / Screen Time entitlement and native DeviceActivity implementation are configured and approved. The app must preserve Apple's privacy-preserving selection model instead of attempting to identify or scrape activity through unsupported means.

## Safety and tone

Allowed examples:

- "You wanted to make a little more room for Scripture."
- "Still doing what you came here for?"
- "Want to switch gears?"
- "Keep going, or choose a reset."

Avoid:

- "You failed."
- "This app is bad."
- "You are wasting your life."
- "This is sinful."
- "You promised God."
- language that shames, diagnoses, threatens, or claims spiritual authority over the user.

## Release verification

Before release:

1. Verify Android Usage Access denial and approval paths on a physical device.
2. Verify Android 13+ notification denial, approval, and settings changes.
3. Confirm the worker does not notify more than once per local day.
4. Confirm disabling Walk With Me cancels periodic work.
5. Confirm "not again today" suppresses both in-app and native reminders.
6. Confirm a notification tap opens the Reset now experience.
7. Confirm selected usage data never appears in network requests or Supabase.
8. Test timezone/day rollover behavior.
9. Complete a separate iOS entitlement review before enabling Screen Time behavior.
