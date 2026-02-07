// middleware.ts
export { default } from "next-auth/middleware";

export const config = { 
  // List all folders you want to protect here
  matcher: [
    "/settings/:path*", 
    "/schema/:path*", 
    "/registry/:path*",
    "/infrastructure/:path*",
    "/audit/:path*"
  ] 
};