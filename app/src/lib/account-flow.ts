// Keep credential validation separate from presentation. Never persist a password or PIN.
export function passwordIssue(password: string, confirmation: string): string {
  if (password.length < 12) return 'Use at least 12 characters for your website password.';
  if (password.length > 128) return 'Use no more than 128 characters.';
  if (password !== confirmation) return 'The two passwords do not match.';
  return '';
}
export function passwordError(error: unknown): string {
  const issue = error && typeof error === 'object' ? error as { code?: string; status?: number } : null;
  if (issue?.status === 429 || issue?.code === 'over_request_rate_limit') return 'Too many attempts. Please wait a minute before trying again.';
  if (issue?.code === 'email_not_confirmed') return 'Confirm your email first. You can use the email sign-in option below to finish verification.';
  if (issue?.code === 'weak_password') return 'Choose a stronger password that has not been used on other websites.';
  if (issue?.code === 'same_password') return 'Choose a different password from your current one.';
  if (issue?.code === 'reauthentication_needed' || issue?.code === 'reauthentication_not_valid') return 'For your security, sign in again using your password or an email link, then return here.';
  if (issue?.code === 'signup_disabled') return 'New accounts are temporarily unavailable. Existing members can still sign in.';
  if (issue?.code === 'invalid_credentials') return 'The email or password was not recognized. Previously used email links? Choose “Use email instead” below.';
  return 'We could not complete that request. Please try again, or use email instead.';
}
