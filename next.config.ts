import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the audio converter runs this binary, so it has to ship with that one route, unbundled
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: { "/api/audio/convert": ["./node_modules/ffmpeg-static/ffmpeg"] },
  async headers() {
    return [
      {
        // The band's samples are large and only change when we re-encode them.
        source: "/sounds/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
