import connectDB from "@/lib/connectDB";
import User from "@/modals/User";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all assistants from VAPI
        const response = await fetch("https://api.vapi.ai/assistant", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: "Failed to fetch assistants", details: errorData },
                { status: response.status }
            );
        }

        const assistants = await response.json();
        return NextResponse.json({ success: true, assistants });
    } catch (error) {
        console.error("Error fetching assistants:", error);
        return NextResponse.json(
            { error: "Failed to fetch assistants" },
            { status: 500 }
        );
    }
}

