
import type {NextConfig} from 'next';

const isProd = process.env.NODE_ENV === 'production';
// Replace '<repo-name>' with the name of your GitHub repository.
const repoName = 'loy-rog-boss-watch'; 

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  // Set basePath only for production builds on GitHub Pages.
  basePath: isProd ? `/${repoName}` : '',
  // Set assetPrefix to ensure assets (CSS, JS, images) are loaded correctly.
  assetPrefix: isProd ? `/${repoName}/` : '/',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
