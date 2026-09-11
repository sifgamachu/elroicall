# Nickname, calling PIN, and call limits

Release 11 September 2026. The database migration is applied; `call-access` version 1 and guarded `scheduled-calls` version 4 are deployed. The dashboard and `call-access` profile API support nickname and six-digit PIN setup/reset. Phone enforcement remains off in `calling_security_settings` until the secure voice deployment and provider configuration are complete. The website explicitly reports this pending state.

## Member experience

- Preferences → Your nickname & calling PIN. Names need not be globally unique. PINs have exactly six digits, including leading zeroes; obvious repeated or sequential values are rejected. The PIN is separate from email/SMS website sign-in and from a one-time Saved notes code.
- A signed-in account can set or reset its own PIN. Calling also requires the account's verified number. A reset replaces the hash and invalidates existing calling grants.
- With phone enforcement active, a first guest hears a ten-minute budget and the notice that signup, a verified calling number, nickname and PIN are required before the second call. Pressing 1 accepts the first guest call. Prior legacy call history counts as a previous call. Signup does not itself purchase a subscription.
- Returning members hear their selected 5/10/15-minute budget and enter their PIN with the phone keypad. Scheduled learning calls use the schedule's duration. The nickname and personal context are used only after successful verification. An unprepared account receives dashboard setup instructions.
- Three wrong entries end that call's verification. Five failures across calls lock the identity for 15 minutes. A signed-in dashboard reset clears the lock. Silence does not admit a caller. Unknown or unavailable verification ends the call without loading personal context.

## Security and duration

`call-access` validates the bearer token with Supabase Auth on each request and derives ownership from that response. It accepts only explicit confirmed saves with a current revision. Credential tables and RPCs are service-only with RLS and explicit grants. Hashes, salts and PINs are never returned to the browser.

PIN storage uses PBKDF2-SHA256 (210,000 iterations), a random 128-bit salt, account ID and the existing server-held service-role key as a pepper. Rotating that key requires users to reset their PIN; this dependency must be considered during key rotation. No PIN is logged by this code, inserted into model messages, or sent in a callback URL. Twilio receives keypad digits in the signed webhook and may retain them in provider operational records. Do not log webhook bodies.

The shared guard verifies Twilio's signed URL/form and retrieves the live Call resource to check account, CallSID, direction, from/to numbers and status. Each admission binds to one call, current phone ownership and PIN revision. A random relay token protects WebSocket setup; transfers and reconnects retain the same deadline. Subsequent model turns and a 15-second quiet-call check revalidate access. The carrier's Call `TimeLimit` enforces the duration even if the socket disconnects. ConversationRelay emits a one-minute reminder and stops at expiry. Narrated lessons enforce the same deadline before each audio segment.

Temporary admission rows are removed by hourly cleanup after expiry plus one day. A used first-guest pass retains a hash of the number and CallSID to enforce the one-guest-call rule. Account deletion cascades the PIN and member admission rows. One-time phone ownership/booking confirmation calls remain separate verification flows; this PIN guard protects conversations and narrated lessons.

## Deployment and activation

1. Apply `20260911022309_caller_identity.sql`. Keep `calling_security_settings.enabled=false` during preparation.
2. Deploy `call-access` with `index.ts`, `service.ts`, `deno.json`, and shared `call-identity.ts`, `providers.ts`, `scheduling.ts`. The function implements its own Auth validation; platform `verify_jwt=false` permits CORS preflight while unauthenticated data requests return 401.
3. Deploy the updated `scheduled-calls` with shared `call-guard.ts` and `call-identity.ts` alongside its existing dependencies. This does not enable outbound delivery.
4. In Supabase Functions Secrets, ensure the existing `VOICE_ROUTE_TOKEN`, `ANTHROPIC_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` are configured. The current legacy voice source contains embedded credentials: never commit or redeploy those constants. Credential entry must happen in the provider's secure interface, not chat.
5. Retrieve the current native `voice` source and apply `patchVoiceScheduling`, then `patchVoiceContinuity`, then `patchVoiceCallingIdentity`. Each rejects changed anchors. Include `voice/phone-scheduling.ts`, `voice/continuity.ts`, shared `call-guard.ts`, `call-identity.ts`, `providers.ts`, and `scheduling.ts`. The safe candidate uses environment variables exclusively. Typecheck against the Deno runtime before native deployment. Preserve the existing route token and Twilio webhook configuration.
6. Enable `calling_security_settings.enabled=true` only after the safe guide is deployed. Then conduct an explicitly authorized real-number test of first call, repeat call, correct/incorrect PIN, timeout and selected duration. No production calls, messages or guest-pass claims were made while developing this release. Update the pending activation copy in the privacy page after activation.

The existing phone service is still version 27 pending credential configuration. The previously rejected deployment embedded live keys; this adapter avoids that approach. Browser management is currently signed out, and the Supabase connector has no secret-management operation. `PHONE_BOOKING_VOICE_ENABLED`, `VOICE_CONTINUITY_ENABLED`, scheduled delivery, OpenAI narration credentials, and SMS Auth remain separate activation tasks documented in `PHONE_SCHEDULING.md` and `AUTH_SIGN_IN.md`.

## Verification

79 application tests and 58 PostgreSQL tests pass. Application and PostgreSQL tests cover authenticated ownership, hashed storage, stale saves, first-guest admission, repeat-call signup, keypad-only verification, invalid signatures and call metadata, retry/lockout limits, revoked phones/PINs, cross-call replay, fixed deadlines, provider-limit failure, schedule binding, deletion and browser-role denial. The credential-free legacy candidate is typechecked separately without deploying or persisting its original embedded keys.

Provider references: [Twilio Call update and TimeLimit](https://www.twilio.com/docs/voice/api/call-resource), [Twilio keypad Gather](https://www.twilio.com/docs/voice/twiml/gather), [Supabase function authentication](https://supabase.com/docs/guides/functions/auth-headers).
