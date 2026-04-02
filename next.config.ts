import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*.loca.lt", "*.pinggy.link", "*.free.pinggy.link", "*.localhost.run", "*.serveo.net", "*.serveousercontent.com", "localhost:3000"]
    }
  },
  devIndicators: false, // Optional, typically cleans up UI
  allowedDevOrigins: [
    "1feb5291285e6173-59-9-185-1.serveousercontent.com",
    "67a0f4087e41540d-59-9-185-1.serveousercontent.com",
    "bf0b4fdd5ef7fe67-59-9-185-1.serveousercontent.com",
    "*.serveousercontent.com",
    "localhost:3000"
  ]
};
export default nextConfig;
