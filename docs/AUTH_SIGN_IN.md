# Email redirects and verification choice

## Sign-in QA — 22 September 2026

- Live `/login/` opens the sign-in screen. Public Auth settings return HTTP 200 with email and signup enabled and SMS disabled. A deliberately invalid email token redirects to `https://elroicall.com/account/` with `otp_expired`, not localhost. No email or text message was sent for these probes.
- Resend reported the sending domain as `partially_failed`: DKIM and the CNAME were verified while the `send` MX and SPF TXT checks failed. Public DNS returned the required MX and TXT values. A new provider verification was started and is pending. The Supabase SMTP dashboard requires owner sign-in; its current saved credentials have not been verified in this QA.
- Prepared code fixes make dashboard headings follow the Create account/Sign in selection, default a direct account visit to sign-in, explain the inbox step before offering optional link/code recovery, bound session restoration to twelve seconds, and preserve account data when Auth repeats a sign-in event for the same session. Account switching and sign-out still clear private page data.
- Six new session regression tests cover duplicate events, token refresh, account changes, stale initial reads, timeouts, Auth errors, and unmount cleanup. All 95 application tests pass; lint, TypeScript, and production build pass.
- These website fixes are local until the owner explicitly approves the existing GitHub deployment destination, as requested by automatic approval review. No real inbox delivery or full browser sign-in is claimed.

## Confirmed incident

On 8 September 2026, read-only probes using deliberately invalid tokens and no redirect following confirmed that Supabase redirected all three requested production destinations (`/account`, `/account/`, `/schedule/`) to `http://localhost:3000`. No real member link was inspected or consumed. Public Auth settings reported email enabled and phone disabled.

This was a hosted Auth URL configuration problem. Frontend `emailRedirectTo` requests alone cannot override Supabase's allowed redirect list. On 9 September 2026, after the owner signed in to the Supabase dashboard, the production Site URL was changed from `http://localhost:3000` to `https://elroicall.com/account/`. The previously empty redirect allow list now contains the account and scheduling URLs, with and without trailing slashes.

Seven live redirect probes passed after saving: the default destination, all four allowed production URLs, an explicit localhost request, and an unrelated destination. The last two correctly fall back to the production account page. These probes used deliberately invalid credentials and did not send email, create accounts, or consume member links. An expired or already-used email link still needs a fresh sign-in request.

## Deployed application behavior

- Dashboard and scheduler share an email/phone verification selector. Both request only canonical production return URLs.
- Email verification supports a copied original Supabase email link, a one-time code when present in the email, or an already-issued session fragment on a failed localhost redirect. The user supplies their own email address and link directly in the application, never in support chat.
- Recovery extracts credentials and sends them only to this project's fixed Auth endpoint. It never fetches or navigates to a pasted URL. Supabase validates the credential; `/auth/v1/user` then verifies the actual account and expected email before the browser accepts a session. Foreign projects/hosts, deceptive origins, unsupported verification types, malformed tokens and expired/error links are rejected.
- Email-link recovery works with the existing email template and avoids the hosted redirect entirely. Already-used email links need a new email or the complete token-bearing failed address.
- `/auth/confirm` provides a confirmation page for the prepared email template. The template uses a URL fragment for its token hash, keeping it out of HTTP requests. The page removes credentials from browser history. Private entry routes use `no-referrer`, `no-store`, and `noindex` headers.
- Phone sign-in checks **Auth's SMS provider availability**, independently of the outbound voice-call credentials. When disabled, the selector clearly directs the user to email and does not claim to send a code.
- Phone sign-in uses `create_user:false` to avoid silently creating a second account for an existing email member. After email sign-in, Preferences contains “Your sign-in methods” to link a phone to that same Auth user via `updateUser` and `phone_change` OTP verification. The returned user ID must match the signed-in account. Phone sign-in and the consented number used for outgoing calls remain separate controls.
- Requests have deadlines, resend cooldowns, explicit errors, and no automatic resend on ambiguous failures. Pasted links/codes remain only in component memory and are cleared after verification; they are not logged or stored as drafts.

## Hosted configuration and remaining email/SMS work

The URL changes below are applied. The checked-in email template remains a prepared improvement; committing it does not configure the hosted project. The dashboard currently reports the built-in email delivery service, so production SMTP setup remains separate from the resolved redirect incident.

1. **Applied and verified on 9 September 2026:** [Auth URL Configuration](https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/auth/url-configuration) uses Site URL `https://elroicall.com/account/` and these exact redirect URLs:
   - `https://elroicall.com/account`
   - `https://elroicall.com/account/`
   - `https://elroicall.com/schedule`
   - `https://elroicall.com/schedule/`
   No development or wildcard redirects were added.
2. In [Auth Email Templates](https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/auth/templates), use `supabase/templates/verification.html` for **Magic Link** and **Confirm signup** when activating the prepared code-and-link template. This adds a visible code and a direct production confirmation link. Use the subjects in `config.toml`. Expired or already-used links need a new email or the existing recovery flow.
3. In [Auth Providers](https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/auth/providers), configure the Phone provider with a supported SMS service before enabling it. Edge Function `TWILIO_*` secrets used for voice calls do not configure Auth SMS. Keep existing rate limits and abuse controls in place.
4. Verify a newly delivered email, the return destination and an explicitly requested SMS with the real delivery providers. Do not describe inbox/SMS delivery as tested by synthetic credential tests.

## Verification performed

The 43 application tests pass, including nine new Auth regression tests. Lint, TypeScript checks, and the production build pass. Live checks used one explicitly authorized temporary synthetic account and directly seeded, short-lived verification fixtures; no email or SMS was sent. The production Auth service successfully redeemed an email link with a localhost redirect through the new recovery code, recovered an already-issued localhost session fragment, rejected link reuse and an incorrect expected email, opened the authenticated dashboard, and redeemed an email code. Both resulting sessions were signed out. The account, identity, sessions, and one-time-token fixtures were deleted, with zero remaining rows confirmed. Browser interaction and real inbox/SMS delivery are not claimed as verified.

## Sources

- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase phone sign-in and linking](https://supabase.com/docs/guides/auth/phone-login)
- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)

## Signup repair — 21 September 2026

Live settings and the authenticated dashboard confirm that signup is enabled but production SMTP is off and no email hook is configured. Supabase's built-in delivery only serves organization-team addresses, so ordinary visitors cannot reliably register. The new release makes signup explicit, distinguishes sign-in from account creation, disables unavailable SMS choices, correctly explains email-provider failures, preserves the allowlisted scheduling destination in the prepared template, and recovers expired email callbacks. Phone number and calling PIN are not prerequisites for creating the email account.

A Resend sending domain has been created; DNS and hosted SMTP activation remain incomplete. See [the exact activation steps and DNS records](SIGNUP_EMAIL_ACTIVATION.md). The Cloudflare dashboard challenged this browser, preventing DNS edits. No inbox delivery is claimed. Current application verification: 83 tests pass, plus lint, TypeScript and build checks. Hosted email templates remain unchanged.
