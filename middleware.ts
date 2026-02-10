import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = { 
  // Keep your protected folders here
  matcher: [
    "/settings/:path*", 
    "/schema/:path*", 
    "/registry/:path*",
    "/infrastructure/:path*",
    "/audit/:path*"
  ] 
};