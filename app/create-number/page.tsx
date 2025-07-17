'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function CreateNumberPage() {
  const { user } = useUser();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    assistantId: '',
    firstName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return toast({ title: 'You must be signed in.', variant: 'destructive' });
    }

    const res = await fetch('/api/create-number', {
      method: 'POST',
      body: JSON.stringify({
        clerkId: user.id,
        ...formData,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast({ title: 'Phone number created successfully.' });
    } else {
      toast({
        title: 'Error',
        description: data.error || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6">Create Twilio Number</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
          <Input
            id="twilioAccountSid"
            name="twilioAccountSid"
            value={formData.twilioAccountSid}
            onChange={handleChange}
            required
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
          <Input
            id="twilioAuthToken"
            name="twilioAuthToken"
            type="password"
            value={formData.twilioAuthToken}
            onChange={handleChange}
            required
            placeholder="••••••••••••••••••••••••"
          />
        </div>

        <div>
          <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
          <Input
            id="twilioPhoneNumber"
            name="twilioPhoneNumber"
            type="tel"
            value={formData.twilioPhoneNumber}
            onChange={handleChange}
            required
            placeholder="+1XXXXXXXXXX"
          />
        </div>

        <div>
          <Label htmlFor="assistantId">Assistant ID</Label>
          <Input
            id="assistantId"
            name="assistantId"
            value={formData.assistantId}
            onChange={handleChange}
            required
            placeholder="asst_xxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
          />
        </div>

        <Button type="submit" className="w-full">
          Create Number
        </Button>
      </form>
    </div>
  );
}


/**
 * -------------------- Developer Notes --------------------
 * This page allows a signed-in user to register a Twilio phone number with Vapi.
 * 
 * 🧠 How it works:
 * 1. The user fills a form with their Twilio credentials and assistant ID.
 * 2. The form submits to the `/api/create-number` route.
 * 3. On the server:
 *    - The backend validates the data and makes a POST request to Vapi’s `/phone-number` API.
 *    - Twilio details are taken from the form + user record (via Clerk ID).
 * 4. On success, the response is shown as a toast; error handling is also included.
 * 
 * 🔐 Credentials are never stored on the client; they’re passed to the server securely.
 * 📦 All sensitive communication (like Vapi API key and Twilio secrets) is handled server-side only.
 */
