import { motion } from "framer-motion";
import { Phone, Target, Zap } from "lucide-react";

const WhyAzmthSection = () => {
  return (
    <section className="py-20 bg-black ">
      <div className="container px-4  mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto "
        >
          <div className="text-center mb-16 ">
            <h2 className="text-5xl font-normal mb-6">
              Why <span className="text-gradient font-medium">azmth?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for fast-moving teams that can't afford to miss calls or
              slow down
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg ">
                    <Phone className="w-5 h-5 " />
                  </div>
                  <h3 className="text-xl font-medium">
                    Never Miss an Opportunity
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Built for fast-moving teams that can't afford to miss calls or
                  slow down. Every call is an opportunity, and azmth ensures you
                  capture them all with intelligent routing and instant
                  response.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg ">
                    <Zap className="w-5 h-5 " />
                  </div>
                  <h3 className="text-xl font-medium">
                    Voice AI + CRM Intelligence
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Combines voice AI, real-time logic, and CRM intelligence to
                  supercharge communication. Offload 90% of your call volume
                  while maintaining personalization and speed.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg ">
                    <Target className="w-5 h-5 " />
                  </div>
                  <h3 className="text-xl font-medium">
                    Scale Without Compromise
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Handle unlimited call volume without sacrificing quality or
                  personal touch. Perfect for startups, agencies, and enterprise
                  support teams.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="glass rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-6 h-6 " />
                  <h3 className="text-xl font-medium">Our Mission</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "We believe every call matters. That's why we're building AI
                  that doesn't just answer calls — it understands intent, builds
                  relationships, and drives results. Never miss another
                  opportunity."
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-white/60">— The azmth Team</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyAzmthSection;
