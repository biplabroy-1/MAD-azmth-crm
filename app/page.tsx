"use client";

import { motion } from "framer-motion";
import { ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
            aria-label="Call to action buttons"
          >
            <StartFreeTrialButton className="bg-yellow-500 hover:bg-yellow-600 text-black" />
            <Button
              size="sm"
              variant="solid"
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              aria-label="See azmth in action demo"
            >
              See It in Action <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative mx-auto max-w-5xl mt-20"
        >
          <figure className="glass rounded-xl overflow-hidden">
            <Image
              src="/home.png"
              alt="azmth AI Call Management Dashboard"
              className="w-full h-auto"
              loading="eager"
              width={800}
              height={500}
            />
          </figure>
        </motion.div>
      </motion.section>
    </div>
  );
}
