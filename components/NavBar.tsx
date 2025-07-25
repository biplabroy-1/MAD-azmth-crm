"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const links = [
    { href: "/", label: "Home" },
    { href: "/schedule", label: "Schedule Calls" },
    { href: "/create-call", label: "Create Calls" },
    { href: "/analytics", label: "Analytics" },
    { href: "/call-records", label: "Call Records" },
  ];

  return (
    <nav className="flex w-screen items-center justify-between px-6 py-3 shadow-sm border-b">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <img src="/azmth.svg" alt="Azmth Logo" className="h-8 w-auto" />
      </div>

      {/* Center: Nav Links */}
      <div className="flex gap-3 justify-center flex-1">
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
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
