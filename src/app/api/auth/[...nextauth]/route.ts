import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    // Provider 1: GitHub (Current testing)
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    // Provider 2: Azure AD (Enterprise Ready)
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
    }),
  ],
  pages: {
    signIn: '/login',      // Your custom login page
    error: '/unauthorized', // Redirects here if there is an auth error
  },
  callbacks: {
    // This runs whenever a user tries to sign in
    async signIn({ user, account, profile }) {
      // Logic tip: You can restrict access to specific emails here later
      return true;
    },
    // This ensures the session object in your components has the user's ID
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  // Use a secret for production (add this to your .env)
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };