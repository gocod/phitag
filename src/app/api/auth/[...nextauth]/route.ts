import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import { FirestoreAdapter } from "@next-auth/firebase-adapter"; // New
import { db } from "@/lib/firebaseAdmin"; // New

const handler = NextAuth({
  // 1. Add the adapter to link Firestore
  adapter: FirestoreAdapter(db), 
  
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
    }),
  ],
  
  // 2. Change strategy to "database" for adapter use
  session: {
    strategy: "database", 
  },

  pages: {
    signIn: '/login',
    error: '/unauthorized',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async session({ session, user }) {
      // When using an adapter, the 'user' object is passed instead of 'token'
      if (session.user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };