export function normalizeMnPhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+976") && digits.length === 12) return digits;
  if (digits.startsWith("976") && digits.length === 11) return `+${digits}`;
  if (/^\d{8}$/.test(digits)) return `+976${digits}`;
  throw new Error("Утасны дугаар буруу байна");
}
