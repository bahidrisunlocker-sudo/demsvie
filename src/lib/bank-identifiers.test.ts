import { expect, it } from "vitest";
import { validateBankIdentifier } from "./bank-identifiers";

it.each([
  ["IBAN", "FR76 3000 2000 1234 5678 9012 34"],
  ["IBAN", "FR76 3000 2000 1234 5678 9012 3456"],
  ["IBAN", "FRAB 3000 2000 1234 5678 9012 345"],
  ["BIC", "BNPAFRPPP"],
  ["BIC", "BNPAFRPPXX"],
  ["BIC", "1NPAFRPPXXX"],
  ["BIC", "BNPAFRPPXXXX"],
  ["RIB", "30002 00012 12345678901 4"],
  ["RIB", "A0002 00012 12345678901 45"],
  ["RIB", "30002 00012 12345678901 AB"],
  ["RIB", "30002 00012 123456789012 45"],
] as const)("rejects malformed %s: %s", (type, value) => {
  expect(validateBankIdentifier(type, value)).toBeTypeOf("string");
});

it("accepts lowercase and presentation spaces", () => {
  expect(
    validateBankIdentifier("IBAN", "fr76 3000 2000 1234 5678 9012 345"),
  ).toBeNull();
  expect(validateBankIdentifier("BIC", "bnpafrppxxx")).toBeNull();
});
