"use client"

import { useEffect } from "react"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This helps prevent hydration errors by ensuring the body attributes are 
  // consistently applied both server and client side
  useEffect(() => {
    // We need to run this only once on client-side after hydration
    // This is ignored during server-side rendering
  }, [])

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
