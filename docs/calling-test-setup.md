# Receiving-number verification and connection tests

## The user's path

The Account & phone step contains a visible receiving-number input. Enter the user's phone, never the public El Roi number. Obtain explicit permission for one verification test call. The temporary spoken code verifies ownership; it is not the permanent calling PIN. A number is not marked verified until the existing server-side code verification succeeds.

After verification, an optional short connection test uses only the verified account number. It is capped at 35 seconds with recording disabled and uses a neutral system voice, not the selected lesson voice. It neither creates nor modifies lesson schedules. The UI distinguishes a provider-accepted request from confirmed delivery; it never claims the user answered. Tests and verification do not bypass the final lesson consent screen.

## Why calling can be unavailable

The portal requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER in the project's production Edge Function secrets. The existing entrypoint fallback for the public caller is +18556197337. Do not insert a receiving phone into TWILIO_FROM_NUMBER. The caller must belong to the configured Twilio account and support voice. Do not commit secrets or enter them in chat.

Manage secrets at https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/functions/secrets . Provider credentials must be added by an authorized project owner using the provider console and the secure secrets screen. Merely adding an input or setting a ready flag does not configure calling.

The authenticated /portal/me response includes verify_ready, test_call_ready and verify_unavailable_reason. /portal/capabilities returns only configuration-presence booleans, never credential values or personal data. Keep the gateway's existing verify_jwt=true setting. Presence checks do not verify credential validity, provider balance or delivery permissions.

## Safety and limits

- /test-call is authenticated using Auth's /user endpoint and requires a verified portal account plus explicit consent.
- The body contains only consent and a UUID-v4 request_id. Attempts to supply a receiving phone, another user ID, custom TwiML, or a lesson are rejected.
- The current verified phone is re-read immediately before the request; changes are rejected rather than silently substituted.
- The existing database rate limiter caps tests at three per user and receiving number per clock hour. A request ID is accepted at most once within that same hourly window, not an indefinite idempotency guarantee.
- There is no automatic redial on timeout, provider 5xx, invalid response, or uncertain delivery. The UI imposes a cooldown and requires a new explicit user action for another test.
- Verification codes stay hashed in storage. Public responses never expose codes, provider credentials or TwiML.

## Separate lesson readiness

Passing a connection test does not make the lesson scheduler ready. AI speech/content configuration, scheduled-call enablement and healthy preparation/delivery workers must also pass their existing readiness checks. A connection test is not a substitute for an end-to-end lesson test.

## Acceptance checks

Use an owner-authorized receiving number. Enter and verify it on the website; optionally request one short connection test. Confirm the physical phone rings and the audio is heard. Set the permanent calling PIN if required. Return to review the topic, chosen voice, duration, time zone and a real future date/time before booking. Verify the saved booking and actual delivered lesson separately. Never mark a test as physically delivered based only on an HTTP success.

Reference: https://supabase.com/docs/guides/functions/secrets
Reference: https://www.twilio.com/docs/voice/api/call-resource
