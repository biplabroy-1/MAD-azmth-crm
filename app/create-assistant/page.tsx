'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateAssistantPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assistantId, setAssistantId] = useState<string | null>(null);

  // Optional: auto-fetch assistant ID if it already exists
  useEffect(() => {
    const fetchAssistantStatus = async () => {
      if (!user) return;

      const res = await fetch('/api/check-assistant', {
        headers: {
          'x-clerk-user-id': user.id,
        },
      });

      const data = await res.json();
      if (data?.assistantId) {
        setAssistantId(data.assistantId);
      }
    };

    fetchAssistantStatus();
  }, [user]);

  const handleCreate = async () => {
    if (!user) {
      return toast({
        title: 'You must be signed in to create an assistant.',
        variant: 'destructive',
      });
    }

    setLoading(true);
    const res = await fetch('/api/create-assistant', {
      method: 'POST',
      headers: {
        'x-clerk-user-id': user.id,
      },
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast({ title: 'Assistant created successfully' });
      setAssistantId(data.id);
    } else {
      toast({
        title: 'Error',
        description: data?.error || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Vapi Assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Click the button below to create your assistant using your saved content.
          </p>

          <Button onClick={handleCreate} disabled={loading || !!assistantId}>
            {assistantId
              ? 'Assistant Already Created'
              : loading
              ? 'Creating...'
              : 'Create Assistant'}
          </Button>

          {assistantId && (
            <p className="text-sm text-muted-foreground">
              Assistant ID: <span className="font-mono">{assistantId}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



/**
 * -------------------- Developer Notes --------------------
 * This page allows a signed-in user to create an AI assistant via Vapi.
 * 
 * 🧠 How it works:
 * 1. The user clicks the "Create Assistant" button.
 * 2. The backend API route `/api/create-assistant` is called with the user's Clerk ID.
 * 3. On the server:
 *    - The assistant is created using Vapi API with predefined voice/model config.
 *    - The assistant ID is saved in the user's MongoDB document.
 * 4. The frontend displays success or error toast accordingly.
 * 
 * 🔐 The API is secured using `x-clerk-user-id` from the user's session.
 * 📦 The backend handles all Vapi interaction — frontend is only responsible for triggering it.
 */
