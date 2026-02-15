import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; 

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  
  events: {
    async signIn({ user }) {
      if (!user.email) return;

      try {
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);
        
        // 1. Determine if this is a first-time registration
        const isNewUser = !userSnap.exists();
        const eventTitle = isNewUser ? "🎉 New User Registered" : "Successful Sign-In";

        // 2. Update Firebase
        // If it's a new user, we initialize their plan to "Free Trial"
        const userData: any = {
          email: user.email,
          name: user.name || "N/A",
          lastLogin: serverTimestamp(),
        };

        if (isNewUser) {
          userData.plan = "Free Trial";
          userData.createdAt = serverTimestamp();
        }

        await setDoc(userRef, userData, { merge: true });

        // 3. Trigger Admin Notification via Resend
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        await fetch(`${baseUrl}/api/admin/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: eventTitle,
            userEmail: user.email,
            // If they already existed, our notify route will fetch their current plan from Firebase
          }),
        });

      } catch (error) {
        console.error("❌ Auth Event Logic Error:", error);
      }
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };