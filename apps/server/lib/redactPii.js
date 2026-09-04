/**
 * Redaction for the public demo admin.
 *
 * The demo admin login is published on the sign-in page, so anyone can hold an
 * admin token. `blockDemoAdminWrites` already stops it changing anything, but
 * reading was unrestricted: /api/admin/users returned every registered user's
 * name, email, phone and address, and the order and product endpoints leaked
 * the same details through `.populate("user", "... email")`.
 *
 * These helpers mask the values so a reviewer can still see that the tables
 * render, paginate and search, without learning who anyone is.
 */

/** Fields worth hiding wherever they appear in a response. */
const PII_FIELDS = new Set([
  "email",
  "phone",
  "address",
  "firstName",
  "lastName",
  "fullName",
  "bio",
]);

/** alice@gmail.com -> a••••@•••••.com */
function maskEmail(value) {
  const email = String(value ?? "");
  const at = email.indexOf("@");
  if (at < 1) return "•••••";

  const localRest = "•".repeat(Math.max(at - 1, 1));
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  const tld = dot > -1 ? domain.slice(dot) : "";
  const host = "•".repeat(Math.max((dot > -1 ? domain.slice(0, dot) : domain).length, 1));

  return `${email[0]}${localRest}@${host}${tld}`;
}

/** 01712345678 -> •••••••5678, keeping the shape recognisable. */
function maskPhone(value) {
  const phone = String(value ?? "");
  if (!phone) return "";
  const tail = phone.slice(-4);
  return `${"•".repeat(Math.max(phone.length - 4, 1))}${tail}`;
}

/** Ada -> A. Applied per field so "Ada" + "Lovelace" reads as "A." + "L." */
function maskNamePart(value) {
  const name = String(value ?? "").trim();
  if (!name) return "";
  return `${name[0].toUpperCase()}.`;
}

/** "Ada Lovelace" -> "A. L." for a pre-joined full name. */
function maskFullName(value) {
  const parts = String(value ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts.map((p) => `${p[0].toUpperCase()}.`).join(" ");
}

function maskField(key, value) {
  if (value === null || value === undefined) return value;

  switch (key) {
    case "email":
      return maskEmail(value);
    case "phone":
      return maskPhone(value);
    case "firstName":
    case "lastName":
      return maskNamePart(value);
    case "fullName":
      return maskFullName(value);
    case "address":
      return "•••••";
    case "bio":
      return "•••••";
    default:
      return value;
  }
}

/**
 * Walk a response body and mask every PII field at any depth.
 *
 * Depth-first over plain objects and arrays so populated sub-documents — the
 * `user` on an order, the `farmer` on a product — are covered without the
 * caller naming them, including on admin routes that do not exist yet.
 *
 * Dates, ObjectIds and other class instances are returned untouched: they
 * carry no PII and rebuilding them would corrupt the response.
 */
function redactDeep(value, seen = new WeakSet()) {
  if (Array.isArray(value)) {
    return value.map((item) => redactDeep(item, seen));
  }

  if (value === null || typeof value !== "object") return value;

  // Only descend into plain objects. Anything with a custom prototype (Date,
  // ObjectId, Buffer) is left alone.
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return value;

  // Cyclic structures would otherwise recurse forever.
  if (seen.has(value)) return value;
  seen.add(value);

  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = PII_FIELDS.has(key) ? maskField(key, val) : redactDeep(val, seen);
  }
  return out;
}

module.exports = {
  PII_FIELDS,
  maskEmail,
  maskPhone,
  maskNamePart,
  maskFullName,
  redactDeep,
};
