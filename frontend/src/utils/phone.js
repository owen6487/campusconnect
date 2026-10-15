// Save as src/utils/phone.js
// One copy of the phone rules for every page that needs them.

// "0712 345 678", "+254712345678", "712345678" -> "0712345678"
// Returns "" for empty input and null when the number is invalid.
export const normalizeKenyanPhone = (input = "") => {
  const v = String(input).trim();
  if (!v) return "";
  const d = v.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(d)) return d;
  if (/^254[17]\d{8}$/.test(d)) return "0" + d.slice(3);
  if (/^[17]\d{8}$/.test(d)) return "0" + d;
  return null;
};

// "0712345678" -> "0712 345 678"
export const formatPhone = (p) =>
  p && p.length === 10 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p;