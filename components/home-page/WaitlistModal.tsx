"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Mail, User, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WaitlistModalProps {
  children: React.ReactNode;
  triggerClassName?: string;
}

const WaitlistModal = ({ children, triggerClassName }: WaitlistModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      setIsSubmitted(true);
      setFormData({ name: "", email: "" });

      // Auto-close after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={triggerClassName}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass border-white/20">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gradient">
            Join the Waitlist
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Be among the first to experience AI-powered call management that
            actually works.
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 mt-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 glass border-white/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 glass border-white/20"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full button-gradient"
                disabled={isSubmitting || !formData.name || !formData.email}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining Waitlist...
                  </>
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              We'll never share your information. Unsubscribe anytime.
            </p>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-8"
          >
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              You're on the list! 🎉
            </h3>
            <p className="text-muted-foreground mb-4">
              Thanks for joining our waitlist. We’ll notify you as soon as Azmth
              is ready to revolutionize your calls.
            </p>
            <div className="glass rounded-lg p-4 border-white/20">
              <p className="text-sm font-medium">What’s next?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check your inbox for confirmation and early access updates.
              </p>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
