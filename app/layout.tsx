import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "azmth cms | AI-powered Call Management System",
  description:
    "Streamline and automate your calling operations with Azmth. Schedule, analyze, and manage calls effortlessly using AI-driven tools.",
  keywords: [
    "call management",
    "AI calls",
    "automated calling",
    "Azmth",
    "Azmth cms",
    "Azmth crm",
    "Azmth dash",
    "Azmth dashboard",
    "schedule calls",
    "call analytics",
    "voice assistant",
    "telemarketing tool",
    "customer engagement",
    "call management system",
    "automated call system",
    "AI call scheduler",
    "call automation platform",
    "voice bot for calls",
    "AI calling tool",
    "call center automation",
    "telephony automation",
    "outbound call manager",
    "customer call automation",
    "voice assistant for calls",
    "bulk calling solution",
    "automated customer calls",
    "call follow-up system",
    "automated appointment reminders",
    "business call scheduler",
    "AI voice calling platform",
    "call tracking system",
    "smart call assistant",
    "automated lead calling",
    "intelligent call routing",
    "B2B call automation",
    "Azmth call software",
    "virtual telecaller",
    "IVR automation system",
    "AI-powered CRM calls",
  ],
  authors: [{ name: "Azmth Team", url: "https://dashboard.azmth.in" }],
  creator: "Azmth",
  publisher: "Azmth",
  metadataBase: new URL("https://dashboard.azmth.in"),
  openGraph: {
    title: "Azmth | AI Call Management System",
    description:
      "Manage, schedule, and track AI-powered calls with Azmth. Designed to simplify outbound call processes and improve engagement.",
    url: "https://dashboard.azmth.in",
    siteName: "Azmth",
    images: [
      {
        url: "/azmth-og.svg", // Ensure this file exists in `public/`
        width: 1200,
        height: 630,
        alt: "Azmth Call Management Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Azmth | Call Automation Platform",
    description:
      "Automate your business calls with Azmth. Schedule and manage calls easily using AI.",
    site: "@azmthai", // your Twitter handle
    creator: "@azmthai",
    images: ["/azmth-og.svg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="flex justify-between items-center h-16">
              <Toaster />
              <SpeedInsights />
              <Analytics />
              <NavBar />
            </header>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
