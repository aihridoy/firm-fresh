import { describe, it, expect, vi } from "vitest";
import { redactDemoPii, DEMO_ADMIN_EMAIL } from "./redactDemoPii.js";

/**
 * Minimal stand-ins for the express objects. `send` records what would have
 * gone over the wire, which is exactly what these tests assert on: the bytes a
 * demo admin actually receives.
 */
function makeRes() {
  const sent = [];
  const res = { send: (body) => sent.push(body) };
  res.sentBodies = sent;
  return res;
}

const demoReq = { user: { email: DEMO_ADMIN_EMAIL } };
const realAdminReq = { user: { email: "owner@farmfresh.com" } };

describe("redactDemoPii", () => {
  it("masks PII for the demo admin", () => {
    const res = makeRes();
    const next = vi.fn();
    redactDemoPii(demoReq, res, next);
    expect(next).toHaveBeenCalled();

    res.send({ status: true, data: [{ firstName: "Ada", email: "ada@analytical.com" }] });

    const body = res.sentBodies[0];
    expect(body.data[0].email).not.toContain("analytical.com");
    expect(body.data[0].firstName).toBe("A.");
  });

  it("leaves a real admin's response untouched", () => {
    const res = makeRes();
    redactDemoPii(realAdminReq, res, vi.fn());

    const original = { status: true, data: [{ firstName: "Ada", email: "ada@analytical.com" }] };
    res.send(original);

    expect(res.sentBodies[0]).toBe(original);
    expect(res.sentBodies[0].data[0].email).toBe("ada@analytical.com");
  });

  it("leaves a signed-out request untouched", () => {
    const res = makeRes();
    const next = vi.fn();
    redactDemoPii({}, res, next);
    expect(next).toHaveBeenCalled();
    const body = { email: "ada@analytical.com" };
    res.send(body);
    expect(res.sentBodies[0]).toBe(body);
  });

  it("normalises mongoose-style documents through toJSON", () => {
    // Controllers send documents, not plain objects. Without the JSON pass the
    // walker would refuse to descend and the response would leak.
    class FakeDoc {
      constructor(data) {
        Object.assign(this, data);
      }
      toJSON() {
        return { ...this };
      }
    }

    const res = makeRes();
    redactDemoPii(demoReq, res, vi.fn());
    res.send({
      status: true,
      data: [new FakeDoc({ email: "ada@analytical.com", phone: "01712345678" })],
    });

    const body = res.sentBodies[0];
    expect(body.data[0].email).not.toContain("analytical.com");
    expect(body.data[0].phone).toBe("•••••••5678");
  });

  it("passes strings straight through", () => {
    // Express re-enters send() with the serialised string; rewriting it twice
    // would corrupt the response.
    const res = makeRes();
    redactDemoPii(demoReq, res, vi.fn());
    res.send('{"already":"serialised"}');
    expect(res.sentBodies[0]).toBe('{"already":"serialised"}');
  });

  it("passes Buffers straight through", () => {
    const res = makeRes();
    redactDemoPii(demoReq, res, vi.fn());
    const buf = Buffer.from("binary");
    res.send(buf);
    expect(res.sentBodies[0]).toBe(buf);
  });

  it("sends the body unchanged when it cannot be serialised", () => {
    const res = makeRes();
    redactDemoPii(demoReq, res, vi.fn());
    const cyclic = { email: "ada@analytical.com" };
    cyclic.self = cyclic;
    expect(() => res.send(cyclic)).not.toThrow();
    expect(res.sentBodies).toHaveLength(1);
  });
});
