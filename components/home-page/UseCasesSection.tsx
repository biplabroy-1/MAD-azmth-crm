import { motion } from "framer-motion";
import {
  Sparkles,
  Cpu,
  PenTool,
  Phone,
  BookOpen,
  Lightbulb,
  Compass,
} from "lucide-react";

const items = [
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "The Dawn of Innovation",
    desc: "Explore the birth of groundbreaking ideas and inventions.",
    span: "lg:col-span-1",
    mdSpan: "md:col-span-1",
    image:  "/image 12.jpg",
    position :"center",
  },
  {
    icon: <Cpu className="w-4 h-4" />,
    title: "The Digital Revolution",
    desc: "Dive into the transformative power of technology.",
    span: "lg:col-span-1",
    mdSpan: "md:col-span-1",
    image:  "/image 33.jpg",
    position :"center",
  },
  {
    icon: <PenTool className="w-4 h-4" />,
    title: "The Art of Design",
    desc: "Discover the beauty of thoughtful and functional design.",
    span: "lg:col-span-1",
    mdSpan: "md:col-span-1",
    image:  "/image 26.jpg",
    position :"center",
  },
  {
    icon: <Phone className="w-4 h-4" />,
    title: "The Power of Communication",
    desc: "Understand the impact of effective communication in our lives.",
    span: "lg:col-span-2",
    mdSpan: "md:col-span-1",
    image:  "https://silverlininglabs.com/wp-content/uploads/2025/07/front-page-image-sll-1024x558.png",
    position :"center",
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: "The Pursuit of Knowledge",
    desc: "Join the quest for understanding and enlightenment.",
    span: "lg:col-span-1",
    mdSpan: "md:col-span-1",
    image:  "/image 21.png",
    position :"top",
  },
  {
    icon: <Lightbulb className="w-4 h-4" />,
    title: "The Joy of Creation",
    desc: "Experience the thrill of bringing ideas to life.",
    span: "lg:col-span-1",
    mdSpan: "md:col-span-1",
    image:  "/image 42.png",
    position :"center",
  },
  {
    icon: <Compass className="w-4 h-4" />,
    title: "The Spirit of Adventure",
    desc: "Embark on exciting journeys and thrilling discoveries.",
    span: "lg:col-span-2",
    mdSpan: "md:col-span-2", 
    image:  "/image 27.png",
    position :"bottom",
  },
];

const UseCasesSection = () => {
  return (
    <section className="bg-black py-16 text-white">
      <div className="px-4 sm:px-4 md:px-8 lg:px-8 w-full max-w-full lg:max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-normal mb-6">
              Use <span className="text-gradient font-medium">Cases</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From customer support to lead generation, azmth adapts to your
              business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px]">
          {items.map((item, i) => (
  <motion.div
  key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
  className={`group relative ${item.span} ${item.mdSpan} w-full h-[280px] `}
>
  {/* Desktop (with hover effects) */}
  <div className="hidden md:block w-full h-full">
    <div className="relative w-full h-full overflow-hidden rounded-xl shadow-md">
      {/* Image with subtle scale on hover */}
      <img
        src={item.image}
        alt={item.title}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 object-${item.position} `}
      />

      {/* Dark overlay that intensifies on hover */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/40 to-transparent transition-colors duration-500 group-hover:from-black/85 group-hover:via-black/60" />

      {/* Text content */}
      <div className="absolute bottom-0 z-20 p-5 text-white">
        <div className="flex items-center gap-2 mb-1 text-white/80">
          {item.icon}
          <h3 className="text-xl font-semibold">{item.title}</h3>
        </div>
        <p className="text-base text-white/70">{item.desc}</p>
      </div>
    </div>
  </div>

  {/* Mobile (no hover, no animation) */}
  <div className="md:hidden relative w-full h-full overflow-hidden rounded-xl shadow-md">
    <img
      src={item.image}
      alt={item.title}
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent z-10" />
    <div className="absolute bottom-0 z-20 p-5 text-white">
      <div className="flex items-center gap-2 mb-1 text-white/80">
        {item.icon}
        <h3 className="text-lg font-semibold">{item.title}</h3>
      </div>
      <p className="text-sm text-white/70">{item.desc}</p>
    </div>
  </div>
</motion.div>


))}

        </div>
        </motion.div>

        
      </div>
    </section>
  );
};

export default UseCasesSection;
