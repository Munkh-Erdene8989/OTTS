export function normalizeMnPhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+976") && digits.length === 12) return digits;
  if (digits.startsWith("976") && digits.length === 11) return `+${digits}`;
  if (/^\d{8}$/.test(digits)) return `+976${digits}`;
  throw new Error("Утасны дугаар буруу байна");
}

export function isMnPhone(input: string): boolean {
  try {
    normalizeMnPhone(input);
    return true;
  } catch {
    return false;
  }
}

export const PREMIUM_MONTHLY_PRICE_MNT = 12990;
export const PREMIUM_PLAN_CODE = "premium_monthly";

export const ACCESS_TYPES = ["SUBSCRIPTION", "PPV", "FREE"] as const;
export const VIDEO_KINDS = ["FEATURE", "REEL", "TRAILER"] as const;
export const ROLES = ["ADMIN", "CUSTOMER"] as const;
