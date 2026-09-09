# Member-controlled continuity

This release adds private Saved notes to the dashboard and “Continue in writing” to saved notes and existing conversation summaries. The web flow works without activating a new voice provider. Users review and consent to submitting the resulting draft through the existing reflection flow. The note title and body never enter a URL, localStorage, sessionStorage, analytics, or an automatic AI extraction process.

## Member experience

- Saved notes start off. Turning them on and saving each note are explicit member actions.
- A member can keep up to 40 reflection, Scripture, or prayer notes, with an 80-character title and 1,200-character body.
- Notes can be edited, paused, individually removed, or cleared together. Clearing also switches saved notes off.
- The overview offers the most recently updated note as a place to continue. The full workspace lets the member add what changed today before reviewing the next reflection.
- Past call summaries can be explicitly brought into a new writing draft without creating a saved note.
- Private continuation drafts stay in React memory and are cleared when the owning account signs out or changes. Reloading clears them.
- Unsaved editor changes require a choice before opening another note. Concurrent screens use a revision check, so an old form cannot silently replace or erase newer notes.

## Backend and data boundaries

`continuity` revalidates member access tokens through Supabase Auth. Server code supplies the owner to all database operations; submitted owner IDs have no authority. All tables have RLS and explicit service-role policies and grants. Browser database roles cannot access tables or execute these privileged RPCs. Every RPC uses security invoker and a fixed search path.

The snapshot exposes only the requesting member’s notes. Save, pause, remove, clear, and token issue operations serialize per member. Note updates additionally restrict their conflict handler to the same owner. Account deletion cascades settings, notes, and handoffs.

Pausing, changing, or deleting a note revokes relevant handoffs. Deletion removes the saved-note copy, not earlier recordings, submitted reflections, or conversation history. The UI states that distinction. No note bodies, handoff codes, or provider responses are logged by the new service.

## Phone continuation: prepared, not active

The incoming phone guide remains version 27. Its update was previously rejected by automatic approval review because its legacy source embeds credentials. This release does not retry that unsafe deployment or change the live guide.

After configuring the secure environment values described in `PHONE_SCHEDULING.md`, apply `patchVoiceScheduling` and then `patchVoiceContinuity` in memory to the current native voice source. The first patch removes embedded credentials. Include both `supabase/functions/voice/phone-scheduling.ts` and `supabase/functions/voice/continuity.ts` in that deployment. Only then set `VOICE_CONTINUITY_ENABLED=true` in Supabase Functions Secrets. That flag remains off by default, and the dashboard disables phone handoff while unavailable.

When activated, the member selects one note and explicitly authorizes phone sharing. A six-digit code is shown for 10 minutes; only its hash is stored. A new code replaces the member’s previous code. The member calls from the verified number and gives the code to the guide. The backend verifies the live call with Twilio, validates the number against the member’s current verified number, limits guesses, and binds the code to exactly one call. A redeemed grant lasts at most 30 minutes. Hourly cleanup removes expired handoffs.

The guide retrieves fresh context on subsequent turns. A pause, deletion, edit, number change, or expired grant removes access. Notes are injected as untrusted context, not as instructions or conversational messages. The adapter removes the code-bearing user message from stored session messages when handling the handoff tool. The existing phone service still records calls; that is disclosed before generating a handoff code. Information already discussed may remain in that call’s record.

## Validation and remaining activation work

New application tests cover authentication, owner binding, consent, paused notes, phone feature gating, hashed codes, provider-derived destinations, attempt limits, and context revocation. PostgreSQL tests cover default-off behavior, isolation, concurrency, deletion, account cascades, one-call binding, expiry, and all revocation paths. The combined secure voice source and both adapters typecheck without deploying the guide.

The hosted email redirect was corrected and verified on 9 September 2026; see `AUTH_SIGN_IN.md`. Production SMTP and SMS provider configuration remain separate activation tasks. Outbound phone scheduling still needs provider configuration and guide activation. These are separate from the working saved-note dashboard feature. No real email, SMS, or phone call is sent as part of this release.
