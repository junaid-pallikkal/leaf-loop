import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oevwwmxqcbcatckfcjvo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldnd3bXhxY2JjYXRja2ZjanZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMTI1MzIsImV4cCI6MjEwOTY4ODUzMn0.sfdEeA8flI2kGKs12StP4kDfvTITo-cVS4WhlnbPWNA',
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oevwwmxqcbcatckfcjvo.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
