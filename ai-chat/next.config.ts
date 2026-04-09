import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensures server-only modules are never bundled into the client
  serverExternalPackages: ["@supabase/supabase-js"],
  // Allow local MkDocs dev host to access Next.js dev resources (HMR/websocket).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
