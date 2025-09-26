"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import Image from "next/image";
import StartFreeTrialButton from "./IslogedIn";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "testimonials") {
      const testimonialSection = document.querySelector(".animate-marquee");
      if (testimonialSection) {
        const yOffset = -100;
        const y =
          testimonialSection.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else if (sectionId === "cta") {
      const ctaSection = document.querySelector(".button-gradient");
      if (ctaSection) {
        const yOffset = -100;
        const y =
          ctaSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems = [
    {
      name: "Features",
      href: "#features",
      onClick: () => scrollToSection("features"),
    },
    {
      name: "Use Cases",
      href: "#use-cases",
      onClick: () => scrollToSection("use-cases"),
    },
    {
      name: "Roadmap",
      href: "#roadmap",
      onClick: () => scrollToSection("roadmap"),
    },
    {
      name: "Pricing",
      href: "#pricing",
      onClick: () => scrollToSection("pricing"),
    },
    {
      name: "Team",
      href: "#team",
      onClick: () => scrollToSection("team"),
    },
    {
      name: "Contact Us",
      href: "mailto:contact@azmth.in",
    },
  ];

  return (
    <header
      className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-xl ${
        isScrolled
          ? "h-14 bg-[#1B1B1B]/40 backdrop-blur-xl border border-white/10 scale-95 w-[90%] max-w-2xl"
          : "h-14 bg-[#1B1B1B] w-[95%] max-w-3xl"
      }`}
    >
      <div className="mx-auto h-full px-6">
        <nav className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <Image
              height={200}
              width={200}
              src="/azmth-light.svg"
              alt="Azmth Logo"
              className="h-4 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (!item.href.startsWith("mailto:")) {
                    e.preventDefault();
                    if (item.onClick) {
                      item.onClick();
                    }
                  }
                }}
                className={cn(
                  isScrolled ? "text-xs" : "text-sm",
                  "text-muted-foreground hover:text-foreground transition-all duration-300"
                )}
              >
                {item.name}
              </a>
            ))}
            <StartFreeTrialButton />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="glass">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#1B1B1B]">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={cn(
                        isScrolled ? "text-xs" : "text-lg",
                        "text-muted-foreground hover:text-foreground transition-colors"
                      )}
                      onClick={(e) => {
                        if (!item.href.startsWith("mailto:")) {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          if (item.onClick) {
                            item.onClick();
                          }
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                  {/* <WaitlistModal>
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                      }}
                      className="button-gradient mt-4"
                    >
                      Join Waitlist
                    </Button>
                  </WaitlistModal> */}
                  {/* <SeeItInAction /> */}
                  <StartFreeTrialButton/>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
