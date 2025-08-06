"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Suspense, lazy, useMemo } from "react";
import Image from "next/image";

// Lazy-load Clerk components
const SignedIn = lazy(() =>
  import("@clerk/nextjs").then((mod) => ({ default: mod.SignedIn }))
);
const SignedOut = lazy(() =>
  import("@clerk/nextjs").then((mod) => ({ default: mod.SignedOut }))
);
const SignInButton = lazy(() =>
  import("@clerk/nextjs").then((mod) => ({ default: mod.SignInButton }))
);
const SignUpButton = lazy(() =>
  import("@clerk/nextjs").then((mod) => ({ default: mod.SignUpButton }))
);
const UserButton = lazy(() =>
  import("@clerk/nextjs").then((mod) => ({ default: mod.UserButton }))
);
const SignOutButton = lazy(() =>
  import("@clerk/nextjs").then((mod) => ({ default: mod.SignOutButton }))
);

export default function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const links = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/dashboard/schedule", label: "Schedule Calls" },
      { href: "/dashboard/create-call", label: "Create Calls" },
      { href: "/dashboard/analytics", label: "Analytics" },
      { href: "/dashboard/call-records", label: "Call Records" },
    ],
    []
  );

  const logoSrc = theme === "dark" ? "/azmth-light.svg" : "/azmth.svg";

  return (
    <nav className="w-full px-4 py-3 shadow-sm border-b flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Image
          width={200}
          height={200}
          src={logoSrc}
          alt="Azmth Logo"
          className="h-8 w-auto"
        />
      </div>

      {/* Center: Nav Links (desktop only) */}
      <div className="hidden md:flex gap-3 justify-center flex-1">
        <Suspense fallback={null}>
          <SignedIn>
            {links.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </SignedIn>
        </Suspense>
      </div>

      {/* Right: Theme toggle + Auth + Hamburger */}
      <div className="flex items-center gap-2">
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2 min-w-[140px] justify-end">
          <Suspense
            fallback={
              <div className="flex items-center gap-2">
                <div className="w-[72px] h-[32px] bg-muted rounded-md animate-pulse" />
                <div className="w-[72px] h-[32px] border border-muted bg-transparent rounded-md animate-pulse" />
              </div>
            }
          >
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <div className="w-[40px] h-[40px] flex justify-center items-center">
                <Suspense
                  fallback={
                    <div className="w-full h-full rounded-full bg-muted animate-pulse" />
                  }
                >
                  <UserButton />
                </Suspense>
              </div>
            </SignedIn>
          </Suspense>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Theme</span>
        </Button>

        {/* Mobile Hamburger Menu with Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[250px]">
            <div className="flex flex-col gap-4 mt-4">
              {/* Mobile Nav Links */}
              <SignedIn>
                {links.map(({ href, label }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`py-2 px-3 rounded-md text-sm ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:text-primary hover:bg-accent"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </SignedIn>

              <Suspense fallback={null}>
                {/* Mobile Auth Actions */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="secondary" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="outline" className="w-full">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <div className="flex flex-col gap-2 mt-4">
                    {/* <UserButton /> */}
                    <Suspense
                      fallback={
                        <div className="w-full h-8 bg-muted rounded animate-pulse" />
                      }
                    >
                      <SignOutButton>
                        <Button variant="destructive" className="w-full">
                          Sign Out
                        </Button>
                      </SignOutButton>
                    </Suspense>
                  </div>
                </SignedIn>
              </Suspense>
            </div>
          </SheetContent>
        <div className="md:hidden mt-4">
          <Suspense fallback={<div className="w-full h-8 bg-muted rounded animate-pulse" />}>
            <UserButton />
          </Suspense>
        </div>
        </Sheet>
      </div>
    </nav>
  );
}
