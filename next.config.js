/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return {
      beforeFiles: [
        // 刪除原有代理規則，因為我們現在使用專用API處理代理
        // {
        //   source: '/api/proxy/:path*',
        //   destination: 'http://hl.webtw.xyz/:path*'
        // }
      ]
    };
  }
}

module.exports = nextConfig 