import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const isAuth = !!token;

        // console.log(`[MIDDLEWARE] Accessing: ${path}, Authenticated: ${isAuth}, Role: ${token?.role || 'NONE'}`);

        // TODO: Re-enable admin protection before production.
        // Temporarily bypassing admin routes for development.
        if (path.startsWith("/admin")) {
            return null;
        }

        /* 
        // Admin Routes Protection (DISABLED FOR DEV)
        if (path.startsWith("/admin")) {
            // Allow access to admin login page even if not authenticated
            if (path === "/admin/login") {
                if (isAuth && token.role === "ADMIN") {
                    console.log(`[MIDDLEWARE] Admin already logged in, redirecting to /admin`);
                    return NextResponse.redirect(new URL("/admin", req.url));
                }
                return null;
            }

            // Redirect to admin login if no session
            if (!isAuth) {
                console.log(`[MIDDLEWARE] No session for admin route, redirecting to /admin/login`);
                return NextResponse.redirect(new URL("/admin/login", req.url));
            }

            // Note: We used to redirect non-admins to "/" here, but now we let them through
            // so the AdminLayout can show a dedicated "Access Denied" page.
        }
        */

        // User Sign-in Page Redirect
        if (path.startsWith("/auth/signin")) {
            if (isAuth) {
                const target = token.role === "ADMIN" ? "/admin" : "/";
                // console.log(`[MIDDLEWARE] Already authenticated as ${token.role}, redirecting to ${target}`);
                return NextResponse.redirect(new URL(target, req.url));
            }
        }
    },
    {
        callbacks: {
            // We return true here and handle logic inside the middleware function
            // to allow custom redirects for different paths
            authorized: () => true,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/auth/signin"],
};
