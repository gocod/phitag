import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import EmailProvider from "next-auth/providers/email";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { db } from "@/lib/firebaseAdmin"; 

/**
 * NEXTAUTH CONFIGURATION
 * Handles session management, JWT token enrichment, and user synchronization.
 * Includes "Instant-Sync" logic for Stripe tier upgrades.
 */

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
    async jwt({ token, user, trigger, session }) {
      // 1. INITIAL SIGN-IN LOGIC
      // On the very first login, we map the tier/plan from the user object to the JWT.
      if (user) {
        // We normalize to lowercase here to match the 'pro' or 'elite' UI expectations.
        token.tier = (user as any).tier || (user as any).plan?.toLowerCase() || 'free';
      }
      
      // 2. ⚡ INSTANT SYNC TRIGGER
      // When the success page calls update(), this block forces the token to refresh
      // with the newest tier data passed from the frontend.
      if (trigger === "update" && session?.tier) {
        token.tier = session.tier.toLowerCase();
      }

      // 3. DATABASE FALLBACK (THE "SAFETY NET")
      // If the token says 'free', we do a quick check against Firestore.
      // This solves the issue where the user pays but doesn't logout/login.
      if ((!token.tier || token.tier === 'free') && token.email) {
        try {
          const userSnap = await db.collection("users").doc(token.email).get();
          if (userSnap.exists) {
            const dbData = userSnap.data();
            token.tier = dbData?.tier || dbData?.plan?.toLowerCase() || 'free';
          }
        } catch (error) {
          console.error("⚠️ JWT Callback: Firestore lookup failed", error);
        }
      }

      return token;
    },

    async session({ session, token }: any) {
      // 4. SESSION ENRICHMENT
      // We pass the tier from the encrypted JWT token to the client-side session.
      // This is what the 'usePermissions' hook and pricing UI actually read.
      if (session.user) {
        session.user.tier = (token.tier as string) || 'free';
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

        // Initialize defaults for new signups
        if (isNewUser) {
          userData.plan = "free";
          userData.tier = "free";
          userData.createdAt = new Date();
        }

        // Use merge: true so we don't overwrite existing Stripe metadata
        await userRef.set(userData, { merge: true });

        // Admin Notification Webhook
        const baseUrl = process.env.NEXTAUTH_URL || "https://phitag.app";
        await fetch(`${baseUrl}/api/admin/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: eventTitle,
            userEmail: user.email,
          }),
        }).catch(() => console.warn("Admin notify offline"));

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