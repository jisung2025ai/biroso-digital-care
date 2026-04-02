import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 관리자 전용 경로 보호 (ADMIN, STAFF 허용)
    if (path.startsWith("/admin") && token?.role !== "ADMIN" && token?.role !== "STAFF") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 종사자/관리자 공동 경로 (기록 앱)
    if (path === "/" && !(token?.role === "STAFF" || token?.role === "ADMIN")) {
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
  matcher: ["/", "/admin/:path*"],
};
