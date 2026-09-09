/**
 * next.config.mjs — Next.js configuration for the portfolio.
 *
 * What this file does:
 *  - `images.remotePatterns` whitelists the hosts that `next/image` may load
 *    from: the old Netlify image host (legacy portrait / QR / testimonial
 *    photos) and Cloudinary (everything uploaded through the admin panel).
 *  - `transpilePackages` keeps three.js / R3F happy under the Next bundler.
 *
 * To allow another image host, add one more object to `remotePatterns`.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "nooriallah.netlify.app" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // three.js ships ESM that the server bundle occasionally trips over.
  transpilePackages: ["three", "@react-three/fiber"],
};

export default nextConfig;
