import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "./CardSpotlight";
import WaitlistModal from "@/components/home-page/WaitlistModal";

const PricingTier = ({
  name,
  price,
  description,
  features,
  isPopular,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}) => (
  <CardSpotlight
    className={`h-full ${isPopular ? "" : "border-white/10"} border-2`}
  >
    <div className="relative h-full p-6 flex flex-col">
      {isPopular && (
        <span className="text-xs font-medium   rounded-full px-3 py-1 w-fit mb-4">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-medium mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold">{price}</span>
        {price !== "Custom" && <span className="text-gray-400">/month</span>}
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="w-5 h-5 " />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <WaitlistModal>
        <Button className="button-gradient w-full">Join Waitlist</Button>
      </WaitlistModal>
    </div>
  </CardSpotlight>
);

export const PricingSection = () => {
  return (
    <section className="container px-4 py-16 mx-auto">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-normal mb-6"
        >
          Choose Your <span className="text-gradient font-medium">Plan</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-lg text-gray-400"
        >
          Scale your call management from startup to enterprise
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingTier
          name="Starter"
          price="$0"
          description="Perfect for small teams testing AI call management"
          features={[
            "15 AI call minutes",
            "Simple voice transcription",
            "Email integration",
            "Basic support",
          ]}
        />
        <PricingTier
          name="Pro"
          price="$49"
          description="Advanced features for growing businesses"
          features={[
            "500 AI call minutes",
            "CRM integrations",
            "Real-time transcription",
            "Call analytics & scoring",
            "Custom voice agents",
            "Priority support",
          ]}
          isPopular
        />
        <PricingTier
          name="Enterprise"
          price="Custom"
          description="Unlimited volume with white-label and onboarding"
          features={[
            "Unlimited AI call minutes",
            "White-label solution",
            "Dedicated onboarding",
            "Advanced security & compliance",
            "Custom voice cloning",
            "24/7 dedicated support",
          ]}
        />
      </div>
    </section>
  );
};
