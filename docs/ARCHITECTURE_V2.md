# El Roi Call V2 — Target Architecture

## Product goal

Preserve the idea and rebuild everything around it:

**A person calls because they are carrying something real. One recognizable AI guide listens, opens a relevant biblical story, reflects with them, and can pray with them.**

Biblical figures are witnesses and stories — not AI characters. The caller builds familiarity with **El Roi Guide**, not a cast of synthetic personalities.

The guiding user journey is:

1. I am carrying something real.
2. El Roi Guide helps me say it without forcing a category.
3. The guide opens a biblical story that can help me reflect.
4. We talk about my life, Scripture, and what the story raises.
5. I may pray, stop, return later, begin a journey, or schedule another conversation.

## Target provider stack

Keep the system intentionally small:

```text
Cloudflare
  web application + edge delivery

Supabase
  identity + user data + journeys + consent + minimal conversation memory

Twilio
  phone number + SIP trunking + outbound call initiation

OpenAI Realtime
  live speech-to-speech El Roi Guide
  reasoning + voice + tool calls + conversation state

OpenAI Speech
  generated website previews / bounded narration where live conversation is not needed

Stripe
  billing only when recurring membership is enabled
```

### Why simplify

The current privacy policy names a multi-provider conversation chain. The V2 target removes the need to independently coordinate an LLM, speech-to-text provider, and text-to-speech provider for the core phone conversation.

For live calls, target **OpenAI `gpt-realtime-2.1`** with one brand voice. Initial voice candidate: **`marin`**, auditioned against **`cedar`** before launch. Voice identity remains constant across scenarios; scenario instructions change pacing, emotional range, and tone.

For website samples or generated audio, target **`gpt-4o-mini-tts`**, using the same selected brand voice when supported and explicit delivery instructions.

## Phone architecture

Target inbound flow:

```text
Caller
  ↓
1-855-619-SEES
  ↓
Twilio SIP trunk
  ↓
OpenAI Realtime SIP endpoint
  ↓
realtime.call.incoming webhook
  ↓
El Roi API verifies + accepts/rejects call
  ↓
Realtime session configured with:
  - El Roi Guide prompt
  - one brand voice
  - scenario context (if known)
  - safety contract
  - approved tools
  ↓
Live speech-to-speech conversation
```

A server-side control connection monitors the live call, receives tool calls/events, writes minimal state, and can terminate or redirect behavior when required by safety policy.

Target outbound flow:

```text
scheduled conversation
  ↓
El Roi scheduler
  ↓
Twilio outbound call / SIP leg
  ↓
OpenAI Realtime session
  ↓
El Roi Guide
```

The exact outbound topology should be finalized when the existing Twilio production configuration is brought into version control.

## Target repository shape

```text
apps/
  web/                public site, intake, gift, portal
  api/                webhook + orchestration + tools

packages/
  ui/                 shared design system
  biblical-content/   reviewed stories, references, themes
  guide/              El Roi Guide prompt + scenario voice behavior
  safety/             boundaries + crisis override
  types/              API and event contracts
  analytics/          privacy-safe event definitions

supabase/
  migrations/
  functions/
  policies/
  seed/

infra/
  cloudflare/
  twilio/
  openai/
  monitoring/

tests/
  unit/
  integration/
  e2e/
  call-scenarios/

docs/
  architecture/
  safety/
  content/
  privacy/
```

## Domain boundaries

### Identity

Authentication, profile, phone verification, preferences, consent history, memory preference.

### Intake

Burden submission, reflection, safety screening, story recommendation, and free-call entitlement.

### Biblical content

Reviewed story packets, scriptural references, themes, direct quotations, interpretive notes, theological boundaries, and content versions.

No first-person synthetic roleplay is required. Story packets should be designed for the guide to narrate in third person and discuss with the caller.

### El Roi Guide

Owns:

- one consistent voice identity
- conversation style
- scenario-specific delivery (grief/fear/shame/etc.)
- story selection/orchestration
- question-asking behavior
- prayer behavior
- tool use
- memory boundaries

See `app/contracts/voice.ts` and `app/contracts/safety.ts` during migration.

### Calling

Inbound/outbound calls, schedules, SIP status, retries, consent gates, and opt-out suppression.

### Journey

Tracks, Bible progress, chapters, scheduled content, completion state, and continuity with the same guide.

### Gift

Gift creation, redemption tokens, expiration, recipient claim, and abuse controls.

### Prayer Well

Anonymous prayer submission, insert-only access, TTL deletion, abuse controls, and deletion verification.

### Billing

Trial state, subscriptions, invoices, cancellations, entitlements, and provider webhooks.

## Voice behavior

Same voice, different delivery — never different identities.

```text
grief       slower, lower energy, more silence
fear        steady, grounded, clear
shame       nonjudgmental, dignifying, accountable
burnout     spacious, fewer words, no extra demands
waiting     comfortable with uncertainty
calling     curious, clarifying, never claiming God's private directive
```

The communication goal is a thoughtful person sitting beside the caller — not preacher cadence, customer-service cadence, therapy imitation, or dramatic biblical acting.

## Privacy-first conversation memory

V2 should **not require raw call recordings as the default product memory**.

Preferred model:

```text
live audio
  ↓
Realtime processing
  ↓
optional ephemeral transcript for session operations
  ↓
structured summary generated after call
  ↓
caller chooses whether summary is remembered
```

Default retention target:

- no permanent raw call audio unless a separate operational/legal need is approved and explicitly consented to
- no ordinary analytics containing transcript, prayer, burden, phone, or email content
- memory OFF or minimal by default during beta
- user-facing controls for remembering/deleting conversation summaries

Final retention policy must be implemented in backend code and reflected exactly in Privacy/Terms before launch.

## Safety architecture

Safety is upstream of biblical-story immersion.

```text
speech / text
      ↓
safety decision
      ↓
standard ─────────→ guide + Scripture experience
sensitive ────────→ guide with tighter boundaries
professional-care → plain-language boundary + qualified help
crisis ───────────→ suspend devotional/story mode + immediate human-help direction
```

No story prompt, prayer mode, or voice style can override the global safety decision.

## Consent architecture

Persist consent server-side with at least:

- consent type
- exact language/policy version
- timestamp
- user/account or intake identifier where applicable
- phone number or communication channel where applicable
- source flow
- revocation/opt-out timestamp when applicable

If call recording is eliminated as a default, the phone introduction should still clearly disclose that the caller is speaking with AI and explain any transcription/memory processing that actually occurs.

## Secrets

No authentication token or provider secret may be committed to Git.

Use provider secret stores for Cloudflare, Supabase, Twilio, OpenAI, and Stripe credentials. Public browser keys are allowed only when intentionally public and protected by server authorization/RLS.

## Deployment

```text
commit / pull request
  → synchronized lockfile install
  → lint
  → typecheck
  → unit tests
  → integration tests
  → build
  → e2e smoke tests
  → preview
  → deploy
```

`dist/` becomes generated CI output rather than authored source.

## Observability

Privacy-safe product events:

- homepage_view
- intake_started
- intake_consented
- intake_completed
- story_recommended
- guide_session_requested
- call_started
- call_completed
- journey_started
- journey_day_completed
- gift_created
- gift_claimed
- membership_started

Operational metrics:

- API latency/error rate
- SIP/Twilio failures
- OpenAI Realtime call/session errors
- scheduled-call misses
- safety escalation counts
- provider cost per completed call
- conversation interruption / abandonment rate

Do not put burden text, prayer text, transcript text, or raw contact information into ordinary analytics.

## Migration order

1. Adopt one-guide content/voice model across UI and copy.
2. Rotate/seal secrets; keep safety and consent contracts enforceable.
3. Bring Supabase schema/functions/RLS, Twilio config, billing webhooks, and existing call orchestration into version control.
4. Replace the multi-provider live-conversation chain with Twilio SIP + OpenAI Realtime where technically validated.
5. Build reviewed biblical story packets for guide narration; retire first-person synthetic witness lines.
6. Move `/begin`, `/gift`, `/g`, and `/account` into the shared application/design system.
7. Add automated E2E, safety, privacy, and call-scenario tests.
8. Move production deployment away from committed build artifacts.
9. Run a small pre-launch voice/UX pilot before locking pricing or broad marketing claims.
