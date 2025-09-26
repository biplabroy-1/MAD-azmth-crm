"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "@/components/NavBar";

export const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[url('/mad_bg.jpg')] bg-cover bg-fixed">
        <NavBar />
        {children}
      </div>
    </QueryClientProvider>
  );
}
