# Pinuyumayan 卑南族入口網 v4.7

## Project Overview
- **Name**: Pinuyumayan (卑南族入口網)
- **Goal**: 保存與推廣卑南族（Puyuma）語言、文化與傳統知識的數位平台
- **Tech Stack**: TypeScript + Next.js 16 + NestJS 10 + PostgreSQL (Supabase) + Drizzle ORM + Tailwind CSS 4

## URLs
- **Frontend (Vercel)**: https://pinuyumayan.vercel.app
- **API (Render)**: https://pinuyumayan-api.onrender.com
- **Swagger Docs**: https://pinuyumayan-api.onrender.com/api/docs
- **GitHub (Monorepo)**: https://github.com/fj5200-ui/pinuyumayan
- **GitHub (API)**: https://github.com/fj5200-ui/pinuyumayan-api
- **Supabase**: https://supabase.com/dashboard/project/uzwuqythcvqyhhxvqpzf

## Architecture

### Monorepo Structure
```
pinuyumayan/
├── apps/
│   ├── web/          # Next.js 16 前端 (Port 3000)
│   └── api/          # NestJS 10 後端 API (Port 3001)
├── packages/
│   ├── database/     # Drizzle ORM schema + migrations
│   └── shared/       # 共用類型與工具
├── supabase/         # Supabase CLI 設定
└── vercel.json       # Vercel monorepo deployment config
```

### Backend — NestJS API (19 Modules, all DB-backed)
| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | POST /register, /login, /refresh, /change-password, /forgot-password, /reset-password, GET /me, PUT /me | JWT 認證 + Token 刷新 + 密碼管理 |
| Tribes | GET /, /:id | 卑南八社資料 |
| Articles | GET /, /:slug, /meta/categories, /meta/related/:id, /meta/sitemap, /meta/navigation/:id, /meta/author/:id, POST /, /batch/publish, /batch/delete, PUT /:id, DELETE /:id | 文化誌文章 CRUD + 批次操作 + 上下篇導航 + 作者檔案 |
| Language | GET /vocabulary, /daily, /categories, POST/PUT/DELETE | 族語詞彙 + 每日一詞 |
| Events | GET /, /:id, POST /, PUT /:id, DELETE /:id | 活動祭典 |
| Media | GET /, /:id, POST /, DELETE /:id | 媒體庫 |
| Comments | GET /article/:id, POST /article/:id, DELETE /:id, POST /article/:id/like | 留言與按讚 |
| Bookmarks | GET /, POST /:articleId, GET /check/:articleId | 文章收藏 |
| Follows | GET /, POST /:tribeId, GET /check/:tribeId, GET /tribe/:tribeId/count | 部落追蹤 |
| Notifications | GET /, GET /unread-count, PUT /read-all, PUT /:id/read, DELETE /:id | 通知系統 |
| Search | GET /?q=keyword | 全站搜尋 |
| Admin | GET /stats, /dashboard, /users, /comments, /audit-logs, PUT /users/:id/role, DELETE /comments/:id, POST+PUT+DELETE /tribes, /events, /media, /vocabulary | 管理後台完整 CRUD |
| Discussions | GET /, /:id, POST /, /:id/replies, /:id/like, DELETE /:id | 社群討論系統 (DB) |
| Learning | GET /progress, /leaderboard, POST /quiz-result, /mark-learned | 學習進度追蹤 + 徽章 + 排行榜 (DB) |
| Registrations | POST /events/:id, DELETE /events/:id, GET /events/:id, /my, /check/:id | 活動報名系統 (DB) |
| Approval | GET /queue, POST /:id/approve, /:id/reject, /submit | 內容審核管理 (DB) |
| CulturalSites | GET /, /:id, /nearby | 文化景點 + 地理搜尋 (DB) |
| Exports | GET /:type (users/articles/vocabulary/events/tribes) | CSV 匯出 |
| Workflows | GET /articles/:id/versions, /versions/:id, POST /versions/:id/restore | 文章版本歷史 + 還原 |

### Frontend — Next.js Pages (37 Routes)

#### 前台頁面 (18 頁)
| Page | Path | Description | Status |
|------|------|-------------|--------|
| 首頁 | / | **升級 v2**: 動畫計數器 + 波浪分隔線 + 互動卡片(hover 效果) + 動態統計 + 每日一詞 + 部落/文章/族語/活動 + 文化景點區 + 排行榜 | ✅ **ENHANCED v2** |
| 部落列表 | /tribes | 卑南八社一覽 + 地圖檢視按鈕 | ✅ |
| 部落詳情 | /tribes/[id] | **升級**: 追蹤功能 + 粉絲數 + 分享按鈕 + 文化標籤 + Google Maps 嵌入 + 相關文章推薦 | ✅ **ENHANCED** |
| 部落地圖 | /tribes/map | Leaflet 互動地圖 + 圖層切換 | ✅ |
| 文化誌 | /articles | 文章列表 + 分頁 + 搜尋 + 分類篩選 + 封面圖 + 作者頭像 | ✅ ENHANCED |
| 文章詳情 | /articles/[slug] | v2: Markdown + TOC(active tracking) + 上下篇導航 + 作者卡片 + 閱讀剩餘時間 + breadcrumb + skeleton + 側邊快捷 | ✅ ENHANCED v2 |
| 族語學習 | /language | 詞彙分類瀏覽、發音、對話、學習進度+徽章+排行榜 | ✅ ENHANCED |
| 族語測驗 | /language/quiz | 四選一測驗、連續答對、雙向模式 | ✅ |
| 活動祭典 | /events | **升級**: 多色標籤系統 + 倒計時天數 + 搜尋過濾 + 已結束視覺效果 + 報名/取消 + 報名人數 | ✅ **ENHANCED v2** |
| 文化景點 | /cultural-sites | 文化景點列表/地圖 + 類型篩選 + GIS 定位 | ✅ |
| 媒體庫 | /media | 照片/影片/音檔 (類型篩選) | ✅ |
| 社群討論 | /community | **升級**: 多板塊系統 + 回覆展開 + 按讚互動 + 發文表單驗證 + 字數統計 + 載入動畫 | ✅ **ENHANCED v2** |
| 搜尋 | /search | 自動完成 + 類型篩選 + 關鍵字高亮 | ✅ |
| 登入 | /login | JWT 登入 + 測試帳號提示 | ✅ |
| 註冊 | /register | 帳號註冊 + 密碼確認 | ✅ |
| 忘記密碼 | /forgot-password | 發送重設連結 | ✅ |
| 個人資料 | /profile | 7 分頁: 資料/收藏/追蹤/報名/學習/我的發文/密碼 | ✅ ENHANCED |
| 通知 | /notifications | 通知列表、已讀/刪除 | ✅ |

#### 管理後台 (15 頁)
| Page | Path | Description | Status |
|------|------|-------------|--------|
| Dashboard | /admin | **升級 v2**: 即時時鐘 + 一鍵更新 + 系統健康狀態列 + Sparkline 迷你圖表 + 操作日誌面板 + 審核進度條 + 內容分佈圖表 + 3欄佈局(最新文章/熱門文章/操作日誌) | ✅ **ENHANCED v2** |
| 文章管理 | /admin/articles | 版本歷史 + 批次操作 + Markdown 預覽/工具列/封面圖片/搜尋過濾/字數統計 | ✅ ENHANCED v2 |
| 部落管理 | /admin/tribes | 部落 CRUD + 地理資訊 | ✅ |
| 族語管理 | /admin/vocabulary | 詞彙 CRUD + 分類/發音/例句 | ✅ |
| 活動管理 | /admin/events | 活動 CRUD + 日期/地點 | ✅ |
| 媒體管理 | /admin/media | 媒體 CRUD + 類型/URL | ✅ |
| 會員管理 | /admin/users | 用戶列表 + 角色權限管理 | ✅ |
| 留言管理 | /admin/comments | 留言審核 + 刪除 | ✅ |
| 審核管理 | /admin/approval | 審核隊列 + 核准/退回 + 統計 | ✅ |
| Feature Flags | /admin/feature-flags | 功能開關管理 + 範圍設定 | ✅ |
| AI 工具 | /admin/ai-tools | AI 功能管理 + 測試面板 | ✅ |
| 系統監控 | /admin/monitoring | CPU/記憶體/服務健康/系統日誌 | ✅ |
| 操作日誌 | /admin/audit-logs | 管理員操作記錄 | ✅ |
| 資料匯出 | /admin/exports | CSV 匯出 (用戶/文章/詞彙/活動/部落) | ✅ |
| 系統設定 | /admin/settings | 全站/安全/內容/通知設定 | ✅ |

#### 共用元件 (Upgraded in v4.7)
| Component | Path | Description | v4.7 Changes |
|-----------|------|-------------|--------------|
| Header | components/layout/Header.tsx | **全面升級**: 智慧搜尋 (⌘K 快捷鍵+快速前往+overlay) + 使用者下拉選單(角色標籤+頭像) + 通知徽章(即時計數) + 捲動壓縮效果 + 活躍路由底線指示器 + 響應式漢堡選單 | ✅ **NEW v4.7** |
| Footer | components/layout/Footer.tsx | **全面升級**: CTA 橫幅 + 5 欄佈局 + 每日一句族語(互動切換) + 平台統計數字帶 + 社群圖標連結 | ✅ **NEW v4.7** |
| AuthProvider | lib/auth-context.tsx | 認證狀態 Context | — |
| ThemeProvider | lib/theme-context.tsx | 暗色模式 Context | — |
| ToastProvider | lib/toast-context.tsx | Toast 通知 Context | — |
| Skeleton | components/ui/Skeleton.tsx | 載入骨架組件 | — |
| Modal | components/ui/Modal.tsx | 通用 Modal | — |

### v4.7 New Features (Phase 9)
- 🏠 **首頁升級 v2** — IntersectionObserver 動畫計數器 + SVG 波浪分隔線 + 互動卡片(hover translate/scale) + 漸層光球裝飾 + 文章日期顯示 + 活動類型色彩標籤
- 🎪 **活動頁面升級** — 倒計時天數計算 + 多色類型標籤系統 + 搜尋過濾 + 已結束灰化效果 + 報名人數即時更新
- 💬 **社群討論頁升級** — 多板塊系統(一般/族語/文化/活動) + 帖子詳情展開 + 回覆/按讚互動 + 發文字數統計 + 板塊描述
- 🏘️ **部落詳情頁升級** — 追蹤/取消追蹤 + 粉絲數統計 + 3 圖標分享(Facebook/Twitter/LINE) + 文化標籤(歷史/遷移/祭典) + Google Maps iframe 嵌入 + 相關文章推薦
- 📊 **管理儀表板升級 v2** — 即時時鐘 + 一鍵資料更新 + 系統健康狀態列(API/路由/DB/內容數) + Sparkline 迷你圖表 + 操作日誌面板 + 審核三色進度條 + 內容分佈長條圖(漸層) + 3 欄下方區(最新文章/熱門文章/操作日誌) + Skeleton 載入動畫 + 版本資訊 footer
- 🔍 **Header 全面升級** — 搜尋 overlay (⌘K 快捷鍵+快速前往連結) + 使用者下拉選單(角色標籤+頭像初始字母) + 通知徽章(API 即時取得未讀數) + 捲動壓縮效果(h-16→h-14) + 活躍路由底線指示器 + 鍵盤快捷鍵(ESC 關閉)
- 🦶 **Footer 全面升級** — CTA 橫幅(族語測驗邀請) + 5 欄佈局(品牌/探索/學習/帳號/族語) + 每日一句族語(互動切換：Mareka tu!) + 平台統計數字帶 + 技術堆疊顯示

### v4.6 Features (Phase 8)
- 🗄️ 完成所有 DB 遷移 — 5 張新表 (learning_records/learned_words/user_badges/approval_items/audit_logs)
- 📖 文章詳情頁 v2 — 上下篇導航 + 作者卡片 + 閱讀剩餘時間 + TOC active tracking + breadcrumb + skeleton
- 📄 文章列表頁升級 — 伺服器端分頁 + 搜尋 + 分類篩選 + 封面圖/作者頭像
- 🔌 新增 API 端點 — `GET /meta/navigation/:id` + `GET /meta/author/:id`
- 🗺️ Sitemap.xml — 動態 sitemap (靜態頁面 + 已發布文章)，每小時 revalidate
- 🤖 robots.txt — 自動產生 + 404 文化風格頁面

### v4.5 Features (Phase 7)
- 🗄️ DB 遷移 — 6 張新表遷入 PostgreSQL
- 📝 文章版本歷史 — 自動保存版本、查看/還原
- 🔄 批次操作 — 批次發布/草稿/刪除

### v4.4 Features (Phase 6)
- 🏠 首頁升級 — 文化景點展示區、排行榜
- 👤 個人資料升級 — 7 分頁
- 📝 文章編輯器升級 — Markdown 工具列
- 🔒 API Rate Limiting — 全域 120 + Auth 10 req/min
- 🔄 JWT Refresh + SEO Meta Tags

### v4.3-v4.1 Features (Phase 3-5)
- 文化景點 + 活動報名 + 審核管理 + CSV 匯出 + 學習進度
- Feature Flags + AI 工具 + 監控 + 設定 + 搜尋升級
- 暗色模式 + 部落地圖 + 族語測驗 + 每日一詞

## Data Architecture
- **Database**: PostgreSQL 17.6 on Supabase (ap-southeast-1)
- **ORM**: Drizzle ORM v0.39
- **Tables (22)**: users, tribes, articles, vocabulary, events, media, comments, likes, bookmarks, tribe_follows, notifications, discussions, discussion_replies, discussion_likes, cultural_sites, event_registrations, article_versions, learning_records, learned_words, user_badges, approval_items, audit_logs
- **In-Memory**: feature_flags only (configuration data, not persistence-critical)

## Seed Data
| Table | Count | Description |
|-------|-------|-------------|
| tribes | 8 | 卑南八社 (南王、知本、建和、利嘉、初鹿、龍過脈、下賓朗、寶桑) |
| users | 3 | admin, editor, user |
| articles | 14 | 文化、工藝、語言、信仰、音樂、歷史 |
| vocabulary | 14 | 問候、親屬、自然、數字、文化、日常 |
| events | 5 | 祭典、活動、工作坊、展覽 |
| media | 5 | 照片、影片、音檔 |
| discussions | 4 | 綜合/族語/文化/活動討論 (DB) |
| cultural_sites | 8 | 集會所、祭祀場、遺址、工藝坊等 (DB) |
| approval_items | 4 | 預設審核項目 (DB) |
| audit_logs | 2 | 系統操作記錄 (DB) |

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pinuyumayan.tw | admin123 |
| Editor | editor@pinuyumayan.tw | editor123 |
| User | user@pinuyumayan.tw | user123 |

## API Endpoints Quick Reference
```
# Auth
POST /api/auth/register, /login, /refresh, /change-password, /forgot-password, /reset-password
GET  /api/auth/me     PUT /api/auth/me

# Content
GET  /api/tribes            GET /api/tribes/:id
GET  /api/articles          GET /api/articles/:slug
GET  /api/articles/meta/navigation/:id   GET /api/articles/meta/author/:id
POST /api/articles          PUT /api/articles/:id   DELETE /api/articles/:id
GET  /api/language/vocabulary   GET /api/language/daily
GET  /api/events            GET /api/media
GET  /api/search?q=         GET /api/cultural-sites   GET /api/cultural-sites/nearby

# Social
GET/POST /api/discussions   POST /api/discussions/:id/replies   POST /api/discussions/:id/like
POST /api/comments/article/:id   POST /api/bookmarks/:articleId   POST /api/follows/:tribeId

# Learning
GET  /api/learning/progress   GET /api/learning/leaderboard
POST /api/learning/quiz-result   POST /api/learning/mark-learned

# Registrations
POST/DELETE /api/registrations/events/:id   GET /api/registrations/my

# Workflows (Versioning)
GET /api/workflows/articles/:id/versions   POST /api/workflows/versions/:id/restore

# Batch (Admin)
POST /api/articles/batch/publish   POST /api/articles/batch/delete

# Admin
GET /api/admin/stats, /dashboard, /users, /comments, /audit-logs
GET /api/approval/queue   GET /api/exports/:type

# Rate Limit: 120 req/min global, 10 req/min auth endpoints
```

## Development
```bash
npm install
cd apps/api && npx nest start --watch    # API (port 3001)
cd apps/web && npx next dev              # Frontend (port 3000)

# PM2 (Production-like)
pm2 start ecosystem.config.cjs

# Database
npx drizzle-kit generate && npx drizzle-kit push && npm run db:seed
```

## Deployment Status
- **Supabase PostgreSQL**: ✅ Connected (22 tables)
- **NestJS API (Render)**: ✅ Deployed
- **Next.js Frontend (Vercel)**: ⚠️ 需重新連結 GitHub 自動部署
- **GitHub**: ✅ https://github.com/fj5200-ui/pinuyumayan

## Progress
- **Phase 1-3** ✅ 核心功能 + 密碼管理 + CMS + 日誌 + Dashboard
- **Phase 4** ✅ Feature Flags + AI 工具 + 監控 + 設定 + 討論 + 搜尋升級
- **Phase 5** ✅ 文化景點 + 活動報名 + 審核管理 + CSV 匯出 + 學習進度追蹤
- **Phase 6** ✅ 首頁/Profile/Dashboard/編輯器升級 + Rate Limiting + JWT Refresh + SEO
- **Phase 7** ✅ DB 遷移 (6 新表) + 文章版本歷史 + 批次操作 + Workflows
- **Phase 8** ✅ 完成所有 DB 遷移 (5 新表) + 文章 v2 + Sitemap + robots.txt + 404
- **Phase 9** ✅ 前端 UX 大升級 — 首頁 v2(動畫計數器) + 活動 v2(倒計時) + 社群 v2(多板塊) + 部落詳情 v2(追蹤/分享/地圖) + Dashboard v2(健康狀態/Sparkline/操作日誌) + Header v2(⌘K 搜尋/使用者選單/通知) + Footer v2(CTA/族語/統計)
- **Overall**: ~80% of planned system (37 routes, 19 API modules, 22 DB tables)

## Planned (Not Yet Implemented)
- OAuth 社群登入 (Google/Facebook/LINE)
- 2FA 雙因素驗證
- 即時聊天 (WebSocket)
- 手寫/語音辨識
- AI 翻譯 (實際 API 串接)
- CI/CD Pipeline + E2E 測試
- PWA 離線支援

## Last Updated
2026-04-02 v4.7
