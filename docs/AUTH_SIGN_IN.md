# Email redirects and verification choice

## Confirmed incident

On 8 September 2026, read-only probes using deliberately invalid tokens and no redirect following confirmed that Supabase redirected all three requested production destinations (`/account`, `/account/`, `/schedule/`) to `http://localhost:3000`. No real member link was inspected or consumed. Public Auth settings reported email enabled and phone disabled.

This is a hosted Auth URL configuration problem. Frontend `emailRedirectTo` requests alone cannot override Supabase's allowed redirect list. The connected Supabase tools expose database and Edge Function operations, but no hosted Auth configuration update operation, and no management credential is available in this workspace. The hosted URL settings have **not** been changed by this release.

## Deployed application behavior

- Dashboard and scheduler share an email/phone verification selector. Both request only canonical production return URLs.
- Email verification supports a copied original Supabase email link, a one-time code when present in the email, or an already-issued session fragment on a failed localhost redirect. The user supplies their own email address and link directly in the application, never in support chat.
- Recovery extracts credentials and sends them only to this project's fixed Auth endpoint. It never fetches or navigates to a pasted URL. Supabase validates the credential; `/auth/v1/user` then verifies the actual account and expected email before the browser accepts a session. Foreign projects/hosts, deceptive origins, unsupported verification types, malformed tokens and expired/error links are rejected.
- Email-link recovery works with the existing email template and avoids the hosted redirect entirely. Already-used email links need a new email or the complete token-bearing failed address.
- `/auth/confirm` provides a confirmation page for the prepared email template. The template uses a URL fragment for its token hash, keeping it out of HTTP requests. The page removes credentials from browser history. Private entry routes use `no-referrer`, `no-store`, and `noindex` headers.
- Phone sign-in checks **Auth's SMS provider availability**, independently of the outbound voice-call credentials. When disabled, the selector clearly directs the user to email and does not claim to send a code.
- Phone sign-in uses `create_user:false` to avoid silently creating a second account for an existing email member. After email sign-in, Preferences contains “Your sign-in methods” to link a phone to that same Auth user via `updateUser` and `phone_change` OTP verification. The returned user ID must match the signed-in account. Phone sign-in and the consented number used for outgoing calls remain separate controls.
- Requests have deadlines, resend cooldowns, explicit errors, and no automatic resend on ambiguous failures. Pasted links/codes remain only in component memory and are cleared after verification; they are not logged or stored as drafts.

## Required hosted configuration

These changes are authorized but require a management interface with Auth settings access. The checked-in `supabase/config.toml` and `supabase/templates/verification.html` make the intended result reviewable; committing them does not configure the hosted project.

1. Open [Auth URL Configuration](https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/auth/url-configuration). Set Site URL to `https://elroicall.com/account/`. Add these redirect URLs:
   - `https://elroicall.com/account`
   - `https://elroicall.com/account/`
   - `https://elroicall.com/schedule`
   - `https://elroicall.com/schedule/`
   Preserve any other intentional production redirects. Remove development destinations from this production project's list when no longer needed.
2. In [Auth Email Templates](https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/auth/templates), use `supabase/templates/verification.html` for **Magic Link** and **Confirm signup**. This adds a visible code and a direct production confirmation link. Use the subjects in `config.toml`. No redirect or template change repairs an already-sent email; members should request a new one or use recovery.
3. In [Auth Providers](https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/auth/providers), configure the Phone provider with a supported SMS service before enabling it. Edge Function `TWILIO_*` secrets used for voice calls do not configure Auth SMS. Keep existing rate limits and abuse controls in place.
4. Verify a newly delivered email, the return destination and an explicitly requested SMS with the real delivery providers. Do not describe inbox/SMS delivery as tested by synthetic credential tests.

## Verification performed

The 43 application tests pass, including nine new Auth regression tests. Lint, TypeScript checks, and the production build pass. Live checks used one explicitly authorized temporary synthetic account and directly seeded, short-lived verification fixtures; no email or SMS was sent. The production Auth service successfully redeemed an email link with a localhost redirect through the new recovery code, recovered an already-issued localhost session fragment, rejected link reuse and an incorrect expected email, opened the authenticated dashboard, and redeemed an email code. Both resulting sessions were signed out. The account, identity, sessions, and one-time-token fixtures were deleted, with zero remaining rows confirmed. Browser interaction and real inbox/SMS delivery are not claimed as verified.

## Sources

- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase phone sign-in and linking](https://supabase.com/docs/guides/auth/phone-login)
- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
