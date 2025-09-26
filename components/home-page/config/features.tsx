import {
  Phone,
  Bot,
  Calendar,
  Headphones,
  BarChart3,
  Globe,
} from "lucide-react";

export const features = [
  {
    title: "AI-Powered Inbound & Outbound Call Handling",
    description:
      "Automatically answers and responds to customer queries, schedules appointments, or transfers to humans.",
    icon: <Phone className="w-6 h-6" />,
    image: "/call-record.png",
  },
  {
    title: "Custom Voice Agent Creation",
    description:
      "Build your own branded voice personality with tone, fallback logic, and custom greetings.",
    icon: <Bot className="w-6 h-6" />,
    image: "/cooking.png",
  },
  {
    title: "CRM + Calendar Sync And More",
    description:
      "Seamlessly integrates with Google Calendar, HubSpot, Salesforce, and more for perfect workflow integration.",
    icon: <Calendar className="w-6 h-6" />,
    image: "/calender.png",
  },
  {
    title: "Live Agent Escalation",
    description:
      "Smart handoff to human agents with context-aware logs and call summaries for seamless transitions.",
    icon: <Headphones className="w-6 h-6" />,
    image: "/cooking.png",
  },
  {
    title: "Real-Time Call Analytics",
    description:
      "Get full transcription, AI summaries, and call scoring to improve performance over time.",
    icon: <BarChart3 className="w-6 h-6" />,
    image: "/stats.png",
  },
  {
    title: "Multilingual Support",
    description:
      "Converse in multiple languages with auto-detection and translation built-in.",
    icon: <Globe className="w-6 h-6" />,
    image: "/cooking.png",
  },
];
