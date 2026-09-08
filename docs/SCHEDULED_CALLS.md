# Scheduled Bible learning calls

This is an additional service. The inbound El Roi telephone number, on-demand reflection, existing account verification, and legacy journeys continue to use their existing contracts. No incoming-number webhook is changed. No existing ElevenLabs configuration is removed.

## What is implemented

`/schedule/` provides Bible study, sermon, Bible lecture, biblical story, and Bible facts. The caller explicitly selects the content and a topic or passage, then selects Marin, Cedar, Coral, or Onyx. They choose an exact local minute, an IANA time zone, a one-time date or selected recurring weekdays, and an approximate 5, 10, or 15 minute duration. The flow uses the existing Supabase email authentication and the verified phone returned by the existing authenticated portal. A browser cannot select someone else's destination by modifying the request.

The new function `scheduled-calls` owns separate `lesson_schedules`, `lesson_jobs`, `lesson_runtime`, and `lesson_rate_limits` tables. The service checks the user's access token with Supabase Auth and scopes every account operation to that verified user. Tables and RPCs are unavailable directly to browser roles. Privileged server requests use the service role; SQL functions run as their invoker and have explicit execution grants.

A saved plan must receive a real server ID and next-call timestamp before the website confirms it. Retry keys prevent repeated network submissions from creating duplicate plans. Up to five active plans per account are supported. Nearby calls are rejected on creation, and the delivery dispatcher prevents overlapping calls to the same account. Pausing a plan cancels its queued preparation and playback jobs; a call already being placed might still ring, but playback checks the pause again before speaking.

## OpenAI speech replaces ElevenLabs in this new path

The lesson worker creates an original narration with OpenAI Responses (`gpt-4.1-mini`, configurable), splits it into bounded text chunks, and renders it with `gpt-4o-mini-tts` in the selected voice. The topic is passed as untrusted data. Format-specific instructions require Scripture references, distinguish interpretation from fact, prefer labeled paraphrase, avoid invented dialogue, and do not impersonate real people or biblical figures. Recent lesson titles are included to encourage variation. References appear with the last call in the schedule page. Automated checks validate output structure, reference presence, and length; these do not replace a theological/content-quality review.

Audio is generated before the due time and stored in a private Supabase Storage bucket. Twilio places the outbound phone call and plays short-lived signed audio URLs. Twilio is still necessary for the telephone connection; OpenAI provides the narrated voice. No ElevenLabs API is used for scheduled lessons.

These are narrated lessons, not interactive Realtime conversations. The greeting discloses the AI voice and asks the listener to press 1 to begin. Silence ends the call, avoiding delivery of a full lesson to voicemail. Pressing 9 during a greeting or lesson pauses that schedule. The service does not record scheduled calls. A separate, tested migration is required before replacing the existing on-demand voice stack with OpenAI Realtime.

## Time and delivery behavior

- PostgreSQL computes future occurrences in the selected time zone; daylight-saving changes do not turn a fixed local hour into a fixed UTC hour.
- Nonexistent local times during spring-forward are skipped. A one-time nonexistent time is rejected. During fall-back, PostgreSQL chooses the standard-time occurrence; it runs once.
- Bookings need at least 20 minutes of preparation time. A recurring time too close to now advances to its next eligible day, shown in the confirmation.
- Separate minute cron jobs prepare audio and deliver ready calls. Readiness requires fresh heartbeats from both jobs, valid required configuration, and `SCHEDULED_CALLS_ENABLED=true`.
- Atomic row locks, occurrence uniqueness, and delivery reservations prevent duplicate jobs and duplicate dialing from repeated ticks.
- A prepared call may begin within the two-minute delivery window. Unprepared or stale calls are marked missed instead of ringing much later.
- Preparation errors may retry within a bounded budget. An ambiguous Twilio create-call result is marked uncertain and is never automatically redialed. Reconcile such cases against Twilio call logs before retrying manually.
- Initial workers are bounded: two preparation jobs per tick, up to three audio chunks concurrently per job, and three deliveries per tick. Monitor queue age and missed jobs, and increase dispatch capacity before broader launch. Calls with different recurring patterns can eventually overlap even when their first occurrences do not; delivery suppresses overlaps rather than ringing twice.

## Production activation

The website can deploy independently. It shows an explicit availability message and cannot confirm bookings while the new backend is unavailable. Existing incoming calls continue as before.

1. In project `mkocnufwmsfchivfbhuf`, inspect the current portal's `/me` and phone-verification implementation. Confirm it returns the authenticated user's canonical E.164 `phone` and a server-enforced `phone_verified` boolean. Verify the existing member account and email redirect allowlist includes `https://elroicall.com/schedule/`.
2. Apply the reviewed additive SQL in `supabase/migrations/202609080001_scheduled_lessons.sql`. It creates private tables/RPCs and the private `scheduled-call-audio` bucket. Do not run unrelated migrations or replace existing functions.
3. Deploy only `supabase/functions/scheduled-calls/index.ts` and its imports. The function config sets `verify_jwt=false` because authenticated member routes, signed Twilio callbacks, and secret-authenticated cron routes have different credentials. Each route validates its own credential; disabling the platform JWT check does not make schedule mutations public.
4. Configure the server values in `supabase/functions/.env.example`, initially keeping `SCHEDULED_CALLS_ENABLED=false`. Reuse verified existing OpenAI/Twilio secrets where their names and purpose match. Never export them to the frontend or repository. `TWILIO_FROM_NUMBER` must be the authorized caller ID; keep its incoming-call handler intact.
5. Create Vault entries named `elroi_supabase_url` and `elroi_scheduler_secret`, with the latter matching the function's `SCHEDULER_SECRET`. Apply `supabase/enable-scheduled-call-cron.sql`. Confirm both named jobs and their HTTP results succeed.
6. Use a controlled staging project or an explicitly consenting test account/phone to verify sign-in, phone ownership, a voice preview, a one-time call, press-1 playback, press-9 opt-out, status callbacks, and references. Match a recording-free call's actual audio and duration against each format. Confirm account deletion removes queued schedules. Check Supabase security advisors and queue metrics.
7. Enable `SCHEDULED_CALLS_ENABLED=true` only after configuration and the controlled call test pass. Verify `/capabilities` returns `ready:true` and that an authenticated booking returns a server-generated next-run timestamp. If credentials, cron, or the phone contract are not available, retain the disabled state.

Before broad production use, define and implement a retention policy for generated scripts/audio and historical delivery metadata. No automated purge is claimed by this change. Confirm paid-call entitlements/pricing separately; the scheduler does not charge a card or create a Stripe subscription.

## Verification

`cd app && npm test` exercises the existing network/phone behavior plus schedule validation, authentication, readiness, verified destinations, selected OpenAI voices, Twilio request construction, signed callbacks, and no automatic retries after an uncertain call result.

`cd supabase/tests && npm ci --ignore-scripts && npm test` applies the full migration in PGlite PostgreSQL with isolated Auth/Storage schema fixtures. It checks real time-zone conversion, DST gaps and folds, idempotency, nearby calls, repeated cron ticks, owner-scoped pausing, overlapping delivery, missed windows, bounded preparation retries, private table/RPC access, and rate limits.

The production CI runs these suites, frontend lint/typecheck/build, and a separate backend TypeScript check. Provider calls in automated tests are synthetic. A passing suite is not proof that production keys, email delivery, or telephone routing are configured.

## Sources

- [OpenAI speech generation and voices](https://developers.openai.com/api/docs/guides/text-to-speech)
- [OpenAI speech API request schema](https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create)
- [Twilio outbound call resource](https://www.twilio.com/docs/voice/api/call-resource)
- [Twilio Gather with audio playback](https://www.twilio.com/docs/voice/twiml/gather)
- [Twilio webhook verification](https://www.twilio.com/docs/usage/webhooks/webhooks-security)
- [Supabase scheduled functions and Vault](https://supabase.com/docs/guides/functions/schedule-functions)
