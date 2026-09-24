/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: [
    "@colophon/kernel",
    "@colophon/instruments",
    "@colophon/proof",
    "@colophon/verifier",
  ],
  reactStrictMode: true,
};

export default nextConfig;
