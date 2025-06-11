import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const session = req.nextauth.token;

    if (pathname.startsWith("/admin_ipnu") || pathname.startsWith("/admin_ippnu")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Optional: Add role-based checks here if needed
      // For example, to check if the user has an 'admin' role:
      // if (session.role !== 'admin') {
      //   return NextResponse.redirect(new URL('/unauthorized', req.url));
      // }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin_ipnu/:path*", "/admin_ippnu/:path*"],
};
