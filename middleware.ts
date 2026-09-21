import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "website_session";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

async function isValid(token: string | undefined) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(
      process.env.APP_SECRET || "dev-only-insecure-secret"
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!(await isValid(token))) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};