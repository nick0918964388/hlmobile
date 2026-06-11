const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  // 開發模式停用 SW，避免快取干擾熱重載
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    runtimeCaching: [
      {
        // app shell / 頁面導航：network-first，斷線回退快取
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      {
        // Maximo 資料 GET（工單列表/詳情/庫存 等經 /api/proxy）+ 使用者：
        // NetworkFirst → 連線時拿最新並快取，斷線時回退最後一次成功的資料，達成離線讀取。
        // 注意：workbox NetworkFirst 只快取 GET，報工的 POST 不會被快取（離線寫入由 Phase 1b outbox 處理）。
        urlPattern: ({ url, request }) =>
          request.method === "GET" &&
          (url.pathname.startsWith("/api/proxy") || url.pathname.startsWith("/api/user")),
        handler: "NetworkFirst",
        options: {
          cacheName: "maximo-data",
          networkTimeoutSeconds: 6,
          expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // 靜態資源(JS/CSS/字型/圖)：stale-while-revalidate
        urlPattern: ({ request }) =>
          ["style", "script", "worker", "font", "image"].includes(request.destination),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "assets",
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 產生獨立輸出，供 Docker 精簡映像使用
  output: "standalone",
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
};

module.exports = withPWA(nextConfig);
