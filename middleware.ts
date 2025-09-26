import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClerkClient } from '@clerk/backend'

// Create a Clerk backend instance
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY environment variable is not set. Please set it in your environment.");
}
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/subscribe",
  "/sitemap.xml",
  "/robots.txt"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  // Not logged in & not public → sign in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // Fetch full user from backend if logged in
  let user = null
  if (userId) {
    user = await clerkClient.users.getUser(userId)
  }

  // If onboarding not complete → force to /onboarding
  if (user && !user.publicMetadata?.onboardingComplete && req.nextUrl.pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml)).*)',
    '/(api|trpc)(.*)',
  ],
}
