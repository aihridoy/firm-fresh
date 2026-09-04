const { redactDeep } = require("../lib/redactPii");

// Same account blockDemoAdminWrites keys off. Kept identical on purpose: one
// definition of "is this the public demo login" for both rules.
const DEMO_ADMIN_EMAIL = "admin@demo.com";

/**
 * Masks personal data in every admin response for the public demo admin.
 *
 * Applied once where the admin routes are mounted rather than inside each
 * controller. Eight endpoints leaked PII — the users list and detail, plus
 * every `.populate("user"|"farmer", "firstName lastName email")` on the
 * dashboard, product and order routes. Patching them individually would leave
 * the next admin route to leak again by default; wrapping the response means
 * new routes are covered the day they are written.
 *
 * Controllers send mongoose documents, not plain objects, so the body is
 * normalised through JSON first — that runs each document's toJSON and gives
 * the walker plain objects to recurse into. Only paid for demo requests.
 */
function redactDemoPii(req, res, next) {
  if (req.user?.email !== DEMO_ADMIN_EMAIL) return next();

  const originalSend = res.send.bind(res);

  res.send = (body) => {
    // Express calls send() twice for object bodies: once with the object, then
    // again with the serialised string from res.json. Only the first pass is
    // ours to rewrite.
    if (body === null || typeof body !== "object" || Buffer.isBuffer(body)) {
      return originalSend(body);
    }

    let plain;
    try {
      plain = JSON.parse(JSON.stringify(body));
    } catch {
      // Unserialisable body: send it untouched rather than fail the request.
      return originalSend(body);
    }

    return originalSend(redactDeep(plain));
  };

  next();
}

module.exports = { redactDemoPii, DEMO_ADMIN_EMAIL };
