import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname, "../../"), // points to the monorepo root relative to apps/dashboard
  },
};

export default nextConfig;
