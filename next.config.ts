import type { NextConfig } from "next";

// Allow additional dev origins via environment variable (comma-separated).
// Example: ALLOWED_DEV_ORIGINS=my-custom-domain.dev,192.168.1.50:3000
const envOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse"],

  // Permit cross-origin dev server requests from ngrok tunnels, LAN IPs,
  // and other external hostnames. Without this, Next.js 16 blocks
  // /_next/webpack-hmr WebSocket upgrades with 503 and logs:
  // "Blocked cross-origin request to Next.js dev resource"
  allowedDevOrigins: [
    // ngrok tunnel domains
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.io",
    "*.ngrok.dev",
    "*.ngrok.app",
    // Cloudflare tunnel domains
    "*.trycloudflare.com",
    // Explicit local origins (belt-and-suspenders)
    "localhost:3000",
    "127.0.0.1:3000",
    // User-supplied overrides
    ...envOrigins,
  ],
};

export default nextConfig;
