// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { Button } from "../ui/button";
// import WaitlistModal from "./WaitlistModal";

// export default function StartFreeTrialButton() {
//   const { isSignedIn } = useUser();
//   const router = useRouter();

//   if (isSignedIn) {
//     return (
//       <Button
//         size="sm"
//         className="button-gradient"
//         onClick={() => router.push("/dashboard")}
//       >
//         Dashboard
//       </Button>
//     );
//   }

//   // Commented out original free trial button
//   /* return (
//     <SignUpButton mode="redirect">
//       <div>
//         <Button size="lg" className="button-gradient">
//           Start Free Trial
//         </Button>
//       </div>
//     </SignUpButton>
//   ); */

//   return (
//     <WaitlistModal>
//       <Button size="sm" className="button-gradient text-xs">
//         Start Free Trial
//       </Button>
//     </WaitlistModal>
//   );
// }


// login

import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function StartFreeTrialButton() {
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
    <SignUpButton mode="modal">
      <div>
        <Button size="sm" className="button-gradient">
          Start Trial Now
        </Button>
      </div>
    </SignUpButton>
  );
}
