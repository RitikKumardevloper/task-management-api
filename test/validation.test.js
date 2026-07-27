const test = require("node:test");
const assert = require("node:assert/strict");
const { isStrongPassword, isValidEmail } = require("../src/utils/validation");

test("accepts strong passwords and valid emails", () => {
  assert.equal(isStrongPassword("StrongPass1!"), true);
  assert.equal(isStrongPassword("weakpass"), false);
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("invalid-email"), false);
});
