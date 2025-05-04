import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/app/modals/User';
import connectDB from '@/lib/connectDB';
import { getAuth } from '@clerk/nextjs/server';;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Connect to the database
        await connectDB();

        // Get the authenticated user from Clerk
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        console.log('Authenticated user ID:', getAuth(req).userId);
        // Fetch user details from Clerk
        const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
            },
        }).then((response) => response.json());

        if (!clerkUser) {
            return res.status(404).json({ message: 'User not found in Clerk' });
        }

        const { id: clerkId, email_addresses, phone_numbers } = clerkUser;
        const email = email_addresses[0]?.email_address;
        const phoneNumber = phone_numbers[0]?.phone_number;

        if (!email || !phoneNumber) {
            return res.status(400).json({ message: 'Incomplete user data from Clerk' });
        }

        // Check if the user already exists in the database
        const existingUser = await User.findOne({ clerkId });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Create a new user in the database
        const newUser = new User({
            _id: new mongoose.Types.ObjectId().toString(),
            clerkId,
            email,
            phoneNumber,
            twilioConfig: {
                sid: '',
                authToken: '',
                phoneNumber: '',
            },
        });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}