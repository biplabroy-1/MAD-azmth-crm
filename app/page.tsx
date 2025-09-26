"use client";

import { motion } from "framer-motion";
import { ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import StartFreeTrialButton from "@/components/home-page/IslogedIn";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="min-h-screen bg-black text-foreground relative">
      {/* Top-left logo */}
      <div className="absolute top-4 left-4 z-50">
        <Image
          src="/mad_logo.jpg"
          alt="Mad Logo"
          width={100}
          height={50}
          className="object-contain"
        />
      </div>
=======
import Navigation from "@/components/home-page/Navigation";
import { FeaturesSection } from "@/components/home-page/features/FeaturesSection";
import { PricingSection } from "@/components/home-page/pricing/PricingSection";
import WhyAzmthSection from "@/components/home-page/WhyAzmthSection";
import RoadmapSection from "@/components/home-page/RoadmapSection";
import TeamSection from "@/components/home-page/TeamSection";
import Footer from "@/components/home-page/Footer";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import WaitlistModal from "@/components/home-page/WaitlistModal";
import UseCasesSection from "@/components/home-page/UseCasesSection";
import StartFreeTrialButton from "@/components/home-page/IslogedIn";
import Image from "next/image";


export default function Index() {
  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navigation />
>>>>>>> cb1198958f258e2df4dc0c2527d602cec008ae5a

      {/* Hero Section */}
      <motion.section
        id="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative container px-4 pt-40 pb-20 mx-auto"
        aria-label="Hero section introducing azmth AI call management"
        itemScope
        itemType="https://schema.org/SoftwareApplication"
      >
        <meta itemProp="name" content="azmth AI Call Management" />
        <meta
          itemProp="description"
          content="Revolutionary AI call management platform that automatically handles, routes, and follows up on calls"
        />
        <meta itemProp="applicationCategory" content="BusinessApplication" />
        <meta itemProp="operatingSystem" content="Web Browser" />
<<<<<<< HEAD

        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-[#0A0A0A]" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full glass "
        >
          <span className="text-sm font-medium">
            <Command className="w-4 h-4 inline-block mr-2" />
            Now accepting early access teams!
          </span>
        </motion.div>

        <header className="max-w-4xl relative z-10">
          <h1
            className="text-5xl md:text-7xl font-normal mb-4 tracking-tight text-left"
            itemProp="headline"
          >
            <span className="text-gray-200">
              <TextGenerateEffect words="AI-Powered Call" />
            </span>
            <br />
            <span className="text-white font-medium">
              <TextGenerateEffect words="Management, Reinvented" />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl text-left"
            itemProp="description"
          >
            Answer, route, schedule, and follow-up on calls — fully automated
            and voice-first.{" "}
            <span className="text-white">
              Built for teams that can't afford to miss opportunities.
            </span>
          </motion.p>

=======
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-[#0A0A0A]" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full glass "
        >
          <span className="text-sm font-medium">
            <Command className="w-4 h-4 inline-block mr-2" />
            Now accepting early access teams!
          </span>
        </motion.div>

        <header className="max-w-4xl relative z-10">
          <h1
            className="text-5xl md:text-7xl font-normal mb-4 tracking-tight text-left"
            itemProp="headline"
          >
            <span className="text-gray-200">
              <TextGenerateEffect words="AI-Powered Call" />
            </span>
            <br />
            <span className="text-white font-medium">
              <TextGenerateEffect words="Management, Reinvented" />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl text-left"
            itemProp="description"
          >
            Answer, route, schedule, and follow-up on calls — fully automated
            and voice-first.{" "}
            <span className="text-white">
              Built for teams that can't afford to miss opportunities.
            </span>
          </motion.p>

>>>>>>> cb1198958f258e2df4dc0c2527d602cec008ae5a
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
            aria-label="Call to action buttons"
          >
<<<<<<< HEAD
            <StartFreeTrialButton className="bg-yellow-500 hover:bg-yellow-600 text-black" />
            <Button
              size="sm"
              variant="solid"
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
=======
            <StartFreeTrialButton />
            <Button
              size="lg"
              variant="link"
              className="text-white"
>>>>>>> cb1198958f258e2df4dc0c2527d602cec008ae5a
              aria-label="See azmth in action demo"
            >
              See It in Action <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
<<<<<<< HEAD
          animate={{ opacity: 1 }}
=======
          animate={{ opacity: 1, y: 0 }}
>>>>>>> cb1198958f258e2df4dc0c2527d602cec008ae5a
          transition={{ delay: 0.6 }}
          className="relative mx-auto max-w-5xl mt-20"
        >
          <figure className="glass rounded-xl overflow-hidden">
            <Image
              src="/home.png"
<<<<<<< HEAD
              alt="azmth AI Call Management Dashboard"
              className="w-full h-auto"
              loading="eager"
              width={800}
              height={500}
            />
          </figure>
        </motion.div>
      </motion.section>
=======
              alt="azmth AI Call Management Dashboard showing call analytics, voice agent settings, and real-time call monitoring interface"
              className="w-full h-auto"
              loading="eager"
              width="800"
              height="500"
            />
            <figcaption className="sr-only">
              Screenshot of azmth AI assistant dashboard displaying call
              management features, analytics, and voice agent configuration
            </figcaption>
          </figure>
        </motion.div>
      </motion.section>

      {/* Why azmth Section */}
      <section aria-label="Why choose azmth for call management">
        <WhyAzmthSection />
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-black"
        aria-label="azmth product features and capabilities"
      >
        <FeaturesSection />
      </section>

      {/* Use Cases Section */}
      <section
        id="use-cases"
        className="bg-black"
        aria-label="Call management use cases and applications"
      >
        <UseCasesSection />
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        className="bg-black"
        aria-label="azmth product roadmap and future features"
      >
        <RoadmapSection />
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="bg-black"
        aria-label="azmth pricing plans and subscription options"
      >
        <PricingSection />
      </section>

      {/* Team Section */}
      <section id="team" className="bg-black" aria-label="Meet the azmth team">
        <TeamSection />
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        className="container px-4 py-20 relative bg-black  mx-auto"
        aria-label="Join azmth waitlist call to action"
      >
        <div className="absolute inset-0 opacity-40  mx-auto" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0A0A0A]/80 backdrop-blur-lg border  border-white/10 rounded-2xl p-8 md:p-12 text-center relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't miss another opportunity. Let your AI handle it. 💫
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the waitlist and be among the first to experience AI-powered
            call management that actually works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WaitlistModal>
              {/* <Button
                size="lg"
                className="button-gradient"
                aria-label="Join azmth waitlist for early access"
              >
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button> */}
            <StartFreeTrialButton />
            </WaitlistModal>
            <WaitlistModal>
              <Button
                size="sm"
                variant="outline"
                className="glass"
                aria-label="Talk to azmth sales team"
              >
                Talk to Sales
              </Button>
            </WaitlistModal>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-black">
        <Footer />
      </footer>
>>>>>>> cb1198958f258e2df4dc0c2527d602cec008ae5a
    </div>
  );
}




