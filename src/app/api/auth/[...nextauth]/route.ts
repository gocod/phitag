import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { db } from "@/lib/firebaseAdmin"; 

export const authOptions: NextAuthOptions = {
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

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, add the tier from the database user object to the token
      if (user) {
        token.tier = (user as any).tier || (user as any).plan?.toLowerCase() || 'free';
      }
      
      // Look up the latest tier from the DB if it's missing (helps sync after Stripe payment)
      if (!token.tier && token.email) {
        const userSnap = await db.collection("users").doc(token.email).get();
        if (userSnap.exists) {
          token.tier = userSnap.data()?.tier || userSnap.data()?.plan?.toLowerCase() || 'free';
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      // Pass the tier from the token to the session object for the usePermissions hook
      if (session.user) {
        session.user.tier = token.tier || 'free';
      }
      return session;
    }
  },

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
          userData.plan = "free";
          userData.tier = "free";
          userData.createdAt = new Date();
        }

        await userRef.set(userData, { merge: true });

        const baseUrl = process.env.NEXTAUTH_URL || "https://phitag.app";
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };