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

## Deployment status — 8 September 2026

The two migrations, `scheduled-calls`, and the secured member `portal` are deployed to `mkocnufwmsfchivfbhuf`. Both minute cron jobs are installed and report fresh heartbeats. The incoming `voice` function and its Twilio incoming-number configuration were not modified.

The dashboard at `/account/` (also `/dashboard/`) integrates legacy journeys with the new learning plans, account-scoped history, saved preferences, and phone verification. Preferences can be saved even while outbound calls are disabled. The planner applies these defaults to a new plan, and a paused/completed plan can be used as the starting point for a new booking. The dashboard reports finished lessons only when playback reached the end. It does not equate a completed telephone connection with a completed lesson.

Production reports `ready:false`, `voice_ready:false`, and `phone_ready:false`. The active function lacks OpenAI speech configuration and a complete outbound Twilio credential pair. Incoming calls use the existing provider arrangement and are independent of these new secrets. No voice sample or real outbound call has been verified.

### Remaining activation

1. In [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/functions/secrets), set `OPENAI_API_KEY`, `TWILIO_ACCOUNT_SID`, and `TWILIO_AUTH_TOKEN` with the project's authorized provider credentials. Set `TWILIO_FROM_NUMBER` if it differs from the existing `+18556197337` number. Secrets never belong in the browser or this repository.
2. Verify provider account access, a real voice sample, email sign-in, and the explicitly requested phone-verification call through the dashboard. The hosted Auth redirect currently falls back to localhost; apply the URL/template settings in [AUTH_SIGN_IN.md](AUTH_SIGN_IN.md). Email-link recovery and an email/phone sign-in selector are implemented. Auth SMS configuration is separate from outbound calling credentials.
3. Enable the new scheduler by updating the single row in `public.lesson_service_settings` to `enabled=true` through an authorized database connection, or by setting `SCHEDULED_CALLS_ENABLED=true` in Edge Function secrets. Configuration is cached for up to 15 seconds. Both provider configuration and fresh worker heartbeats remain required before booking opens.
4. With a consenting test member, book a one-time call and verify the selected voice/content, press 1, press 9, status callbacks, timing, and reference display. The service reserves 20 minutes for lesson preparation. Until this happens, do not represent real telephone delivery as tested.

### Cron authorization

`configure-scheduled-call-cron.sql` generates a random token directly inside Vault and stores only its SHA-256 digest in the service-only settings table. The minute jobs read the token from Vault; the Edge Function validates its digest. The token is never returned to this workspace or committed to source. An explicit `SCHEDULER_SECRET` environment value remains supported, but must match the Vault token if used. `enabled` remains false until the remaining provider checks pass. Existing `elroi_dialer` and `prayer_cleanup` jobs are untouched.

### Member privacy and verification

The portal now validates each access token with Supabase Auth. Call history and legacy schedules are read only after phone verification. Verification uses a cryptographically generated six-digit code, stores a hash, expires after ten minutes, and permits five attempts. Requests are rate-limited per account and destination. Linking a replacement number retains the current verified number until confirmation; confirming a different number atomically pauses earlier plans and old-number journeys. The dispatcher rechecks current phone ownership immediately before dialing.

The portal, preferences, service settings, and lesson tables have RLS enabled and no direct `anon` or `authenticated` table grants. Their invoker SQL functions are executable only by `service_role`, with account IDs supplied from validated server authentication. No user-editable JWT metadata authorizes access. The original `/portal/schedule` creation form is retired in favor of the single planner; existing recurring journeys remain listed and can be paused.

### Verified and not verified

- 34 application/provider tests and 22 PostgreSQL tests pass, covering validation, authentication, cross-account isolation, code limits, replacement-number behavior, idempotency, DST, preparation leases and call deduplication.
- Frontend lint, type checking, production build, and backend type checking pass.
- Live database checks confirm RLS and denied direct browser access; minute cron workers report fresh heartbeats; unauthenticated API checks are performed without exposing member data.
- After explicit owner authorization, 17 live checks passed using two temporary synthetic accounts: password sessions, authenticated portal/dashboard access, saved preferences, isolation when a request supplies another account's ID, denied direct table access, validation, unavailable-service errors, and sign-out. The fixture passwords were hashed before database insertion. Both accounts, identities, sessions, saved preferences, and rate-limit fixtures were removed, with zero remaining rows confirmed. No emails or calls were sent.
- These live API checks confirm authenticated account behavior. Email magic-link delivery, signed-in browser rendering, voice generation, and real phone delivery are still unverified. Email authentication and new registrations are enabled, with email confirmation required.
- Supabase advisors report no new security errors. Existing warnings remain for [pg_net in the public schema](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public) and [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Service-only RLS tables intentionally have no browser policies.

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
