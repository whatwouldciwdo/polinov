import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  devIndicators: false,
  reactStrictMode: false,
};

export default nextConfig;
