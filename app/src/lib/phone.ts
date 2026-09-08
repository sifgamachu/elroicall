export const PHONE_DISPLAY = "1 (855) 619-7337";
export const PHONE_TEL = "tel:+18556197337";

// Formatting validation only; ownership still requires backend verification.
export function normalizePhone(value: string): string | null {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (!/^\+?\d+$/.test(compact)) return null;
  const digits = compact.replace(/^\+/, "");
  if (!compact.startsWith("+") && digits.length === 10) {
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? `+1${digits}` : null;
  }
  if (digits.startsWith("1")) {
    return /^1[2-9]\d{2}[2-9]\d{6}$/.test(digits) ? `+${digits}` : null;
  }
  return compact.startsWith("+") && /^[2-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
}
