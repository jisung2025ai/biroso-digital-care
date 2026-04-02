import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // /admin/* → ADMIN, STAFF만 허용
    if (path.startsWith("/admin") && role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.redirect(new URL("/guardian", req.url));
    }

    // /guardian/* → GUARDIAN만 허용 (ADMIN/STAFF는 /admin으로)
    if (path.startsWith("/guardian") && (role === "ADMIN" || role === "STAFF")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // / → STAFF, ADMIN만 허용
    if (path === "/" && role !== "STAFF" && role !== "ADMIN") {
      if (role === "GUARDIAN") return NextResponse.redirect(new URL("/guardian", req.url));
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/", "/admin/:path*", "/guardian/:path*"],
};
