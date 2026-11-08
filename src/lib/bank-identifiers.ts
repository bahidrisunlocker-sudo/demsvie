export const BANK_IDENTIFIERS = {
  IBAN: {
    example: "FR76 3000 2000 1234 5678 9012 345",
    hint: "IBAN français : 27 caractères, FR puis 2 chiffres, 10 chiffres, 11 lettres ou chiffres et 2 chiffres. Espaces autorisés.",
    pattern: /^FR\d{12}[A-Z0-9]{11}\d{2}$/,
    error:
      "IBAN invalide : saisissez un IBAN français de 27 caractères au format indiqué.",
  },
  BIC: {
    example: "BNPAFRPPXXX",
    hint: "8 ou 11 caractères : 4 lettres pour la banque, 2 lettres pour le pays, 2 lettres ou chiffres, puis éventuellement 3 lettres ou chiffres.",
    pattern: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    error:
      "BIC invalide : saisissez 8 ou 11 caractères au format indiqué (ex. BNPAFRPPXXX).",
  },
  RIB: {
    example: "30002 00012 12345678901 45",
    hint: "23 caractères : code banque (5 chiffres), code guichet (5 chiffres), compte (11 lettres ou chiffres), clé RIB (2 chiffres). Sans nom de banque ; espaces autorisés.",
    pattern: /^\d{10}[A-Z0-9]{11}\d{2}$/,
    error:
      "RIB invalide : indiquez 5 chiffres de banque, 5 de guichet, 11 lettres ou chiffres de compte et 2 chiffres de clé.",
  },
} as const;

export function validateBankIdentifier(
  type: keyof typeof BANK_IDENTIFIERS,
  value: string,
): string | null {
  const normalized = value.replace(/\s/g, "").toUpperCase();
  return BANK_IDENTIFIERS[type].pattern.test(normalized)
    ? null
    : BANK_IDENTIFIERS[type].error;
}
