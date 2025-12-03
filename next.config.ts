import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Use remotePatterns instead of domains (which is deprecated)
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000", // Allow images from localhost:5000
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "", // For default port 80 or when port is not specified
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;