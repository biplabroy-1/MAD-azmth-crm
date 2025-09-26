import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function SeeItInAction() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  if (isSignedIn) {
    return (
      <Button
        size="sm"
        className="button-gradient"
        onClick={() => router.push("/dashboard")}
      >
        Dashboard
      </Button>
    );
  }

  return (
    <SignUpButton mode="redirect">
      <div>
        <Button
          size="sm"
          variant="ghost"
          className="text-white border"
          aria-label="See azmth in action demo"
        >
          Start Free Trial
        </Button>
      </div>
    </SignUpButton>
  );
}
