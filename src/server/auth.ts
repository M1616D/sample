import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/server/db";

/**
 * Authentication.
 *
 * Design:
 *  - Passwords are hashed with bcrypt (cost 12). Plaintext is never stored.
 *  - Sessions are stateless signed tokens in an httpOnly, SameSite=Lax cookie.
 *    The token is HMAC-SHA256 signed with SESSION_SECRET and contains an
 *    expiry, so an attacker cannot forge or extend a session.
 *  - Nothing is trusted from the client: every admin route, server action and
 *    API handler re-validates the session server-side via `requireAdmin`.
 *
 * There is no client-side-only "security". Hiding the admin URL is not a
 * control: /admin/* is protected by middleware AND by per-request checks.
 */

export const SESSION_COOKIE = "iw_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

/** A syntactically valid bcrypt hash used only to equalise failure timing. */
const WASTE_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEe.4Zx0m9QqJ7QF6nx0bI9Q3Yw8mJ3n1Ha";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is not configured. Set a long random value before running in production.",
    );
  }
  // Development fallback only — never used in production.
  return "insecure-development-session-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encodeToken(user: SessionUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeToken(token: string): SessionUser | null {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      sub?: string;
      email?: string;
      name?: string;
      role?: string;
      exp?: number;
    };
    if (!payload.sub || !payload.exp) return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      email: payload.email ?? "",
      name: payload.name ?? "",
      role: payload.role ?? "ADMIN",
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Password hashing                                                    */
/* ------------------------------------------------------------------ */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Session lifecycle                                                   */
/* ------------------------------------------------------------------ */

export async function createSession(user: SessionUser): Promise<void> {
  const token = encodeToken(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Read the current session without touching the database. */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return decodeToken(token);
  } catch {
    return null;
  }
}

/** Guard for admin server components and server actions. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login?reason=auth");
  return session;
}

/** Guard for API route handlers — returns null instead of redirecting. */
export async function requireAdminApi(): Promise<SessionUser | null> {
  return getSession();
}

/**
 * Verify credentials. Returns the user on success, null otherwise.
 * Deliberately does not reveal whether the email or the password was wrong.
 */
export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;
  const user = await prisma.adminUser.findUnique({ where: { email: normalized } });
  if (!user) {
    // Spend a comparable amount of work to reduce user-enumeration timing signal.
    try {
      await bcrypt.compare(password, WASTE_HASH);
    } catch {
      /* ignore — this branch never authenticates */
    }
    return null;
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/** Count of admin accounts — used by the first-run setup page. */
export async function adminUserCount(): Promise<number> {
  try {
    return await prisma.adminUser.count();
  } catch {
    return 0;
  }
}
