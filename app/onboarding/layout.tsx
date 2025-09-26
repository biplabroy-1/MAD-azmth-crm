import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if ((await currentUser())?.publicMetadata?.onboardingComplete === true) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
