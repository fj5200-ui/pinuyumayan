# Pinuyumayan 卑南族入口網 v4.9

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
| 首頁 | / | 動畫計數器 + 波浪分隔線 + 互動卡片(hover) + 動態統計 + 每日一詞 + 部落/文章/族語/活動 + 文化景點 + 排行榜 | ✅ **v2** |
| 部落列表 | /tribes | 卑南八社一覽 + 地圖檢視 | ✅ |
| 部落詳情 | /tribes/[id] | 追蹤 + 粉絲數 + 分享 + 文化標籤 + Google Maps + 相關文章 | ✅ **ENHANCED** |
| 部落地圖 | /tribes/map | Leaflet 互動地圖 + 圖層切換 | ✅ |
| 文化誌 | /articles | 文章列表 + 分頁 + 搜尋 + 分類篩選 + 封面圖 + 作者頭像 | ✅ |
| 文章詳情 | /articles/[slug] | Markdown + TOC(active tracking) + 上下篇導航 + 作者卡片 + 閱讀時間 + breadcrumb + skeleton | ✅ **v2** |
| 族語學習 | /language | **升級 v3**: Hero+每日一詞 + 🃏閃卡模式(翻轉動畫/ALL/未學/隨機) + 圓形進度環SVG + 分類進度條 + 對話場景(5組) + 排行榜 | ✅ **ENHANCED v3** |
| 族語測驗 | /language/quiz | 四選一測驗、連續答對、雙向模式 | ✅ |
| 活動祭典 | /events | 倒計時天數 + 多色標籤 + 搜尋過濾 + 已結束灰化 + 報名人數 | ✅ **v2** |
| 文化景點 | /cultural-sites | **升級 v2**: Hero動畫+統計 + Leaflet地圖(圖例/導航popup) + 📍附近排序(Haversine) + 距離標示(km) + 詳情側欄 + Skeleton載入 | ✅ **ENHANCED v2** |
| 媒體庫 | /media | **升級 v2**: Hero + 瀑布流網格 + 類型Badge + 排序 + 詳情Modal + Lightbox + Skeleton | ✅ **ENHANCED v2** |
| 社群討論 | /community | 多板塊系統 + 回覆展開 + 按讚互動 + 發文表單驗證 + 字數統計 | ✅ **v2** |
| 搜尋 | /search | **升級 v2**: Hero深色主題 + 🕐搜尋歷史(localStorage) + 🔥熱門關鍵字(9組) + 搜尋耗時 + 日曆組件 + Skeleton | ✅ **ENHANCED v2** |
| 關於我們 | /about | **升級 v2**: 動態統計卡 + 時間線歷史 + 團隊介紹 + 技術架構圖 + FAQ + 訪客留言 | ✅ **ENHANCED v2** |
| 登入 | /login | JWT 登入 + 測試帳號提示 | ✅ |
| 註冊 | /register | 帳號註冊 + 密碼確認 | ✅ |
| 忘記密碼 | /forgot-password | 發送重設連結 | ✅ |
| 個人資料 | /profile | **升級 v2**: Hero(漸層頭像+角色標籤+會員天數) + 統計列(4格) + 7分頁 + 密碼強度條 + 空狀態美化 | ✅ **ENHANCED v2** |
| 通知 | /notifications | 通知列表、已讀/刪除 | ✅ |

#### 管理後台 (15 頁)
| Page | Path | Description | Status |
|------|------|-------------|--------|
| Dashboard | /admin | 即時時鐘 + 系統健康列 + Sparkline + 操作日誌面板 + 審核進度條 + 內容分佈圖 | ✅ **v2** |
| 文章管理 | /admin/articles | 版本歷史 + 批次操作 + Markdown 預覽/工具列 | ✅ |
| 部落管理 | /admin/tribes | CRUD + 地理資訊 | ✅ |
| 族語管理 | /admin/vocabulary | CRUD + 分類/發音/例句 | ✅ |
| 活動管理 | /admin/events | CRUD + 日期/地點 | ✅ |
| 媒體管理 | /admin/media | CRUD + 類型/URL | ✅ |
| 會員管理 | /admin/users | 用戶列表 + 角色管理 | ✅ |
| 留言管理 | /admin/comments | 審核 + 刪除 | ✅ |
| 審核管理 | /admin/approval | 審核隊列 + 核准/退回 | ✅ |
| Feature Flags | /admin/feature-flags | 功能開關 + 範圍設定 | ✅ |
| AI 工具 | /admin/ai-tools | AI 管理 + 測試面板 | ✅ |
| 系統監控 | /admin/monitoring | CPU/記憶體/服務健康 | ✅ |
| 操作日誌 | /admin/audit-logs | 管理員操作記錄 | ✅ |
| 資料匯出 | /admin/exports | CSV 匯出 | ✅ |
| 系統設定 | /admin/settings | 全站/安全/內容/通知設定 | ✅ |

#### 共用元件
| Component | Description | Version |
|-----------|-------------|---------|
| Header | Glassmorphism 導覽列 + ⌘K搜尋overlay + 使用者下拉選單 + 通知徽章 + 捲動壓縮 + 路由指示器 + 漸層品牌Logo + 暗色模式切換 | **v4.9 glass** |
| Footer | Glassmorphism 頁尾 + CTA漸層橫幅 + 5欄佈局 + 每日族語 + 平台統計Ribbon + 社群連結 | **v4.9 glass** |
| AuthProvider | JWT 認證狀態 Context | v4.0 |
| ThemeProvider | 暗色模式 Context | v4.0 |
| ToastProvider | Toast 通知 Context | v4.0 |

### Design System — v4.9 Glassmorphism
| Token | Value | Usage |
|-------|-------|-------|
| --red | #b91c1c | 主色:重要按鈕/Admin標示 |
| --red-light | #ef4444 | 次色:hover/漸層 |
| --yellow | #f59e0b | 強調色:hover/連結 |
| --yellow-light | #facc15 | 漸層/裝飾 |
| --green | #15803d | 成功色:active路由/CTA |
| --green-light | #22c55e | 漸層/進度 |
| --bg-1 | #fff7ed | 暖橙底色 |
| --bg-2 | #fefce8 | 暖黃底色 |
| --bg-3 | #f0fdf4 | 暖綠底色 |
| --gradient-brand | linear-gradient(135deg, red→yellow→green) | 品牌漸層 |
| --white-glass | rgba(255,255,255,0.72) | 毛玻璃背景 |
| --glass-border | rgba(255,255,255,0.35) | 毛玻璃邊框 |
| --shadow-soft | 0 10px 30px rgba(0,0,0,0.08) | 柔和陰影 |
| --shadow-medium | 0 18px 40px rgba(0,0,0,0.12) | 中等陰影 |
| --radius-xl/lg/md | 28px / 22px / 16px | 圓角token |

CSS Classes: `.glass`, `.glass-card`, `.btn-brand`, `.btn-glass`, `.icon-brand`, `.navbar-glass`, `.hero-gradient`, `.cta-gradient`, `.feature-glass`, `.section-heading`

### v4.9 New Features (Phase 10 CSS)
- 🎨 **全站設計系統** — Red/Yellow/Green 配色 + CSS Custom Properties + 漸層品牌token
- 🧊 **Glassmorphism 毛玻璃設計** — backdrop-filter blur + 半透明白底 + 玻璃邊框 + 深色模式對應
- 🔝 **Header v3 (glassmorphism)** — `.navbar-glass` sticky 毛玻璃 + 品牌漸層Logo + 桌面/手機自適應 + ⌘K搜尋overlay + 使用者頭像(漸層初始字母) + 通知bounce + active路由底線 + 捲動壓縮(68→56px)
- 🦶 **Footer v3 (glassmorphism)** — CTA漸層橫幅(註冊+測驗) + 毛玻璃容器 + 5欄佈局(品牌/探索/學習/帳號) + 社群icon + 每日族語toggle + 統計Ribbon(8部落/6+文章/15+詞彙/6+活動/6+景點) + 版權
- 🌈 **Body 背景** — 三色放射漸層(紅/黃/綠 radial-gradient) + fixed attachment
- 🎴 **Glass Card** — 彩虹頂部條 + hover上浮(-6px) + shadow升級 + 深色模式
- 🟢 **Button 系統** — `.btn-brand`(漸層+白字+hover升浮) + `.btn-glass`(毛玻璃+hover亮化)
- 🌊 **動畫** — slide-in / fade-in / pulse-slow / float + Tailwind utility classes

### v4.8 Features (Phase 10 Pages)
- 🏺 **文化景點頁升級 v2** — Hero + Leaflet地圖 + 附近排序(Haversine) + 詳情側欄 + Skeleton
- 📖 **族語學習頁升級 v3** — Hero+每日一詞 + 閃卡3D翻轉 + 圓形SVG進度環 + 分類進度條
- 🔍 **搜尋頁升級 v2** — 深色Hero + 搜尋歷史 + 熱門關鍵字 + 搜尋耗時 + 日曆
- 👤 **個人資料頁升級 v2** — Hero + 統計列 + 密碼強度條 + 空狀態美化
- 📰 **關於頁面升級 v2** — 動態統計 + 時間線 + 團隊 + 架構圖 + FAQ
- 🎬 **媒體庫升級 v2** — Hero + 瀑布流 + Badge + 排序 + Modal + Lightbox

### v4.7 Features (Phase 9)
- 🏠 首頁v2 + 🎪 活動v2 + 💬 社群v2 + 🏘️ 部落詳情v2 + 📊 Dashboard v2 + Header v2 + Footer v2

### v4.6 Features (Phase 8)
- 🗄️ DB 遷移 5 新表 + 文章v2 + Sitemap + robots.txt + 404

### v4.5 Features (Phase 7)
- 🗄️ DB 遷移 6 新表 + 文章版本歷史 + 批次操作

### v4.4 Features (Phase 6)
- 首頁/Profile/Dashboard/編輯器升級 + Rate Limiting + JWT Refresh + SEO

## Data Architecture
- **Database**: PostgreSQL 17.6 on Supabase (ap-southeast-1)
- **ORM**: Drizzle ORM v0.39
- **Tables (22)**: users, tribes, articles, vocabulary, events, media, comments, likes, bookmarks, tribe_follows, notifications, discussions, discussion_replies, discussion_likes, cultural_sites, event_registrations, article_versions, learning_records, learned_words, user_badges, approval_items, audit_logs
- **In-Memory**: feature_flags only

## Seed Data
| Table | Count | Description |
|-------|-------|-------------|
| tribes | 8 | 卑南八社 |
| users | 3 | admin, editor, user |
| articles | 14 | 文化、工藝、語言等 |
| vocabulary | 14 | 問候、親屬、自然等 |
| events | 5 | 祭典、活動 |
| media | 5 | 照片、影片、音檔 |
| discussions | 4 | 多板塊討論 |
| cultural_sites | 8 | 文化景點 |

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pinuyumayan.tw | admin123 |
| Editor | editor@pinuyumayan.tw | editor123 |
| User | user@pinuyumayan.tw | user123 |

## Development
```bash
npm install
cd apps/api && npx nest start --watch    # API (port 3001)
cd apps/web && npx next dev              # Frontend (port 3000)

# PM2
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
- **Phase 4** ✅ Feature Flags + AI 工具 + 監控 + 設定 + 討論 + 搜尋
- **Phase 5** ✅ 文化景點 + 活動報名 + 審核管理 + CSV 匯出 + 學習進度
- **Phase 6** ✅ 首頁/Profile/Dashboard/編輯器升級 + Rate Limiting + JWT Refresh + SEO
- **Phase 7** ✅ DB 遷移 (6 新表) + 文章版本歷史 + 批次操作
- **Phase 8** ✅ DB 遷移 (5 新表) + 文章 v2 + Sitemap + robots.txt + 404
- **Phase 9** ✅ 前端 UX 大升級 — 首頁v2 + 活動v2 + 社群v2 + 部落詳情v2 + Dashboard v2 + Header v2 + Footer v2
- **Phase 10** ✅ 頁面深度升級 + CSS 設計系統 + Glassmorphism — 文化景點v2 + 族語v3 + 搜尋v2 + 個人檔案v2 + 關於v2 + 媒體v2 + Header v3(glass) + Footer v3(glass) + 全站Design System
- **Overall**: ~87% of planned system (37 routes, 19 API modules, 22 DB tables)

## Planned (Not Yet Implemented)
- OAuth 社群登入 (Google/Facebook/LINE)
- 2FA 雙因素驗證
- 即時聊天 (WebSocket)
- 手寫/語音辨識
- AI 翻譯 (實際 API 串接)
- CI/CD Pipeline + E2E 測試
- PWA 離線支援

## Last Updated
2026-04-02 v4.9
