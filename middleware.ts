import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always public — no auth check
  if (
    pathname.startsWith("/demo") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/gcal") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.includes("favicon") ||
    pathname.includes(".")          // static files
  ) {
    return NextResponse.next();
  }

  // Require auth for everything else
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
