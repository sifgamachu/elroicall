# El Roi Call V2 — Web Architecture

## Decision

The website is one product application.

The old structure mixed a React marketing site with separate standalone HTML applications for intake, gifting, gift redemption, About, and member access. That architecture has been retired on the V2 branch.

Voice/telephony migration is intentionally deferred. The web application continues to call the current backend contracts until those services are brought under version control and migrated separately.

## Route ownership

| Route | Owner | Purpose |
| --- | --- | --- |
| `/` | React | Human-first public homepage |
| `/begin` | React | Consent → burden → reflection → story → free-call claim |
| `/gift` | React | Gift creation |
| `/g/:code` | React | Private gift redemption |
| `/about` | React | Why El Roi exists / product principles |
| `/account` | React | Passwordless member room, phone verification, journey scheduling, history |
| `/login`, `/portal` | React redirect | Compatibility aliases into `/account` |
| `/privacy/` | Static legal document | Privacy policy |
| `/terms/` | Static legal document | Terms of service |

CI explicitly verifies that no `begin`, `gift`, `g`, `about`, or `account` standalone HTML file is emitted into `dist/` and allowed to shadow the SPA.

## Current source shape

```text
app/
  src/
    App.tsx
    pages/
      Home.tsx
      Begin.tsx
      Gift.tsx
      GiftRedeem.tsx
      About.tsx
      MemberRoom.tsx
      NotFound.tsx
    components/
      ProductShell.tsx
      RouteMeta.tsx
      MemberControls.tsx
      ...homepage experience components
    hooks/
      use-document-meta.ts
    lib/
      api.ts
      portal.ts
      phone.ts
      supabase.ts
      witnesses.ts
    sections/
      ...homepage sections
    contracts/
      safety.ts
      voice.ts
      witnesses.ts
  public/
    privacy/index.html
    terms/index.html
    images/
    robots.txt
    sitemap.xml
```

## Shared application contracts

### ProductShell

All transactional/member pages use one shell for:

- El Roi brand/header
- persistent call affordance
- typography and spacing
- trust footer
- legal links
- dark conversational surface
- consistent adult/AI/product-boundary language

The homepage remains more cinematic, but it shares the same visual tokens and product language.

### API client

`src/lib/api.ts` is the single location for browser-visible service endpoints and shared JSON request behavior.

UI components must not create new hard-coded Supabase Function URLs.

### Member portal contract

`src/lib/portal.ts` is the typed adapter for the current member backend.

It owns:

- member/profile reads
- active journey shape
- progress/history types
- authorized GET/POST behavior for portal functions

`MemberRoom.tsx` owns the member information hierarchy and authentication state. `MemberControls.tsx` owns phone verification, recurring-call consent, schedule writes, and pause actions. This keeps operational controls out of the core Today/history view.

### Authentication

`src/lib/supabase.ts` owns the browser Supabase client.

Rules:

- use publishable/anon browser keys only
- prefer `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- never use a service-role credential in browser code
- database authorization must be enforced by RLS/backend, not UI state

`app/.env.example` documents the safe public configuration surface.

### Route metadata

`RouteMeta.tsx` + `use-document-meta.ts` own browser route titles, descriptions, canonical URLs, and robots rules.

Private gift redemption and account routes are noindex.

Longer term, public acquisition routes should be prerendered or receive route-specific server/edge metadata so link unfurlers that do not execute JavaScript receive the same metadata.

## Member experience architecture

The member experience is no longer settings-first.

Default information hierarchy:

1. **Today at the Well** — what is next right now
2. **Start a conversation** — immediate primary action
3. **Progress** — calls, days walked, Bible progress, active journeys
4. **Your journeys** — recurring rhythms the member chose
5. **Recent conversations** — brief recognizable summaries, not a transcript dump
6. **Phone / consent / scheduling controls** — operational settings after the human context

The React member page uses Supabase passwordless email auth and the existing portal backend contract. Phone verification, verification-code handling, recurring schedule creation, explicit automated-call consent, and journey pause controls are all inside the same React member experience.

## State and privacy rules

- Sensitive burden text stays local until consent is checked.
- Gift recipients consent before phone claim.
- Prayer requests require privacy acknowledgment before submission.
- Automated member call schedules cannot be submitted without an already verified phone and explicit consent in the UI; server-side consent persistence remains a backend requirement.
- Normal product analytics must never receive raw burden text, prayer text, transcript text, raw phone numbers, or email addresses.
- Raw conversation retention should not be treated as the member experience. The preferred UX is recognizable summaries plus explicit memory controls.

## Design-system direction

The product should feel like one place, not one template.

Core primitives to continue extracting:

```text
ProductShell
PageHeader
PrimaryAction
SecondaryAction
TrustPanel
ConsentControl
PhoneField
StoryCard
JourneyCard
ProgressMetric
EmptyState
ErrorState
LoadingPresence
SafetyNotice
```

Do not build another page-specific design language for new flows.

## Build/deployment

Current V2 validation:

```text
install
→ lint
→ typecheck
→ build
→ verify one-app route ownership
→ warn on lockfile drift
```

Target:

```text
npm ci
→ lint
→ typecheck
→ unit tests
→ integration tests
→ build
→ E2E route smoke tests
→ preview deploy
→ production deploy
```

The existing out-of-sync package lock and committed `dist/` model remain tracked separately and should be retired before launch.

## Next web slices

1. Extract repeated form/action/trust primitives from Begin/Gift/Member into the design system.
2. Add route-level error boundaries and structured loading states.
3. Add Playwright E2E for Home → Begin, Gift → Redeem, Account sign-in/verification/schedule, and 404.
4. Add privacy-safe product-event client.
5. Prerender or edge-render public route metadata.
6. Remove unused legacy component/dependency surface once no active route imports it.
7. Regenerate lockfile and move CI back to `npm ci`.
8. Add explicit user-facing memory controls once backend retention/memory semantics are finalized.

## Non-goal for this phase

Do not block the website architecture on the future voice provider decision. The web layer should depend on stable product/API contracts, not on which realtime voice stack eventually fulfills a call.
