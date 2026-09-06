import assert from "node:assert/strict";
import { test } from "node:test";
import { sendUrl, toCallProRecipient } from "./sms.service";

test("CallPro recipient uses 8-digit local number", () => {
  assert.equal(toCallProRecipient("+97699001122"), "99001122");
  assert.equal(toCallProRecipient("97699001122"), "99001122");
  assert.equal(toCallProRecipient("99001122"), "99001122");
});

test("CallPro send URL appends /send once", () => {
  assert.equal(sendUrl("https://api-text.callpro.mn/v1/sms"), "https://api-text.callpro.mn/v1/sms/send");
  assert.equal(sendUrl("https://api-text.callpro.mn/v1/sms/send"), "https://api-text.callpro.mn/v1/sms/send");
});
