# hlmobile vs IBM MAS 原生 Maximo Mobile — 差距分析與進化方案

> 目的：研究 IBM Maximo Application Suite (MAS 9) 原生手機程式的能力，對照本專案
> (hlmobile，離岸風電保養回報) 目前的不足，制定一份可執行的補強路線圖。
> 製作日期：2026-06。資料來源見文末。

---

## 1. MAS 原生 Maximo Mobile 是什麼

不是單一 App，而是一組 **角色導向的 PWA**，建構在 React + MAF (Maximo Application
Framework) 之上，**離線優先**、伺服器端設定 (Mobile Configuration App，免重新打包)。

主要 App：
- **Technician / Work Execution**：派工、領單、執行工單、報工(工時/料/工具)、改狀態、完工
- **Inspections / Inspection Forms**：巡檢表單(條件式邏輯)、記錄結果、臨時巡檢、表單指派、狀態變更電子簽名
- **Asset Manager / Asset Audit**：資產稽核、資產歷史
- **Issues & Transfers / Inventory Receiving / Inventory Count**：庫存發料/移轉/收貨/盤點(條碼驅動)
- **Service Request**：建立服務請求(可從地圖)

跨功能能力：
- **離線同步**：scoped dataset(登入時下載相關工單/資產/表單) + delta 增量同步 + 伺服器端衝突解決
- **條碼/QR/RFID 掃描**：可強制「改狀態前先掃資產條碼」
- **附件**：照片/影片/音訊/文件/標註地圖
- **電子簽名**：狀態變更時強制簽名，存進工單
- **GPS/地圖**：位置分享給派工地圖、ESRI/Google 地圖、從地圖建工單、路徑規劃
- **故障回報**：失效日期/時間、故障碼階層
- **安全計畫**：時間戳安全計畫
- **設定**：Mobile Configuration App 伺服器端調整欄位/規則，免改 code

---

## 2. hlmobile 目前有什麼（現況盤點）

| 面向 | 現況 |
| --- | --- |
| 架構 | Next.js 14 web app（行動版響應式），**非 PWA、無離線** |
| 工單 | PM / CM 列表 + 詳情 |
| 報工 | 工時 / 材料(已接真實庫存+儲存室) / 工具 actuals、checkItems(作業項目結果/備註)、CM 故障描述+維修方法+停機時間 |
| 附件 | 照片上傳到 server(OSLC)；無影片/音訊/標註 |
| AI | **Ollama 故障描述建議**（genAI，領先 MAS classic）|
| 認證 | 已接真實 Maximo 登入(本次完成) |
| 其他 | i18n(中/英)、狀態流 WAPPR/APPR/INPRG/COMP |

---

## 3. 差距矩陣（離岸風電情境加權）

> 離岸風電現場特性：**海上幾乎沒有網路**、設備固定但分散在多支風機、需留證(簽名/照片)、
> 物料管控嚴。據此調整優先序。

| 能力 | MAS Mobile | hlmobile | 優先序 | 理由 |
| --- | :---: | :---: | :---: | --- |
| **離線優先 + 同步** | ✅ | ❌ | 🔴 P0 | 海上沒網路，這是 MAS 最大價值、我們最大缺口 |
| **PWA 安裝 + 相機** | ✅ | ❌ | 🔴 P0 | 離線/原生感的前置；加到主畫面、調用相機 |
| 條碼/QR 掃描(資產/料) | ✅ | ❌ | 🟠 P1 | 上工掃風機/料件條碼確認，防報錯 |
| 電子簽名 | ✅ | ❌ | 🟠 P1 | 完工/簽核留證，稽核需要 |
| 故障碼階層(class/problem/cause/remedy) | ✅ | ❌(自由文字) | 🟡 P2 | 結構化故障資料，利於分析 |
| 巡檢表單模組(條件式) | ✅ | ❌(僅 checkItems) | 🟡 P2 | 定期巡檢數位化 |
| 附件強化(影片/音訊/標註) | ✅ | 部分 | 🟡 P2 | 現場錄影/標記缺陷 |
| 推播通知 | ✅ | ❌ | 🟡 P2 | 派工/退簽即時通知 |
| 地圖/導航/位置分享 | ✅ | ❌ | 🟢 P3 | 風機固定，海上用途有限；港勤/船舶可考慮 |
| 工時計時器 / 自助領單 | ✅ | ❌ | 🟢 P3 | 效率優化 |
| 資產歷史 / 稽核 | ✅ | ❌ | 🟢 P3 | 現場查維修史 |

### 我們要「保留並強化」的差異化
- **AI 故障建議(Ollama)**：MAS classic 沒有內建 genAI，這是我們的亮點，可再擴大(維修建議、零件推薦、報告自動生成)。
- **輕量、零 IBM mobile 授權、100% 可客製**到離岸風電流程。

---

## 4. 進化路線圖（分階段）

### Phase 0 — PWA 化（基礎前置）｜估 1 週
- 加 `manifest.json` + icons + `next-pwa`(或自寫 service worker)
- 「加到主畫面」、全螢幕、splash
- `<input capture>` 直接調相機拍照
- **產出**：可安裝、有原生感、為離線鋪路

### Phase 1 — 離線優先 + 同步（P0 核心）｜估 3–4 週
- 本地儲存：IndexedDB(建議 Dexie.js) 快取工單/詳情/庫存/故障碼/員工
- 登入時 scoped 下載當班工單；之後 delta 同步
- **離線報工佇列**：離線時把 update/submit 寫入 outbox，連線後依序送出
- 衝突處理：以工單 rowstamp/version 偵測，衝突時提示或後寫贏(可配置)
- Service worker 快取 app shell + API 回應
- **產出**：海上沒網路也能查工單、報工、拍照，回港自動同步 ← 最關鍵價值

### Phase 2 — 現場效率（P1）｜估 2–3 週
- **條碼/QR 掃描**：用 `@zxing/browser` 或瀏覽器原生 `BarcodeDetector`；掃資產/料件號自動帶入、可選「改狀態前需掃描」
- **電子簽名**：`signature_pad`(canvas) 在完工/簽核時簽，存成附件/欄位
- 報工 UX 強化(計時器、快速數量)

### Phase 3 — 資料品質（P2）｜估 3–4 週
- **故障碼階層**：接 Maximo FAILURELIST/FAILURECODE，做 class→problem→cause→remedy 連動下拉(技術同本次的庫存 script：新增 MOBILEAPP_GET_FAILURE_CODES)
- **巡檢模組**：讀 Maximo Inspection Forms(或自定)，支援條件式題目、附件、簽名
- **附件強化**：影片/音訊上傳、照片標註(canvas 畫框)
- **推播**：Web Push(VAPID) + 後端在派工/退簽時推送

### Phase 4 — 進階（P3）｜估 視需求
- 地圖(Leaflet/ESRI)：風機位置、船舶/人員位置分享
- 工時計時器、工作佇列自助領單、資產維修歷史頁

---

## 5. Quick Wins（低成本高效益，可先插隊做）
1. **PWA manifest + 加到主畫面**（1–2 天）→ 立即有「裝得起來」的原生感
2. **條碼掃描帶入資產/料號**（3–5 天）→ 現場最有感、防錯
3. **電子簽名**（2–3 天）→ 稽核留證
4. **故障碼下拉**（3–5 天）→ 結構化故障資料，技術路徑與本次庫存 script 相同

---

## 6. 建議起手式
**先做 Phase 0(PWA) + Phase 1(離線)**。理由：離岸風電現場「沒網路」是硬限制，
也正是 MAS Mobile 最大的賣點與我們最大的缺口。把離線做起來，價值遠大於補其他零星功能；
其餘(掃碼/簽名/故障碼)可作為 Phase 1 進行中的 quick win 並行插入。

---

## 來源
- IBM Documentation — Maximo Mobile overview: https://www.ibm.com/docs/en/masv-and-l/maximo-manage/cd?topic=overview-maximo-mobile
- IBM Maximo Mobile for EAM app overview: https://www.ibm.com/support/pages/ibm%C2%AE-maximo%C2%AE-mobile-eam-app-overview
- Maximo Mobile — Inspection application: https://www.ibm.com/support/pages/maximo-mobile-how-use-inspection-application
- New Features in MAS 9.0/9.1 (Maximo Secrets): https://maximosecrets.com/2025/07/06/new-features-in-mas-90-and-91/
- Maximo Manage – Mobile (Maximo Secrets): https://maximosecrets.com/2024/05/17/maximo-manage-mobile/
- The Maximo Guys — Maximo Mobile vs Anywhere (MAS 9): https://themaximoguys.ai/blog/mas-features-maximo-mobile
- IBM Maximo Mobile App (App Store): https://apps.apple.com/us/app/ibm-maximo-mobile/id1543726957
