# Google sign-in activation

## Implemented

The shared AccountSignIn component offers Continue with Google on dashboard sign-in, account creation, and the planner's Account & phone step. Password and email-link access remain available. The button stays disabled with an explanation until the project's public Auth settings report Google enabled; Check Google availability again rechecks without deploying code.

The implementation uses the existing Supabase browser client and its session handling. It returns only to https://elroicall.com/account/ or https://elroicall.com/schedule/. Existing planner drafts and explicit phone-call consent are unchanged. No Google client secret belongs in frontend environment variables, repository files, or chat.

Only openid, email and profile scopes are requested. No Gmail, Drive, Calendar or offline access is requested. Google chooses and verifies the identity; the app does not match accounts using a typed email or user-editable metadata. Supabase's automatic same-email identity linking remains authoritative. Existing members should choose the Google account with their existing verified ElroiCall email. A different email can produce a separate account.

## Required owner setup

Production project: DivineCall (mkocnufwmsfchivfbhuf).

1. In Google Auth Platform, configure an External audience for public users and the ElroiCall name, support email, homepage, privacy policy, and terms. For general launch publish the app rather than leaving access limited to test users. Complete any branding/domain verification Google requires.
2. Create an OAuth client of type Web application. Authorized JavaScript origin: `https://elroicall.com`. Authorized redirect URI: `https://mkocnufwmsfchivfbhuf.supabase.co/auth/v1/callback`.
3. In Supabase Authentication > Sign In / Providers > Google, enter that client's ID and client secret, then enable Google. Keep nonce and email verification safeguards enabled; do not enable skip checks or manual account linking just to make sign-in work.
4. In Supabase Authentication > URL Configuration retain Site URL `https://elroicall.com`, and ensure the exact redirect allowlist contains `https://elroicall.com/account/` and `https://elroicall.com/schedule/`. Do not replace existing valid email callback entries or add wildcard external redirects.
5. Reload ElroiCall or use Check Google availability again. Google-enabled settings alone do not prove the client secret, redirect URI, audience, or full consent flow is correct.

The current connected Supabase tools do not expose Google OAuth client provisioning or Auth provider configuration updates. This change does not fabricate credentials or turn the provider on without valid owner configuration.

## Acceptance checks after activation

- New Google member: completes consent and opens an authenticated dashboard without choosing an ElroiCall password.
- Existing verified email member: same Google email opens the same account and retains schedules and notes.
- Scheduling: the selected content, date, time and voice survive the same-browser Google round trip; no call is booked and consent is not preselected.
- Different Google account: private records from another account are not displayed.
- Cancel or Back at Google: the original page is usable and password/email fallback remains available.
- Google availability failure: no fake successful login, no provider error text or secrets displayed.
- Email/password and email-link sign-in continue working.

Automated tests cover request scope, disabled-provider behavior, fixed redirects, safe errors and shared-form integration. A real Google consent flow must be tested after provider activation; no such live authentication is claimed by this code change.

Official references: https://supabase.com/docs/guides/auth/social-login/auth-google and https://supabase.com/docs/guides/auth/auth-identity-linking .
