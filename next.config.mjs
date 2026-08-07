/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
    ],
  },
  outputFileTracingIncludes: {
    "/api/deploy-site": [
      "./src/**/*",
      "./public/**/*",
      "./package.json",
      "./package-lock.json",
      "./next.config.mjs",
      "./tsconfig.json",
      "./components.json",
      "./postcss.config.mjs",
    ],
  },
};

export default nextConfig;
