import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Common spellings people try for the two documentation pages.
      { source: "/docs", destination: "/doc", permanent: false },
      { source: "/documentation", destination: "/doc", permanent: false },
      { source: "/api-reference", destination: "/api", permanent: false },
      { source: "/api-docs", destination: "/api", permanent: false },
    ];
  },
};

export default nextConfig;
