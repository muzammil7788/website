import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

const SESSION_COOKIE = "website_session";

function getSecret() {
  const secret = process.env.APP_SECRET || "dev-only-insecure-secret";
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function verifySession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
}

export async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export const getCurrentUserId = cache(async () => {
  const token = await getSessionToken();
  return verifySession(token);
});