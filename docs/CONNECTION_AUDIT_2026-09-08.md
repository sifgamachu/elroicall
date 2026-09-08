# Connection experience audit — 8 September 2026

The saved main branch still contained the trust and connection gaps described in the earlier review. This change applies the fixes to the existing React application and retains its Cloudflare asset deployment and Supabase contracts.

## Changes

- Mobile visitors reach the writing surface before the longer introduction. The existing Well visual identity is retained.
- A React context carries an unsubmitted draft across product routes, including topic selection. Sensitive text is not put in URLs, history state, localStorage, or sessionStorage. Refreshing or closing the page clears the draft.
- Setup shows three actionable stages: Share, Reflect, Call. It has a labeled textarea, readable consent, a cancel action while waiting, an edit action after reflection, and direct phone recovery on failure.
- Successful setup shows a prominent Call now action, the caller number, and desktop dialing instructions. The form makes clear that it does not initiate a callback.
- Phone-format validation and normalization are shared across setup, gift redemption, and member verification. These checks do not establish ownership; verification remains a backend responsibility.
- JSON requests have a 20-second deadline covering both headers and body parsing, respect cancellation, reject malformed successful responses, and never automatically retry writes. The member adapter uses the same transport.
- Member operations release loading controls after network failures and distinguish unconfirmed saves from confirmed success. Email sign-in uses a labeled, validated form and prevents repeat submissions while sending.
- The homepage memory illustration has no interactive controls. Its planned status is visible, and the footer consistently describes one AI guide rather than biblical-character voices.
- Secondary routes load separately. An application error boundary offers recovery and the phone number if a page fails to render.
- The inconsistent dependency lock is repaired. CI and asset generation use npm ci; CI runs the request/phone regressions. Node 22.18 or newer is required.

## Verification

- Eleven regression tests cover phone formats, invalid numbers, request payloads, HTTP errors, invalid JSON, connection and body timeouts, cancellation, and the absence of automatic write retries.
- Lint, TypeScript checking, and the production build are the release gates.
- The deployed intake health endpoint returned success. A synthetic reflection request returned a valid intake ID, reflection, and biblical story name. No personal user text or real phone number was used in this check.

## Remaining product verification

The repository does not contain the deployed Supabase function sources or live telephony implementation. A real completed call, voice quality/latency, caller-context handoff, recording policy enforcement, server-side consent records, paid access, and memory retention cannot be established from the web build or intake response. None is reported as verified by this change.

No automated call, member email, gift delivery, or recurring schedule was initiated for testing. Browser rendering and interaction were not tested in this pass.
