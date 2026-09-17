import assert from "node:assert/strict";
import { test } from "node:test";
import { isQpayInvoicePaid } from "./qpay";

test("unpaid invoice is not paid", () => {
  assert.equal(isQpayInvoicePaid({ count: 0, paid_amount: 0, rows: [] }, 12990), false);
  assert.equal(isQpayInvoicePaid({ count: 0, rows: [] }, 12990), false);
});

test("paid invoice with amount is paid", () => {
  assert.equal(
    isQpayInvoicePaid(
      { count: 1, paid_amount: 12990, rows: [{ payment_status: "PAID", payment_amount: "12990" }] },
      12990,
    ),
    true,
  );
});

test("paid invoice with zero paid_amount still confirms via rows", () => {
  assert.equal(
    isQpayInvoicePaid(
      { count: 1, paid_amount: 0, rows: [{ payment_status: "PAID", payment_amount: "12990.00" }] },
      12990,
    ),
    true,
  );
});

test("cancelled row is not paid", () => {
  assert.equal(
    isQpayInvoicePaid({ count: 1, rows: [{ payment_status: "CANCELLED", payment_amount: "12990" }] }, 12990),
    false,
  );
});
