import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// No public routes: everything requires auth
const isPublicRoute = createRouteMatcher([]);

export default clerkMiddleware({
  afterAuth(auth, req) {
    if (!isPublicRoute(req) && !auth.userId) {
      return auth.redirectToSignIn();
    }
  },
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};


