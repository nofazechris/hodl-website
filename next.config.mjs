/** @type {import('next').NextConfig} */
const nextConfig = {
  // The page drives an imperative animation engine (SVG + canvas + WebGL).
  // Strict mode's dev-only double mount would start it twice, so it is off.
  reactStrictMode: false,
  images: { formats: ['image/avif', 'image/webp'] },
};
export default nextConfig;
