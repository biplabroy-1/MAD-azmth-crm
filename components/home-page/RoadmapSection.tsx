"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";

const slideData = [
  {
    quarter: "Q3 2025",
    title: "Beta Launch",
    description:
      "Twilio Integration, CRM Sync — Core call handling, intelligent routing, and advanced communication features.",
    status: "upcoming",
    img: "/image 34.png",
  },
  {
    quarter: "Q4 2025",
    title: "Advanced AI Features",
    description:
      "Voice Cloning, Team Routing, Dashboard Analytics — Enhanced personalization and insights",
    status: "upcoming",
    img: "/image 19.png",
  },
  {
    quarter: "Q1 2026",
    title: "Global Expansion",
    description:
      "International Expansion, Call Translation, Role-Based Agent Assignment — Scale globally",
    status: "future",
    img: "/image 13.png",
  },
  {
    quarter: "Q2 2026",
    title: "Enterprise Features",
    description:
      "AI Coaching for Agents, Predictive Routing, Multi-Agent Parallel Calls — Enterprise-ready",
    status: "future",
    img: "/image 41.png",
  },
];

const RoadmapSection = () => {
  const [current, setCurrent] = useState(0);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const dragLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const maxSlides = slideData.length;
  const dragLineCount = maxSlides * 10;

  const updateDragLines = (hoveredIndex: number) => {
    if (!thumbnailContainerRef.current) return;

    const containerWidth = thumbnailContainerRef.current.offsetWidth;
    const thumbWidth = containerWidth / maxSlides;
    const lineWidth = containerWidth / dragLineCount;
    const centerPosition = (hoveredIndex + 0.5) * thumbWidth;

    dragLinesRef.current.forEach((line, i) => {
      const linePosition = (i + 0.5) * lineWidth;
      const distFromCenter = Math.abs(linePosition - centerPosition);
      const maxDistance = thumbWidth * 0.8;

      if (distFromCenter <= maxDistance) {
        const normalizedDist = distFromCenter / maxDistance;
        const waveHeight = Math.cos((normalizedDist * Math.PI) / 2);
        const height = 15 + waveHeight * 35;
        const opacity = 0.3 + waveHeight * 0.4;

        if (line) {
          line.style.height = `${height}px`;
          line.style.backgroundColor = `rgba(255,255,255,${opacity})`;
        }
      } else {
        if (line) {
          line.style.height = `15px`;
          line.style.backgroundColor = `rgba(255,255,255,0.3)`;
        }
      }
    });
  };

  useEffect(() => {
    if (slidesRef.current[current]) {
      gsap.set(slidesRef.current[current], { zIndex: 10 });
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCurrent((prev) => (prev + 1) % maxSlides);
      if (e.key === "ArrowLeft")
        setCurrent((prev) => (prev - 1 + maxSlides) % maxSlides);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current]);

  useEffect(() => {
    updateDragLines(current);
    const handleResize = () => updateDragLines(current);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [current]);

  useEffect(() => {
    updateDragLines(current);
    const handleResize = () => updateDragLines(current);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative bg-black text-white w-full overflow-hidden py-16">
      {/* Heading ABOVE the image section */}
      <div className="w-full max-w-[1200px] mx-auto px-4 text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-normal mb-6">Our Roadmap</h2>
          <p className="text-neutral-300 text-base md:text-lg max-w-xl mx-auto">
            See what's coming next in our journey to build the ultimate AI
            assistant
          </p>
        </motion.div>
      </div>

      <div className="w-full h-[75vh] sm:h-screen relative">
        {/* Background Slides */}
        <div className="absolute inset-0 grid place-items-center">
          {slideData.map((slide, i) => (
            <div
              key={i}
              ref={(el) => {slidesRef.current[i] = el}}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.img}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                style={{
                  opacity: 0.7,
                  mixBlendMode: "overlay",
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom Overlay */}
        <div className="absolute border rounded-2xl border-white/5 pt-3 bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[1200px] z-10 pb-4 px-4 flex flex-col items-center bg-black/50 backdrop-blur-sm">
          {/* Quarter + Status */}
          <div className="uppercase text-xs tracking-widest text-neutral-400 mb-2">
            {slideData[current].quarter} &nbsp; • &nbsp;{" "}
            {slideData[current].status}
          </div>

          {/* Title */}
          <div className="text-3xl md:text-4xl font-semibold text-center mb-2 leading-tight tracking-tight">
            {slideData[current].title}
          </div>

          {/* Description */}
          <div className="text-sm md:text-base text-center text-neutral-300 max-w-xl mb-3">
            {slideData[current].description}
          </div>

          {/* Wave Effect */}
          <div className="w-full h-[60px] pointer-events-none mb-3 relative">
            <div className="flex h-full w-full items-end justify-between">
              {[...Array(dragLineCount)].map((_, i) => (
                <div
                  key={i}
                  ref={(el) => {dragLinesRef.current[i] = el}}
                  className="w-[2px] bg-white/30 h-[15px] transition-all duration-500 origin-bottom"
                />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          <div
            ref={thumbnailContainerRef}
            className="w-full bg-black/60 overflow-hidden border border-white/10 rounded-xl"
          >
            <div className="flex w-full">
              {slideData.map((slide, i) => (
                <div
                  key={i}
                  onMouseEnter={() => {
                    updateDragLines(i);
                    setCurrent(i);
                  }}
                  className="relative h-[100px] md:h-[140px] cursor-pointer transition-all duration-300 hover:opacity-75"
                  style={{ width: `${100 / maxSlides}%` }}
                >
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
                      i === current ? "opacity-100" : "opacity-35"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
