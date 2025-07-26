import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const session = req.nextauth.token;

    // Simple admin routes protection
    if (pathname.startsWith("/admin_ipnu") || pathname.startsWith("/admin_ippnu")) {
      if (!session) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Basic role-based access control
      const userOrg = session.org || '';
      const userRole = session.role || '';
      
      // Superadmin can access everything
      if (userRole === 'superadmin') {
        return NextResponse.next();
      }
      
      // Check organization access
      if (pathname.startsWith("/admin_ipnu") && userOrg !== 'ipnu') {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      
      if (pathname.startsWith("/admin_ippnu") && userOrg !== 'ippnu') {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
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
  matcher: [
    "/admin_ipnu/:path*", 
    "/admin_ippnu/:path*"
  ],
};
