import { timingSafeEqual } from "node:crypto";
import { beforeEach, expect, it, vi } from "vitest";

const { cookies, headers, methods } = vi.hoisted(() => ({
  cookies: new Map<string, string>(),
  headers: new Map<string, string>(),
  methods: [] as string[],
}));

vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return { ...actual, timingSafeEqual: vi.fn(actual.timingSafeEqual) };
});

vi.mock("@tanstack/react-start", () => ({
  createServerFn: ({ method }: { method: string }) => {
    methods.push(method);
    const builder = {
      validator: () => builder,
      handler: (handler: unknown) => handler,
    };
    return builder;
  },
}));

vi.mock("@tanstack/react-start/server", () => ({
  getCookie: (name: string) => cookies.get(name),
  setCookie: (name: string, value: string) => cookies.set(name, value),
  deleteCookie: (name: string) => cookies.delete(name),
  setResponseHeader: (name: string, value: string) => headers.set(name, value),
}));

import { getSession, login, logout } from "./auth.functions";

// Exercise the server handlers directly; the transport is replaced above.
const readSession = getSession as unknown as () => { email: string } | null;
const authenticate = login as unknown as (input: {
  data: { email: string; password: string };
}) => Promise<{ ok: boolean }>;
const endSession = logout as unknown as () => void;

beforeEach(() => {
  cookies.clear();
  headers.clear();
  vi.clearAllMocks();
});

it("uses POST and forbids browser and CDN caching for session reads", () => {
  expect(methods).toEqual(["POST", "POST", "POST"]);
  expect(readSession()).toBeNull();
  expect(headers.get("Cache-Control")).toBe("private, no-store");
  expect(headers.get("Netlify-CDN-Cache-Control")).toBe("no-store");
});

it("reads the newly issued signed cookie and clears it on logout", async () => {
  // Accept test credentials only; token signing and verification remain real.
  vi.mocked(timingSafeEqual)
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(true);
  expect(
    await authenticate({
      data: {
        email: "test@example.test".padEnd(35, "x"),
        password: "test-only",
      },
    }),
  ).toEqual({ ok: true });
  expect(readSession()).toEqual({ email: "test@example.test".padEnd(35, "x") });
  endSession();
  expect(readSession()).toBeNull();
});

it("rejects a tampered session cookie", () => {
  cookies.set("demo_session", "invalid.invalid");
  expect(readSession()).toBeNull();
});

it("does not issue a session for invalid credentials", async () => {
  expect(
    await authenticate({
      data: {
        email: "test@example.test".padEnd(35, "x"),
        password: "test-only",
      },
    }),
  ).toEqual({ ok: false });
  expect(cookies.size).toBe(0);
});
