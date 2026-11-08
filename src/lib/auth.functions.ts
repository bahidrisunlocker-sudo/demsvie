import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";
import { z } from "zod";

// Demo accounts: no sign-up; credentials are checked only on the server.
const DEMO_EMAIL = "florencecatherineberteaux@gmail.com";
// SHA-256 of the demo password (the plain password is never stored in code).
const DEMO_PASSWORD_SHA256 =
  "5eeecaea74c79177587e4fabbef5bd66f13b3553cec3cbf72f5654602f69bdcb";

const ADDITIONAL_DEMO_EMAIL = "florencecatherineberteaux@gmail.com";
const ADDITIONAL_DEMO_PASSWORD_SHA256 =
  "cfed4650f3147549021c0f6f028f79cb4bbe268e40566ac8e6500eb5e077d03e";

const FLORENCE_EMAIL = "florencecatherineberteau@gmail.com";
const FLORENCE_PASSWORD_SHA256 =
  "ec520f5f10c9685ad79dc4d5ba3ef12a8d449a90642f70979ac7e4e2a01ecf15";

const COOKIE_NAME = "demo_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 h

function secret() {
  return process.env.SESSION_SECRET ?? `demo-session:${DEMO_PASSWORD_SHA256}`;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function createToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + SESSION_MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature))
    return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      email?: unknown;
      exp?: unknown;
    };
    if (typeof data.email !== "string" || typeof data.exp !== "number")
      return null;
    if (data.exp < Date.now()) return null;
    return data.email;
  } catch {
    return null;
  }
}

export const getSession = createServerFn({ method: "GET" }).handler(() => {
  const email = readToken(getCookie(COOKIE_NAME));
  return email ? { email } : null;
});

export const login = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().trim().toLowerCase().max(254),
      password: z.string().max(200),
    }),
  )
  .handler(async ({ data }) => {
    // Small constant delay to slow down brute-force attempts.
    await new Promise((r) => setTimeout(r, 400));
    const hash = createHash("sha256").update(data.password).digest("hex");
    const ok =
      (safeEqual(data.email, DEMO_EMAIL) &&
        safeEqual(hash, DEMO_PASSWORD_SHA256)) ||
      (safeEqual(data.email, ADDITIONAL_DEMO_EMAIL) &&
        safeEqual(hash, ADDITIONAL_DEMO_PASSWORD_SHA256)) ||
      (safeEqual(data.email, FLORENCE_EMAIL) &&
        safeEqual(hash, FLORENCE_PASSWORD_SHA256));
    if (!ok) return { ok: false as const };
    setCookie(COOKIE_NAME, createToken(data.email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return { ok: true as const };
  });

export const logout = createServerFn({ method: "POST" }).handler(() => {
  deleteCookie(COOKIE_NAME, { path: "/" });
  return { ok: true };
});
