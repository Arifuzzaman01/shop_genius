import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = { 
  matcher: [
    // Protect these specific routes
    "/card",
    "/checkout/:path*",
  ]
};