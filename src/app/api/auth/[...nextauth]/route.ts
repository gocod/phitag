import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";

// 🛡️ IMPORT THE ADMIN DB
import { db } from "@/lib/firebaseAdmin"; 

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
        // ADMIN SDK SYNTAX: .collection().doc()
        const userRef = db.collection("users").doc(user.email);
        const userSnap = await userRef.get();
        
        const isNewUser = !userSnap.exists;
        const eventTitle = isNewUser ? "🎉 New User Registered" : "Successful Sign-In";

        const userData: any = {
          email: user.email,
          name: user.name || "N/A",
          lastLogin: new Date(), // Admin SDK accepts standard Dates or FieldValue
        };

        if (isNewUser) {
          userData.plan = "Free Trial";
          userData.createdAt = new Date();
        }

        // ADMIN SDK SYNTAX: .set(data, { merge: true })
        await userRef.set(userData, { merge: true });

        // Trigger Admin Notification
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        await fetch(`${baseUrl}/api/admin/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: eventTitle,
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };