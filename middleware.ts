import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        // /demo/* is always public — no login required
        if (req.nextUrl.pathname.startsWith("/demo")) return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!login|signup|demo|api/auth|api/gcal|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
