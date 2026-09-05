import { AccessService } from "./access.service";
import assert from "node:assert/strict";
import { test } from "node:test";

function mockPrisma(overrides: Record<string, unknown>) {
  return {
    user: { findUnique: async () => overrides.user ?? { role: "CUSTOMER" } },
    subscription: { findFirst: async () => overrides.subscription ?? null },
    purchase: { findFirst: async () => overrides.purchase ?? null },
  } as never;
}

test("allows admin", async () => {
  const svc = new AccessService(mockPrisma({ user: { role: "ADMIN" } }));
  assert.deepEqual(await svc.check("u", "t", "PPV"), { allowed: true, reason: "admin" });
});

test("allows free titles", async () => {
  const svc = new AccessService(mockPrisma({}));
  assert.deepEqual(await svc.check("u", "t", "FREE"), { allowed: true, reason: "free" });
});

test("allows active subscription", async () => {
  const svc = new AccessService(mockPrisma({ subscription: { id: "s" } }));
  assert.deepEqual(await svc.check("u", "t", "SUBSCRIPTION"), {
    allowed: true,
    reason: "subscription",
  });
});

test("allows paid PPV", async () => {
  const svc = new AccessService(mockPrisma({ purchase: { id: "p" } }));
  assert.deepEqual(await svc.check("u", "t", "PPV"), { allowed: true, reason: "ppv" });
});

test("blocks unpaid subscription content", async () => {
  const svc = new AccessService(mockPrisma({}));
  assert.deepEqual(await svc.check("u", "t", "SUBSCRIPTION"), {
    allowed: false,
    reason: "paywall",
  });
});
