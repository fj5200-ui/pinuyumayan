# Pinuyumayan 卑南族入口網 v4.1

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

### Backend — NestJS API (12 Modules)
| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | POST /register, /login, GET /me, PUT /me | JWT 認證 + 個人資料編輯 |
| Tribes | GET /, /:id | 卑南八社資料 |
| Articles | GET /, /:slug, POST /, PUT /:id, DELETE /:id | 文化誌文章 CRUD |
| Language | GET /vocabulary, /daily, /categories, POST/PUT/DELETE | 族語詞彙 + 每日一詞 |
| Events | GET /, /:id, POST /, PUT /:id, DELETE /:id | 活動祭典 |
| Media | GET /, /:id, POST /, DELETE /:id | 媒體庫 |
| Comments | GET /article/:id, POST /article/:id, DELETE /:id, POST /article/:id/like | 留言與按讚 |
| Bookmarks | GET /, POST /:articleId, GET /check/:articleId | 文章收藏 |
| Follows | GET /, POST /:tribeId, GET /check/:tribeId, GET /tribe/:tribeId/count | 部落追蹤 |
| Notifications | GET /, GET /unread-count, PUT /read-all, PUT /:id/read, DELETE /:id | 通知系統 |
| Search | GET /?q=keyword | 全站搜尋 |
| Admin | GET /users, PUT /users/:id/role, GET /comments, DELETE /comments/:id | 管理後台 |

### Frontend — Next.js Pages (18 Pages)
| Page | Path | Description | Status |
|------|------|-------------|--------|
| 首頁 | / | Hero + 每日一詞 + 部落/文章/族語/活動摘要 | ✅ |
| 部落列表 | /tribes | 卑南八社一覽 + 地圖檢視按鈕 | ✅ |
| 部落詳情 | /tribes/[id] | 部落歷史、追蹤、Google Maps 連結 | ✅ |
| 部落地圖 | /tribes/map | Leaflet 互動地圖 + 側邊欄 | ✅ NEW |
| 文化誌 | /articles | 文章列表 (分類篩選) | ✅ |
| 文章詳情 | /articles/[slug] | 全文、留言、按讚、收藏、分享 | ✅ |
| 族語學習 | /language | 詞彙分類瀏覽、發音、測驗入口 | ✅ |
| 族語測驗 | /language/quiz | 四選一測驗、連續答對、雙向模式 | ✅ NEW |
| 活動祭典 | /events | 活動列表 (類型篩選) | ✅ |
| 媒體庫 | /media | 照片/影片/音檔 (類型篩選) | ✅ |
| 搜尋 | /search | 全站搜尋 (文章/詞彙/部落/活動) | ✅ |
| 登入 | /login | JWT 登入 + 測試帳號提示 | ✅ |
| 註冊 | /register | 帳號註冊 + 密碼確認 | ✅ |
| 個人資料 | /profile | 編輯資料、收藏/追蹤分頁 | ✅ |
| 管理後台 | /admin | 文章CRUD、用戶角色管理、留言管理 | ✅ |
| 通知 | /notifications | 通知列表、已讀/刪除 | ✅ NEW |
| 關於 | /about | 平台使命、技術架構、功能列表 | ✅ |

### v4.1 New Features
- 🌙 **暗色模式** — 全站支援，含主題切換按鈕
- 🗺️ **部落地圖** — Leaflet 互動地圖顯示卑南八社地理位置
- 🎯 **族語測驗** — 四選一、卑南語⇄中文雙向模式、連續答對紀錄
- 📅 **每日一詞** — 首頁顯示每日隨機詞彙
- 💬 **留言系統** — 文章留言、按讚、收藏功能
- 🏘️ **部落追蹤** — 追蹤/取消追蹤部落、追蹤人數
- 📑 **文章收藏** — 收藏/取消收藏文章
- 🔔 **通知頁面** — 通知列表、全部已讀、刪除
- ⚙️ **管理後台** — 文章 CRUD 編輯器 + 用戶角色管理 + 留言管理
- 👤 **個人資料** — 編輯姓名/自介、收藏/追蹤分頁
- 🦴 **Skeleton Loading** — 全站載入骨架動畫
- 🔥 **Toast 通知** — 操作回饋通知 (成功/錯誤/資訊)
- 🔐 **AuthContext** — React Context 全局認證狀態管理
- 📱 **響應式手機選單** — 漢堡選單 + 行動版導航

### Shared Components
| Component | Path | Description |
|-----------|------|-------------|
| AuthProvider | lib/auth-context.tsx | 認證狀態 Context (login/register/logout/refresh) |
| ThemeProvider | lib/theme-context.tsx | 暗色模式 Context (toggle/persist) |
| ToastProvider | lib/toast-context.tsx | Toast 通知 Context (success/error/info) |
| Skeleton | components/ui/Skeleton.tsx | 載入骨架組件 (Card/Grid) |
| Modal | components/ui/Modal.tsx | 通用 Modal 對話框 |
| Header | components/layout/Header.tsx | 導航列 (dark toggle/auth/responsive) |
| Footer | components/layout/Footer.tsx | 頁尾 (dark mode support) |

## Data Architecture
- **Database**: PostgreSQL 17.6 on Supabase (ap-southeast-1)
- **ORM**: Drizzle ORM v0.39
- **Tables (11)**: users, tribes, articles, vocabulary, events, media, comments, likes, bookmarks, tribe_follows, notifications

## Seed Data
| Table | Count | Description |
|-------|-------|-------------|
| tribes | 8 | 卑南八社 (南王、知本、建和、利嘉、初鹿、龍過脈、下賓朗、寶桑) |
| users | 3 | admin, editor, user |
| articles | 6 | 文化、工藝、語言、信仰、音樂、歷史 |
| vocabulary | 15 | 問候、親屬、自然、數字、文化、日常 |
| events | 6 | 祭典、活動、工作坊、展覽 |
| media | 5 | 照片、影片、音檔 |

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pinuyumayan.tw | admin123 |
| Editor | editor@pinuyumayan.tw | editor123 |
| User | user@pinuyumayan.tw | user123 |

## Development
```bash
# Install dependencies
npm install

# Start API (port 3001)
cd apps/api && npx nest start --watch

# Start Frontend (port 3000)
cd apps/web && npx next dev

# Or with PM2
pm2 start "node dist/apps/api/src/main.js" --name api --cwd apps/api
pm2 start "npx next start -p 3000 -H 0.0.0.0" --name web --cwd apps/web
```

## Vercel Deployment (Frontend)
在 Vercel Dashboard 連結 GitHub repo `fj5200-ui/pinuyumayan`：
1. Import Git Repository → 選擇 `pinuyumayan`
2. Framework Preset: **Next.js**
3. Root Directory: **apps/web**
4. Environment Variables: `NEXT_PUBLIC_API_URL` = `https://pinuyumayan-api.onrender.com`
5. Deploy

## Deployment Status
- **Supabase PostgreSQL**: ✅ Connected (uzwuqythcvqyhhxvqpzf, ap-southeast-1)
- **NestJS API (Render)**: ✅ Deployed → https://pinuyumayan-api.onrender.com
- **Next.js Frontend (Vercel)**: ⚠️ 需重新連結 GitHub 自動部署
- **GitHub (Monorepo)**: ✅ https://github.com/fj5200-ui/pinuyumayan
- **GitHub (API)**: ✅ https://github.com/fj5200-ui/pinuyumayan-api
- **Swagger API Docs**: https://pinuyumayan-api.onrender.com/api/docs

## Last Updated
2026-04-01 v4.1
