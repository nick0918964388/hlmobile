/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/proxy/:path*',
          destination: 'http://hl.webtw.xyz/:path*'
        }
      ]
    };
  }
}

module.exports = nextConfig 