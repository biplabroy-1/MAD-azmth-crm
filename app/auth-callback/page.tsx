import { currentUser } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation';
import connectDB from "@/lib/connectDB";
import User from '@/modals/User';

const AuthCallbackPage = async () => {
    try {
        const user = await currentUser();
        
        if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
            return redirect("/");
        }

        await connectDB();

        const dbUser = await User.findOne({
            clerkId: user.id,
        });

        const isGoogleLogin = user.externalAccounts?.some(account => account.provider === 'oauth_google');

        if (!dbUser) {
            await User.create({
                _id: user.id,
                clerkId: user.id,
                username: user.username,
                email: user.primaryEmailAddress.emailAddress,
                firstName: isGoogleLogin ? user.firstName : user.unsafeMetadata.firstName,
                lastName: isGoogleLogin ? user.lastName : user.unsafeMetadata.lastName,
                profileImageUrl: user.imageUrl
            });
        }
        
        return redirect("/");
    } catch (error) {
        console.error("Auth callback error:", error);
        return redirect("/?error=auth_callback_failed");
    }
};

export default AuthCallbackPage;