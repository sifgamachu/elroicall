# Finish ELROICALL signup email delivery

Status checked 21 September 2026: public Auth signup and email are enabled, email confirmation is required, Auth SMS is disabled, custom SMTP is off, and no send-email Auth hook is configured. Supabase's default mailer only delivers to organization team addresses. Public registration is therefore not ready until production delivery is activated. No real signup email has been sent or verified during this repair.

Resend domain `elroicall.com` has been created, ID `2e719e31-7082-4530-a137-8c481b9b9c9f`, region `us-east-1`, sending enabled, receiving disabled, open/click tracking disabled. Its state is `not_started`; creating a domain does not verify it or configure Supabase.

## 1. Add sending records in Cloudflare

The domain uses `corey.ns.cloudflare.com` and `ainsley.ns.cloudflare.com`. Cloudflare's dashboard security verification blocked the assistant browser, so these records have **not** been added. In the `elroicall.com` DNS zone, add the following exact provider-issued records. Use TTL Auto and DNS only for the CNAME. Leave existing website and inbox records intact; the MX below is for `send`, not the root domain.

| Type | Name | Value | Priority |
| --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDFnNvHMqLLCy65JHxO1xQOfOm8shdLM7VKSd34QcmKmIzfdI7KEFWrYgmqP+0ZpI1HtYkjhOFFLiYhCfE1/ukP7AjLgcNVDlmJ8VszwF8rVj3zkI/yxNXNrA1uhVMoZoLolu6o90WzEW42iXasnXmiLJmyj1jilE2cJfSumW2NjQIDAQAB` | — |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
| CNAME | `rsend` | `send.forge.rmta.net` | — |

These are public DNS values, not secrets. After adding them, trigger Resend domain verification and wait for the domain to show Verified.

## 2. Activate Supabase SMTP

Open [DivineCall → Authentication → Emails → SMTP Settings](https://supabase.com/dashboard/project/mkocnufwmsfchivfbhuf/auth/smtp). Once the domain is verified, enable custom SMTP with:

| Setting | Value |
| --- | --- |
| Sender email | `noreply@elroicall.com` |
| Sender name | `El Roi Call` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | A Resend API key with sending access restricted to `elroicall.com` |

Enter the API key directly in Supabase, never in a chat message or committed file. The assistant has not created a key or saved SMTP credentials. Keep email confirmation enabled. This does not enable SMS sign-in.

## 3. Apply the prepared email template

In Supabase Authentication → Emails → Templates, use `supabase/templates/verification.html` for both Confirm signup and Magic Link. It offers a code and a production confirmation button, carries the allowed scheduling destination, and places the credential in the URL fragment. Committing this HTML does not change the hosted templates.

The production Site URL should remain `https://elroicall.com/account/`; the allowlist should retain `/account`, `/account/`, `/schedule`, and `/schedule/` on that same production origin. Never change the Site URL back to localhost.

## 4. Verify a real registration

With an owner-authorized test recipient, create an account through the live Create account form. Confirm receipt in that inbox, use the newest link or code, and verify that the private dashboard opens. Sign out and sign in again. Confirm an expired link offers a new email and a scheduling confirmation returns to the scheduler. Real delivery is still unverified until this is completed.

## Website repairs

The release adds explicit Create account and Sign in choices, email-only account creation, delayed phone/PIN setup, honest SMS availability, production mailer error messages, a cooldown only after a confirmed send or server rate limit, safe expired-link recovery, and strict production return destinations. It never bypasses email ownership verification.

Validation: 83 application tests, TypeScript, lint, and production build passed. Automated provider fixtures exercise failure handling; they do not prove inbox delivery.

Sources: [Supabase production SMTP requirements](https://supabase.com/docs/guides/auth/auth-smtp), [Resend SMTP settings](https://resend.com/docs/send-with-smtp).
