import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { db } from "@/lib/firebaseAdmin";

export const authOptions: NextAuthOptions = {
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
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/unauthorized',
  },
  callbacks: {
  async signIn({ user, account, profile }) {
    return true;
  },
  async session({ session, token }) {
    if (session.user && token.sub) {
      (session.user as any).id = token.sub; // token.sub is the User ID from Firestore
    }
    return session;
  },
},
  secret: process.env.NEXTAUTH_SECRET,
};