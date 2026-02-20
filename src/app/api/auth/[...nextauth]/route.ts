import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import { FirestoreAdapter } from "@next-auth/firebase-adapter"; // 👈 Required for Email Provider
import { db } from "@/lib/firebaseAdmin"; 

export const authOptions: NextAuthOptions = {
  // 1. LINK THE ADAPTER
  adapter: FirestoreAdapter(db),

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

  // 2. SESSION STRATEGY
  session: {
    strategy: "jwt", // Fast, cookie-based sessions
  },

  // 3. FINOPS LOGIC (Your custom writes)
 events: {
    async signIn({ user }) {
      if (!user.email) return;

      try {
        const userRef = db.collection("users").doc(user.email);
        const userSnap = await userRef.get();
        
        const isNewUser = !userSnap.exists;
        const eventTitle = isNewUser ? "🎉 New User Registered" : "Successful Sign-In";

        const userData: any = {
          email: user.email,
          name: user.name || "N/A",
          lastLogin: new Date(),
        };

        if (isNewUser) {
          userData.plan = "Free Trial";
          userData.createdAt = new Date();
        }

        await userRef.set(userData, { merge: true });

        // 🎯 THE FIX: Use the primary domain (phitag.app) to ensure the fetch doesn't fail on a redirect
        const baseUrl = process.env.NEXTAUTH_URL || "https://phitag.app";

        console.log(`📡 Sending trigger to: ${baseUrl}/api/admin/notify for ${user.email}`);

        await fetch(`${baseUrl}/api/admin/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: eventTitle, // This triggers "Welcome" logic because it contains "Sign-In" or "New User"
            userEmail: user.email,
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };