// Every agency/agent phone number is entered as a plain 10-digit Israeli
// local number (e.g. "0522676666") — nobody should have to type a "972"
// country code by hand. wa.me links need the international, no-leading-zero
// form instead ("972522676666"), so this is the one place that conversion
// happens. Also tolerates numbers that already have "972" on them (with or
// without a leftover leading zero after it) so already-fixed data keeps working.
export function toWhatsappNumber(value) {
  let digits = (value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) digits = digits.slice(3);
  digits = digits.replace(/^0+/, "");
  return digits ? `972${digits}` : "";
}
