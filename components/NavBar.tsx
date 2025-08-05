"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense, lazy, useMemo } from "react";
import Image from "next/image";

// Lazy-load Clerk components for faster paint
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

export default function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const links = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/schedule", label: "Schedule Calls" },
      { href: "/create-call", label: "Create Calls" },
      { href: "/analytics", label: "Analytics" },
      { href: "/call-records", label: "Call Records" },
    ],
    []
  );

  const logoSrc = theme === "dark" ? "/azmth-light.svg" : "/azmth.svg";

  return (
    <nav className="flex w-screen items-center justify-between px-6 py-3 shadow-sm border-b">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <Image width={200} height={200} src={logoSrc} alt="Azmth Logo" className="h-8 w-auto" />
      </div>

      {/* Center: Navigation Links */}
      <div className="flex gap-3 justify-center flex-1">
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

      {/* Right: Theme Toggle + Auth */}
      <div className="flex items-center gap-2">
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

        {/* Fixed-width wrapper to prevent layout shift */}
        <div className="flex items-center gap-2 min-w-[140px] justify-end">
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
              <div className="w-[40px] h-[40px] flex justify-center items-center  ">
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
      </div>
    </nav>
  );
}
