"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { completeOnboarding } from "./actions";
import {
  Sun,
  Moon,
  Phone,
  MessageCircle,
  Settings,
  Info,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import Image from "next/image";

// Prebuilt templates for AI calling agents
const PREBUILT_TEMPLATES = [
  {
    id: "appointment-scheduler",
    name: "Appointment Scheduler",
    description: "Schedule appointments and manage bookings",
    systemPrompt: `You are a professional appointment scheduling assistant. Your role is to help callers schedule, reschedule, or cancel appointments. You should be polite, efficient, and gather all necessary information including name, phone number, preferred date/time, and any special requirements. Always confirm details before finalizing appointments.`,
    firstMessage:
      "Hello! Thank you for calling. I'm here to help you schedule an appointment. How can I assist you today?",
    endCallMessage:
      "Thank you for calling! Your appointment has been scheduled. Have a great day!",
  },
  {
    id: "sales-representative",
    name: "Sales Representative",
    description: "Handle sales inquiries and product information",
    systemPrompt: `You are a knowledgeable sales representative. Your goal is to understand customer needs, provide product information, answer questions, and guide customers through the sales process. Be enthusiastic, helpful, and focus on building relationships while providing value. Always ask qualifying questions to better understand customer requirements.`,
    firstMessage:
      "Hi there! Thanks for calling. I'm excited to help you find the perfect solution for your needs. What brings you in today?",
    endCallMessage:
      "It was great talking with you! I've sent you the information we discussed. Feel free to call back if you have any questions!",
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Provide technical support and customer service",
    systemPrompt: `You are a patient and empathetic customer support specialist. Your role is to listen to customer issues, provide clear solutions, and ensure customer satisfaction. Be thorough in understanding problems, offer step-by-step guidance, and escalate complex issues when necessary. Always confirm that the customer's issue has been resolved.`,
    firstMessage:
      "Hello! I'm here to help you with any questions or issues you might have. How can I assist you today?",
    endCallMessage:
      "I'm glad I could help resolve your issue. Is there anything else you need assistance with today?",
  },
  {
    id: "lead-qualifier",
    name: "Lead Qualifier",
    description: "Qualify leads and gather prospect information",
    systemPrompt: `You are a lead qualification specialist. Your goal is to identify qualified prospects by asking targeted questions about their needs, budget, timeline, and decision-making authority. Be conversational but focused, and gather essential information to determine if the prospect is a good fit for your services.`,
    firstMessage:
      "Hi! Thanks for your interest in our services. I'd love to learn more about your needs to see how we can help. What challenges are you currently facing?",
    endCallMessage:
      "Thank you for sharing that information with me. I'll have our team review your needs and get back to you within 24 hours.",
  },
  {
    id: "survey-collector",
    name: "Survey Collector",
    description: "Conduct surveys and gather feedback",
    systemPrompt: `You are a professional survey conductor. Your role is to administer surveys in a friendly, engaging manner while ensuring accurate data collection. Read questions clearly, listen carefully to responses, and maintain a positive tone throughout the conversation. Be patient and encouraging to maximize response quality.`,
    firstMessage:
      "Hello! We're conducting a brief survey to improve our services. Your feedback is valuable to us. Do you have a few minutes to participate?",
    endCallMessage:
      "Thank you so much for participating in our survey! Your feedback will help us serve you better. Have a wonderful day!",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [endCallMessage, setEndCallMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPromptGuide, setShowPromptGuide] = useState(false);

  const allFilled =
    systemPrompt.trim() && firstMessage.trim() && endCallMessage.trim();

  const { user } = useUser();

  const handleTemplateSelect = (templateId: string) => {
    const template = PREBUILT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSystemPrompt(template.systemPrompt);
      setFirstMessage(template.firstMessage);
      setEndCallMessage(template.endCallMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (!allFilled) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("systemPrompt", systemPrompt);
      formData.append("firstMessage", firstMessage);
      formData.append("endCallMessage", endCallMessage);

      await completeOnboarding(formData);
      await user?.reload();
      router.push("/dashboard/create-call");
    } catch (error) {
      console.error("Error creating assistant:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      {/* Logo */}
      <div className="absolute top-4 left-4">
        <Image src="/logo.svg" alt="Logo" width={120} height={40} />
      </div>

      {/* Top-right buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <SignOutButton>
          <Button>Logout</Button>
        </SignOutButton>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="w-full max-w-6xl bg-card rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Voice AI Assistants</h1>
          <p className="text-lg text-muted-foreground">
            Create and manage your voice AI assistants.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Create a New Voice AI Assistant
              </CardTitle>
              <CardDescription>
                Describe the type of voice AI assistant you want to create.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Templates */}
              <div>
                <Label className="block mb-3 font-medium">Templates:</Label>
                <div className="flex flex-wrap gap-3">
                  {PREBUILT_TEMPLATES.map((template) => (
                    <Button
                      key={template.id}
                      type="button"
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`border-2 transition-all duration-200 ${
                        selectedTemplate === template.id
                          ? "bg-primary text-primary-foreground shadow-lg scale-105"
                          : "hover:border-primary/50 hover:bg-primary/5 hover:scale-105"
                      }`}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
                {selectedTemplate && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {PREBUILT_TEMPLATES.find((t) => t.id === selectedTemplate)?.description}
                  </p>
                )}
              </div>

              {/* System Prompt with helper & guide */}
              <div>
                <div className="flex items-start justify-between">
                  <label htmlFor="systemPrompt" className="mb-2 font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    System Prompt
                  </label>
                  <button
                    type="button"
                    className="flex items-center text-sm text-primary gap-1 hover:underline"
                    onClick={() => setShowPromptGuide(!showPromptGuide)}
                  >
                    <Info className="h-4 w-4" />
                    How to write a GREAT prompt
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your AI agent will only be as smart and effective as the instructions you give it. Think of the system prompt as your agent’s job description plus personality guide. The clearer and more detailed you are, the better your agent will perform.
                </p>
                {showPromptGuide && (
                  <div className="bg-primary/10 p-4 rounded-md text-sm space-y-2">
                    <p>✅ Here’s how to write a GREAT prompt:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li><strong>Define the Role:</strong> Clearly state who your agent is.</li>
                      <li><strong>Set the Tone & Style:</strong> Decide how the agent should sound.</li>
                      <li><strong>Outline Key Tasks:</strong> Be specific about what you want the agent to do.</li>
                      <li><strong>Give Do’s & Don’ts:</strong> List what the agent should always do and what it should never do.</li>
                      <li><strong>Provide Examples:</strong> Show sample responses for the agent to model.</li>
                    </ul>
                  </div>
                )}
                <Textarea
                  id="systemPrompt"
                  rows={6}
                  placeholder="Describe your voice AI assistant's purpose, personality, behavior, and how it should interact with callers..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[120px] resize-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
                {touched && !systemPrompt.trim() && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    System prompt is required.
                  </p>
                )}
              </div>

              {/* First Message */}
              <div>
                <label htmlFor="firstMessage" className="mb-2 font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  First Message
                </label>
                <Textarea
                  id="firstMessage"
                  rows={3}
                  placeholder="What should your AI say when it first answers a call?"
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  className="focus:ring-2 resize-none focus:ring-primary/20 transition-all duration-200"
                />
                {touched && !firstMessage.trim() && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    First message is required.
                  </p>
                )}
              </div>

              {/* End Call Message */}
              <div>
                <label htmlFor="endCallMessage" className="mb-2 font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  End Call Message
                </label>
                <Textarea
                  id="endCallMessage"
                  rows={3}
                  placeholder="What should your AI say when ending a call?"
                  value={endCallMessage}
                  onChange={(e) => setEndCallMessage(e.target.value)}
                  className="focus:ring-2 resize-none focus:ring-primary/20 transition-all duration-200"
                />
                {touched && !endCallMessage.trim() && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    End call message is required.
                  </p>
                )}
              </div>

              {/* Create Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-black px-8 py-3"
                  disabled={!allFilled || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Voice AI Assistant"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Message */}
          {touched && !allFilled && (
            <div className="mt-4 text-center">
              <p className="text-red-500">
                Please fill all fields to create your voice AI assistant.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
