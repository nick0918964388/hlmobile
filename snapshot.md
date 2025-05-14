# 專案快照

## 專案目錄結構

```
hlmobile
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── health/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── cm/
│   │   │   │   └── generate-suggestion/
│   │   │   │       └── route.ts
│   │   │   ├── health/
│   │   │   │   ├── set/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── image-proxy/
│   │   │   │   └── route.ts
│   │   │   ├── upload/
│   │   │   └── user/
│   │   │       ├── current/
│   │   │       │   └── route.ts
│   │   │       └── permissions/
│   │   │           └── route.ts
│   │   ├── cm/
│   │   │   ├── [id/
│   │   │   │   └── ]/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   ├── debug/
│   │   │   └── page.tsx
│   │   ├── example/
│   │   │   ├── save-example/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── login/
│   │   ├── logout/
│   │   │   └── page.tsx
│   │   ├── maintenance/
│   │   │   └── page.tsx
│   │   ├── pm/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── autoscript/
│   │   ├── MOBILEAPP_GET_CM_WORKORDER_DETAIL
│   │   ├── MOBILEAPP_GET_CURRENT_USER
│   │   ├── MOBILEAPP_GET_MANAGER_LIST
│   │   ├── MOBILEAPP_GET_PM_WORKORDER_DETAIL
│   │   ├── MOBILEAPP_GET_PM_WORKORDERS
│   │   └── MOBILEAPP_UPDATE_PM_WORKORDER
│   ├── components/
│   │   ├── ActualCheck.tsx
│   │   ├── CancelModal.tsx
│   │   ├── CMActual.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── SaveButton.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Skeleton.tsx
│   │   ├── SubmitModal.tsx
│   │   └── WorkReport.tsx
│   ├── contexts/
│   │   ├── LanguageContext.tsx
│   │   └── UserContext.tsx
│   ├── hooks/
│   │   ├── useApiData.ts
│   │   ├── useDataSave.ts
│   │   └── usePermissions.ts
│   ├── pages/
│   │   └── api/
│   │       └── upload.ts
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   ├── utils/
│   │   ├── fileHelper.ts
│   │   └── fileUtils.ts
│   └── middleware.ts
├── API_USAGE_GUIDE.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── postcss.config.mjs
├── README.md
├── snapshot.js
├── tailwind.config.ts
└── tsconfig.json
```

## 函式清單

### src\app\api\cm\generate-suggestion\route.ts

- `POST(request: Request)`

### src\app\api\health\route.ts

- `GET()`

### src\app\api\health\set\route.ts

- `POST(request: NextRequest)` - 設置系統健康狀態 (需要管理員權限)
- `GET()` - 獲取當前模擬的健康狀態

### src\app\api\image-proxy\route.ts

- `GET(request: NextRequest)`

### src\app\api\user\current\route.ts

- `GET()` - 獲取當前用戶 - 包含必要的權限

### src\app\api\user\permissions\route.ts

- `GET()` - 獲取當前用戶
- `POST(request: NextRequest)` - 更新用戶權限

### src\components\Skeleton.tsx

- `Skeleton({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
  count = 1
}: SkeletonProps)` - 基本骨架元素
- `SkeletonCard({
  lines = 3,
  hasImage = true,
  imageSize = '100px',
  className = ''
}: SkeletonCardProps)` - 卡片骨架
- `SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = ''
}: SkeletonTableProps)` - 表格骨架
- `SkeletonForm({
  fields = 4,
  className = ''
}: SkeletonFormProps)` - 表單骨架
- `SkeletonDetail()` - 詳細頁面骨架
- `SkeletonList({
  count = 5,
  className = ''
}: {
  count?: number;
  className?: string;
})` - 列表骨架
- `SkeletonPage()` - 页面加载骨架屏

### src\contexts\LanguageContext.tsx

- `LanguageProvider({ children }: { children: ReactNode })`
- `useLanguage()`

### src\contexts\UserContext.tsx

- `useUser()`
- `UserProvider()`

### src\hooks\useApiData.ts

- `useApiData()` - 獲取API資料的自訂 hook

### src\hooks\useDataSave.ts

- `useDataSave()`

### src\hooks\usePermissions.ts

- `usePermissions()` - 使用 hook 檢查權限

### src\middleware.ts

- `middleware(request: NextRequest)`

### src\utils\fileUtils.ts

- `getFileExtension()`
- `extractInfoFromFileName()`
- `generateAttachmentFileName()`

## 依賴清單

### hlmobile

#### dependencies

```json
{
  "formidable": "^3.5.3",
  "next": "14.1.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

#### devDependencies

```json
{
  "@types/formidable": "^3.4.5",
  "@types/node": "^20.11.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "autoprefixer": "^10.4.17",
  "postcss": "^8.4.35",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.3.3"
}
```

---
生成時間: 2025/5/6 上午8:57:18
