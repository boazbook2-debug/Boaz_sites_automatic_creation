// Format validation for public lead forms — catches empty/gibberish input,
// does not verify the number is real/reachable (that would need SMS OTP).

export function isValidName(name) {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  return /^[a-zA-Zא-ת][a-zA-Zא-ת\s'-]*$/.test(trimmed);
}

export function isValidPhone(phone) {
  const cleaned = phone.trim().replace(/[\s-()]/g, "");
  return /^(\+\d{7,15}|0\d{8,9})$/.test(cleaned);
}
