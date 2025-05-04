import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  // List of protected routes
  const protectedRoutes = [
    '/dashboard',
    '/call-records',
    '/create-call',
  ];
  
  // Check if the current path matches any protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname === route || 
    req.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  // Allow access to unprotected routes (like root '/')
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // For protected routes, the default clerk middleware will handle authentication
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};