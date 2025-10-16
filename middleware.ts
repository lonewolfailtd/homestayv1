import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/api/webhooks(.*)",
    "/api/pricing/calculate",
    "/api/customers",
    "/api/booking/submit",
    "/api/xero(.*)",
    "/api/gohighlevel(.*)",
    "/pricing",
    "/about",
    "/contact"
  ],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: [
    "/api/pricing/calculate",
    "/api/customers",
    "/api/xero/auth",
    "/api/xero/callback"
  ]
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};