"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

const teamMembers = [
  {
    name: "Dron Guin",
    role: "Founder, CTO",
    image:
      "/dron.jpg",
    initials: "DG",
  },
  {
    name: "Priyanshu Singh",
    role: "Co-founder, CEO",
    image:
      "/priyanshu.jpg",
    initials: "PS",
  },
  {
    name: "Biplab Roy",
    role: "Tech Lead, DevOps Engineer",
    image:"/biplab.jpg",
    initials: "BR",
  },
  {
    name: "Uddipan Chokroborty",
    role: "ML Engineer",
    image:
      "/uddipan.jpg",
    initials: "UC",
  },
  {
    name: "Soumyajit Khan",
    role: "Full Stack Developer",
    image:
      "/soumyajit.jpg",
    initials: "SK",
  },
  {
    name: "Apurba Pal",
    role: "Front-End Developer",
    image:
      "/apurba_2.png",
    initials: "AP",
  },
  {
    name: "Sidharth Kumar Sharma",
    role: "AI Engineer",
    image:
      "/siddharth.png",
    initials: "SS",
  },
  {
    name: "Abhirup Mitra",
    role: "UX Engineer",
    image:
      "/abhirup_2.jpg",
    initials: "AM",
  },
  {
    name: "Arnob Biswas",
    role: "Cinematographer",
    image:
      "/arnab.jpg",
    initials: "AB",
  },
  {
    name: "Ayan Seal",
    role: "Content Writer",
    image:
      "/ayan.jpg",
    initials: "AS",
  },
];

const TeamSection = () => {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const displayMember = hovered !== null ? hovered : selected;

  const checkVerticalScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setAtTop(scrollTop === 0);
    setAtBottom(scrollTop + clientHeight >= scrollHeight - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkVerticalScroll);
    checkVerticalScroll();
    return () => el.removeEventListener("scroll", checkVerticalScroll);
  }, []);

  // Mobile swipe handlers (0-639px)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (selected < teamMembers.length - 1) setSelected((prev) => prev + 1);
    },
    onSwipedRight: () => {
      if (selected > 0) setSelected((prev) => prev - 1);
    },
    delta: 30, // minimum distance(px) to trigger
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <section className="bg-black py-10 text-white">
      <div className="max-w-[1300px] mx-auto px-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-normal mb-4 tracking-wide">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            The brilliant minds building the future of AI assistance
          </p>
        </motion.div>

        <div className="flex flex-col-reverse sm:flex-row sm:h-[520px] lg:h-[600px] rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-sm">
          {/* Left Side - Image and Role */}
          <div className="w-full sm:w-[55%] md:w-[50%] lg:w-[55%] flex flex-col items-center justify-center p-0 sm:py-4 lg:p-6">
            <div
              {...swipeHandlers}
              className="w-[90%] h-[380px] sm:h-[300px] md:h-[330px] lg:h-[400px] overflow-hidden rounded-xl"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={displayMember}
                  src={teamMembers[displayMember].image}
                  alt={teamMembers[displayMember].name}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="w-full h-full object-cover rounded-xl transition duration-200"
                />
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`details-${displayMember}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="mt-4 sm:mt-4 flex items-center justify-between w-full px-[5%]"
              >
                <p className="text-xl sm:text-base md:text-xl font-bold uppercase tracking-wider">
                  {teamMembers[displayMember].name}
                </p>
                <p className="text-sm sm:text-sm text-gray-400 uppercase tracking-wide">
                  ({teamMembers[displayMember].role})
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side - List */}
          <div className="hidden sm:flex flex-col items-center justify-center px-2 sm:px-3 md:px-6 w-[92.5%] mx-auto sm:mx-0 sm:h-[85%] md:h-full sm:w-[45%] md:w-[50%] lg:w-[45%] relative">
            {!atTop && (
              <button
                type="button"
                onClick={() =>
                  scrollRef.current?.scrollBy({ top: -100, behavior: "smooth" })
                }
                className="absolute top-2 z-10 opacity-80 hover:opacity-100"
              >
                <svg width="60" height="14" viewBox="0 0 60 14" fill="none">
                  <path
                    d="M2 12L30 2L58 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            {!atBottom && (
              <button
                type="button"
                onClick={() =>
                  scrollRef.current?.scrollBy({ top: 100, behavior: "smooth" })
                }
                className="absolute bottom-2 z-10 opacity-80 hover:opacity-100"
              >
                <svg width="60" height="14" viewBox="0 0 60 14" fill="none">
                  <path
                    d="M2 2L30 12L58 2"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <div
              ref={scrollRef}
              className="w-full overflow-x-auto sm:overflow-y-auto no-scrollbar flex sm:flex-col items-start justify-start space-x-6 sm:space-x-0 sm:space-y-2 py-2 px-4 sm:h-[340px] md:h-[440px] lg:h-[500px]"
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  onClick={() => setSelected(index)}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  className={`cursor-pointer text-lg sm:text-[26px] md:text-2xl lg:text-3xl font-extrabold uppercase tracking-tight leading-snug transition-all duration-300 whitespace-nowrap ${
                    index === selected
                      ? "text-gray-500 border-b-2 border-white pb-1"
                      : "text-white hover:text-gray-300 hover:translate-x-2"
                  }`}
                >
                  <span className="block sm:hidden">
                    {member.name.split(" ")[0]}
                  </span>
                  <span className="hidden sm:inline">{member.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
