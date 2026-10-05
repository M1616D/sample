import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware guard for /admin.
 *
 * This is DEFENCE IN DEPTH, not the only control: the admin layout and every
 * admin server action independently re-validate the session server-side. The
 * middleware only performs a cheap signature + expiry check so an anonymous
 * visitor is redirected before any admin work happens.
 *
 * The token format matches src/server/auth.ts: "<base64url-json>.<hmac-base64url>".
 */

const SESSION_COOKIE = "iw_session";

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

async function isValidToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const expected = base64url(new Uint8Array(mac));

    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    if (diff !== 0) return false;

    const payload = JSON.parse(decodeBase64url(body)) as { sub?: string; exp?: number };
    if (!payload.sub || !payload.exp) return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The login page must be reachable while signed out.
  if (pathname === "/admin/login") return NextResponse.next();

  const secret =
    process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
      ? process.env.SESSION_SECRET
      : "insecure-development-session-secret";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await isValidToken(token, secret)) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("reason", "auth");
  if (pathname !== "/admin") loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
