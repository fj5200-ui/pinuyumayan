# Pinuyumayan 卑南族入口網 v4.3

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

### Backend — NestJS API (18 Modules)
| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | POST /register, /login, /change-password, /forgot-password, /reset-password, GET /me, PUT /me | JWT 認證 + 密碼管理 |
| Tribes | GET /, /:id | 卑南八社資料 |
| Articles | GET /, /:slug, /meta/categories, /meta/related/:id, /meta/sitemap, POST /, PUT /:id, DELETE /:id | 文化誌文章 CRUD |
| Language | GET /vocabulary, /daily, /categories, POST/PUT/DELETE | 族語詞彙 + 每日一詞 |
| Events | GET /, /:id, POST /, PUT /:id, DELETE /:id | 活動祭典 |
| Media | GET /, /:id, POST /, DELETE /:id | 媒體庫 |
| Comments | GET /article/:id, POST /article/:id, DELETE /:id, POST /article/:id/like | 留言與按讚 |
| Bookmarks | GET /, POST /:articleId, GET /check/:articleId | 文章收藏 |
| Follows | GET /, POST /:tribeId, GET /check/:tribeId, GET /tribe/:tribeId/count | 部落追蹤 |
| Notifications | GET /, GET /unread-count, PUT /read-all, PUT /:id/read, DELETE /:id | 通知系統 |
| Search | GET /?q=keyword | 全站搜尋 |
| Admin | GET /stats, /dashboard, /users, /comments, /audit-logs, PUT /users/:id/role, DELETE /comments/:id, POST+PUT+DELETE /tribes, /events, /media, /vocabulary | 管理後台完整 CRUD |
| Discussions | GET /, /:id, POST /, /:id/replies, /:id/like, DELETE /:id | 社群討論系統 |
| Learning | GET /progress, /leaderboard, POST /quiz-result, /mark-learned | 學習進度追蹤 + 徽章 + 排行榜 |
| Registrations | POST /events/:id, DELETE /events/:id, GET /events/:id, /my, /check/:id | 活動報名系統 |
| Approval | GET /queue, POST /:id/approve, /:id/reject, /submit | 內容審核管理 |
| CulturalSites | GET /, /:id, /nearby | 文化景點 + 地理搜尋 |
| Exports | GET /:type (users/articles/vocabulary/events/tribes) | CSV 匯出 |

### Frontend — Next.js Pages (35 Routes)

#### 前台頁面 (18 頁)
| Page | Path | Description | Status |
|------|------|-------------|--------|
| 首頁 | / | Hero + 動態統計 + 每日一詞 + 部落/文章/族語/活動摘要 | ✅ |
| 部落列表 | /tribes | 卑南八社一覽 + 地圖檢視按鈕 | ✅ |
| 部落詳情 | /tribes/[id] | 部落歷史、追蹤、Google Maps 連結 | ✅ |
| 部落地圖 | /tribes/map | Leaflet 互動地圖 + 圖層切換 | ✅ |
| 文化誌 | /articles | 文章列表 (分類篩選) | ✅ |
| 文章詳情 | /articles/[slug] | 全文、留言、按讚、收藏、閱讀進度條、分享按鈕 | ✅ |
| 族語學習 | /language | 詞彙分類瀏覽、發音、對話、學習進度+徽章+排行榜 | ✅ ENHANCED |
| 族語測驗 | /language/quiz | 四選一測驗、連續答對、雙向模式 | ✅ |
| 活動祭典 | /events | 活動列表 + 線上報名/取消報名 + 報名人數 | ✅ ENHANCED |
| 文化景點 | /cultural-sites | 文化景點列表/地圖 + 類型篩選 + GIS 定位 | ✅ NEW |
| 媒體庫 | /media | 照片/影片/音檔 (類型篩選) | ✅ |
| 社群討論 | /community | 討論板、發文、回覆、按讚 (API 連動) | ✅ |
| 搜尋 | /search | 自動完成 + 類型篩選 + 關鍵字高亮 | ✅ |
| 登入 | /login | JWT 登入 + 測試帳號提示 | ✅ |
| 註冊 | /register | 帳號註冊 + 密碼確認 | ✅ |
| 忘記密碼 | /forgot-password | 發送重設連結 | ✅ |
| 個人資料 | /profile | 基本資料/收藏/追蹤/修改密碼 四分頁 | ✅ |
| 通知 | /notifications | 通知列表、已讀/刪除 | ✅ |

#### 管理後台 (15 頁)
| Page | Path | Description | Status |
|------|------|-------------|--------|
| Dashboard | /admin | 統計總覽 + 七日新增 + 近期文章/留言 + 熱門文章 | ✅ |
| 文章管理 | /admin/articles | 文章 CRUD 編輯器 + 分類/標籤/發布狀態 | ✅ |
| 部落管理 | /admin/tribes | 部落 CRUD + 地理資訊 | ✅ |
| 族語管理 | /admin/vocabulary | 詞彙 CRUD + 分類/發音/例句 | ✅ |
| 活動管理 | /admin/events | 活動 CRUD + 日期/地點 | ✅ |
| 媒體管理 | /admin/media | 媒體 CRUD + 類型/URL | ✅ |
| 會員管理 | /admin/users | 用戶列表 + 角色權限管理 | ✅ |
| 留言管理 | /admin/comments | 留言審核 + 刪除 | ✅ |
| 審核管理 | /admin/approval | 審核隊列 + 核准/退回 + 統計 | ✅ NEW |
| Feature Flags | /admin/feature-flags | 功能開關管理 + 範圍設定 | ✅ |
| AI 工具 | /admin/ai-tools | AI 功能管理 + 測試面板 | ✅ |
| 系統監控 | /admin/monitoring | CPU/記憶體/服務健康/系統日誌 | ✅ |
| 操作日誌 | /admin/audit-logs | 管理員操作記錄 | ✅ |
| 資料匯出 | /admin/exports | CSV 匯出 (用戶/文章/詞彙/活動/部落) | ✅ NEW |
| 系統設定 | /admin/settings | 全站/安全/內容/通知設定 | ✅ |

### v4.3 New Features (Phase 5)
- 🏺 **文化景點** — 文化遺產景點列表與地圖瀏覽，8 個卑南族重要景點，支援類型篩選、GIS 定位
- 📝 **活動報名** — 活動線上報名/取消報名，即時報名人數顯示，報名狀態管理
- 📋 **審核管理** — 內容審核隊列 (文章/留言/媒體/活動)，核准/退回/備註，統計面板
- 📊 **資料匯出** — 管理員 CSV 匯出功能 (5 種資料類型)，UTF-8 BOM 編碼
- 📈 **學習進度追蹤** — 測驗記錄、正確率統計、連續學習天數、成就徽章 (8 種)、學習排行榜
- 🎯 **新增 5 個 API 模組** — Learning, Registrations, Approval, CulturalSites, Exports
- 🗺️ **導航欄新增文化景點** — Header 加入文化景點連結

### v4.2 Features (Phase 4)
- 🚩 Feature Flags — 功能開關管理
- 🤖 AI 工具管理 — AI 功能列表、狀態切換、測試面板
- 📡 系統監控 — 即時 CPU/記憶體/磁碟監控
- ⚙️ 系統設定 — 一般/內容/安全/通知四大分類設定
- 💬 社群討論 API — Discussions 模組
- 🔍 搜尋升級 — 自動完成提示、類型篩選

### v4.1 Features
- 🌙 暗色模式 — 全站支援
- 🗺️ 部落地圖 — Leaflet 互動地圖
- 🎯 族語測驗 — 四選一雙向模式
- 📅 每日一詞 — 首頁顯示
- 💬 留言系統 — 文章留言、按讚、收藏
- 🔔 通知頁面 — 通知列表
- ⚙️ 管理後台 — 完整 CRUD
- 🦴 Skeleton Loading — 全站載入骨架動畫
- 🔐 AuthContext — 全局認證狀態

### Shared Components
| Component | Path | Description |
|-----------|------|-------------|
| AuthProvider | lib/auth-context.tsx | 認證狀態 Context |
| ThemeProvider | lib/theme-context.tsx | 暗色模式 Context |
| ToastProvider | lib/toast-context.tsx | Toast 通知 Context |
| Skeleton | components/ui/Skeleton.tsx | 載入骨架組件 |
| Modal | components/ui/Modal.tsx | 通用 Modal |
| Header | components/layout/Header.tsx | 導航列 (含文化景點) |
| Footer | components/layout/Footer.tsx | 頁尾 |

## Data Architecture
- **Database**: PostgreSQL 17.6 on Supabase (ap-southeast-1)
- **ORM**: Drizzle ORM v0.39
- **Tables (11)**: users, tribes, articles, vocabulary, events, media, comments, likes, bookmarks, tribe_follows, notifications
- **In-Memory**: discussions, audit_logs, feature_flags, learning_records, registrations, approval_items, cultural_sites

## Seed Data
| Table | Count | Description |
|-------|-------|-------------|
| tribes | 8 | 卑南八社 (南王、知本、建和、利嘉、初鹿、龍過脈、下賓朗、寶桑) |
| users | 3 | admin, editor, user |
| articles | 6 | 文化、工藝、語言、信仰、音樂、歷史 |
| vocabulary | 15 | 問候、親屬、自然、數字、文化、日常 |
| events | 6 | 祭典、活動、工作坊、展覽 |
| media | 5 | 照片、影片、音檔 |
| discussions | 4 | 綜合/族語/文化/活動討論 |
| cultural_sites | 8 | 集會所、祭祀場、遺址、工藝坊等 |
| approval_items | 4 | 預設審核項目 (3 待審、1 已核准) |

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pinuyumayan.tw | admin123 |
| Editor | editor@pinuyumayan.tw | editor123 |
| User | user@pinuyumayan.tw | user123 |

## API Endpoints Quick Reference
```
# Auth
POST /api/auth/register           # 註冊
POST /api/auth/login              # 登入
GET  /api/auth/me                 # 取得個人資料 (JWT)
PUT  /api/auth/me                 # 更新個人資料 (JWT)
POST /api/auth/change-password    # 修改密碼 (JWT)
POST /api/auth/forgot-password    # 忘記密碼
POST /api/auth/reset-password     # 重設密碼

# Content
GET  /api/tribes                  # 部落列表
GET  /api/articles                # 文章列表 (?page, ?limit, ?category, ?search)
GET  /api/articles/:slug          # 單篇文章
POST /api/articles                # 新增文章 (JWT)
GET  /api/language/vocabulary     # 詞彙列表
GET  /api/language/daily          # 每日一詞
GET  /api/events                  # 活動列表
GET  /api/media                   # 媒體列表
GET  /api/search?q=               # 全站搜尋
GET  /api/cultural-sites          # 文化景點列表 (?type)
GET  /api/cultural-sites/nearby   # 附近景點 (?lat, ?lng, ?radius)
GET  /api/cultural-sites/:id      # 單一景點

# Social
GET    /api/discussions            # 討論列表 (?board)
GET    /api/discussions/:id        # 討論詳情+回覆
POST   /api/discussions            # 發布討論 (JWT)
POST   /api/discussions/:id/replies # 回覆 (JWT)
POST   /api/discussions/:id/like   # 按讚 (JWT)
POST   /api/comments/article/:id   # 留言 (JWT)
POST   /api/bookmarks/:articleId   # 收藏 (JWT)
POST   /api/follows/:tribeId       # 追蹤 (JWT)

# Learning
GET  /api/learning/progress       # 學習進度 (JWT)
GET  /api/learning/leaderboard    # 排行榜
POST /api/learning/quiz-result    # 記錄測驗 (JWT)
POST /api/learning/mark-learned   # 標記學會 (JWT)

# Registrations
POST   /api/registrations/events/:id   # 報名活動 (JWT)
DELETE /api/registrations/events/:id   # 取消報名 (JWT)
GET    /api/registrations/events/:id   # 活動報名列表
GET    /api/registrations/my           # 我的報名 (JWT)
GET    /api/registrations/check/:id    # 檢查報名狀態 (JWT)

# Approval (Admin)
GET  /api/approval/queue          # 審核隊列 (?status, ?type)
POST /api/approval/:id/approve    # 核准
POST /api/approval/:id/reject     # 退回
POST /api/approval/submit         # 送出審核 (JWT)

# Exports (Admin)
GET /api/exports/:type            # CSV 匯出 (users/articles/vocabulary/events/tribes)

# Admin
GET  /api/admin/stats             # 站台統計 (Public)
GET  /api/admin/dashboard         # 管理 Dashboard (Admin)
GET  /api/admin/audit-logs        # 操作日誌 (Admin)
POST /api/admin/tribes            # 新增部落 (Admin)
# 同理: /admin/events, /admin/media, /admin/vocabulary, /admin/users, /admin/comments
```

## Development
```bash
# Install dependencies
npm install

# Start API (port 3001)
cd apps/api && npx nest start --watch

# Start Frontend (port 3000)
cd apps/web && npx next dev

# Or with PM2
pm2 start ecosystem.config.cjs
```

## Vercel Deployment (Frontend)
在 Vercel Dashboard 連結 GitHub repo `fj5200-ui/pinuyumayan`:
1. Import Git Repository -> 選擇 `pinuyumayan`
2. Framework Preset: **Next.js**
3. Root Directory: **apps/web**
4. Environment Variables: `NEXT_PUBLIC_API_URL` = `https://pinuyumayan-api.onrender.com`
5. Deploy

## Deployment Status
- **Supabase PostgreSQL**: ✅ Connected
- **NestJS API (Render)**: ✅ Deployed -> https://pinuyumayan-api.onrender.com
- **Next.js Frontend (Vercel)**: ⚠️ 需重新連結 GitHub 自動部署
- **GitHub (Monorepo)**: ✅ https://github.com/fj5200-ui/pinuyumayan

## Planned (Not Yet Implemented)
- OAuth 社群登入 (Google/Facebook/LINE)
- 2FA 雙因素驗證
- 即時聊天 (WebSocket)
- 文章版本歷史
- 手寫辨識
- 語音辨識
- AI 翻譯 (實際 API 串接)
- 批次操作
- CI/CD Pipeline
- E2E 測試

## Progress
- **Phase 1** ✅ 核心功能 (18 頁, 12 模組, 11 資料表)
- **Phase 2** ✅ 密碼管理 + CMS 管理 + 文章進階 + 地圖/語言/社群
- **Phase 3** ✅ 操作日誌 + API 統計 + Dashboard
- **Phase 4** ✅ Feature Flags + AI 工具 + 監控 + 設定 + 討論 API + 搜尋升級
- **Phase 5** ✅ 文化景點 + 活動報名 + 審核管理 + 資料匯出 + 學習進度追蹤
- **Overall**: ~60% of planned system (35 routes, 18 API modules)

## Last Updated
2026-04-02 v4.3
