import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  logging: {
    // The NextAuth session endpoint is polled constantly (axios interceptor in
    // src/lib/api.ts + the 10s live-orders poll), which floods the dev terminal.
    // Skip logging it so real requests stay visible.
    incomingRequests: {
      ignore: [/\/api\/auth\/session/],
    },
  },
};

export default nextConfig;
