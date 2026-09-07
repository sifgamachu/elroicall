# OpenAI Voice Migration Plan

## Decision

V2 should target one OpenAI Realtime guide rather than a separate LLM + speech-to-text + voice-synthesis chain.

## Target live call

```text
1-855-619-SEES
  → Twilio SIP trunk
  → OpenAI Realtime SIP endpoint
  → realtime.call.incoming webhook
  → El Roi API verifies call and configures session
  → gpt-realtime-2.1 + brand voice + guide instructions + tools
```

## Required backend work

1. Import existing Twilio configuration into version control (without secrets).
2. Configure Twilio Elastic SIP Trunking for the El Roi number.
3. Configure an OpenAI project webhook for `realtime.call.incoming`.
4. Verify OpenAI webhook signatures.
5. Accept/reject calls server-side based on supported geography, abuse controls, and entitlement.
6. Configure the session before audio starts:
   - `gpt-realtime-2.1`
   - selected brand voice (`marin` candidate, `cedar` alternative)
   - El Roi Guide stored prompt/version
   - scenario variables
   - approved tools
   - safety policy
7. Open a server-side control connection to monitor events and handle tools.
8. Implement privacy-safe post-call summary behavior.
9. Implement outbound scheduled calls and opt-out suppression.
10. Red-team crisis, impersonation, divine-revelation, and medical scenarios before enabling production traffic.

## Tools the live guide is expected to call

- `get_intake_context`
- `get_story_packet`
- `get_user_memory` (only if memory enabled)
- `save_structured_summary` (only if permitted)
- `mark_journey_progress`
- `schedule_next_call`
- `cancel_scheduled_calls`
- `get_crisis_resources`
- `end_session`

Tools should return structured data; they should not expose unrestricted database access to the voice model.

## Generated website voice previews

Use OpenAI Speech (`gpt-4o-mini-tts`) to generate bounded preview clips from approved scripts. Use the same brand voice where supported and provide explicit instructions for pace/tone.

Previews must visibly disclose that the audio is AI-generated.

## Provider cleanup after successful migration

Do not remove an existing production provider until the replacement passes real end-to-end call tests. Once the OpenAI path is validated, remove unused conversation-path dependencies and update Privacy/Terms to exactly match the providers actually processing user data.
