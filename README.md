# Pinuyumayan 卑南族入口網 v5.2

## Project Overview
- **Name**: Pinuyumayan (卑南族入口網)
- **Goal**: 保存與推廣卑南族（Puyuma）語言、文化與傳統知識的數位平台
- **Tech Stack**: TypeScript + Next.js 16 + NestJS 10 + PostgreSQL (Supabase) + Drizzle ORM + Tailwind CSS 4

## URLs
- **Frontend (Vercel)**: https://pinuyumayan.vercel.app
- **API (Render)**: https://pinuyumayan-api.onrender.com
- **Swagger Docs**: https://pinuyumayan-api.onrender.com/api/docs
- **GitHub (Monorepo)**: https://github.com/fj5200-ui/pinuyumayan
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
└── ecosystem.config.cjs  # PM2 configuration
```

### Backend — NestJS API (19 Modules, 21 Endpoints Tested)
| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | POST /register, /login, /refresh, /change-password, GET /me, PUT /me | JWT 認證 + Token 刷新 |
| Tribes | GET /, /:id | 卑南八社資料 |
| Articles | GET /, /:slug, /meta/categories, /meta/navigation/:id, /meta/author/:id, POST /, PUT /:id, DELETE /:id | 文化誌 CRUD |
| Language | GET /vocabulary, /daily, /categories, POST/PUT/DELETE | 族語詞彙 |
| Events | GET /, POST /, PUT /:id, DELETE /:id | 活動祭典 |
| Media | GET /, POST /, DELETE /:id | 媒體庫 |
| Comments | GET /article/:id, POST /article/:id, DELETE /:id | 留言系統 |
| Bookmarks | GET /, POST /:articleId, GET /check/:articleId | 文章收藏 |
| Follows | GET /, POST /:tribeId, GET /check/:tribeId | 部落追蹤 |
| Notifications | GET /, PUT /read-all, PUT /:id/read, DELETE /:id | 通知系統 |
| Search | GET /?q=keyword | 全站搜尋 |
| Admin | GET /stats, /users, /audit-logs, PUT /users/:id/role, CRUD (tribes, events, media, vocabulary, discussions, cultural-sites, agents, map-markers, revenue) | 管理後台 |
| Discussions | GET /, /:id, POST /, /:id/replies, /:id/like | 社群討論 |
| Learning | GET /progress, /leaderboard, POST /quiz-result, /mark-learned | 學習進度 + 排行榜 |
| Registrations | POST /events/:id, DELETE /events/:id, GET /my | 活動報名 |
| Approval | POST /:id/approve, /:id/reject | 內容審核 |
| CulturalSites | GET /, /:id | 文化景點 |
| Exports | GET /:type | CSV 匯出 |
| Workflows | GET /articles/:id/versions, POST /versions/:id/restore | 版本歷史 |

### Frontend — Next.js (38 Routes, 20 Admin + 18 Frontend)

#### 前台頁面 (18 頁)
| Page | Path | Status |
|------|------|--------|
| 首頁 | / | ✅ v3 (Cultural Solid) |
| 部落列表 | /tribes | ✅ |
| 部落詳情 | /tribes/[id] | ✅ Enhanced |
| 部落地圖 | /tribes/map | ✅ Leaflet |
| 文化誌 | /articles | ✅ |
| 文章詳情 | /articles/[slug] | ✅ v2 |
| 族語學習 | /language | ✅ v3 |
| 族語測驗 | /language/quiz | ✅ |
| 活動祭典 | /events | ✅ v2 |
| 文化景點 | /cultural-sites | ✅ v2 |
| 媒體庫 | /media | ✅ v2 |
| 社群討論 | /community | ✅ v2 |
| 搜尋 | /search | ✅ v2 |
| 關於我們 | /about | ✅ v2 |
| 登入/註冊/忘記密碼 | /login, /register, /forgot-password | ✅ |
| 個人資料 | /profile | ✅ v2 |
| 通知 | /notifications | ✅ |

#### 管理後台 (20 頁)
| Page | Path | Status |
|------|------|--------|
| Dashboard | /admin | ✅ v2 |
| 文章管理 | /admin/articles | ✅ |
| 部落/族語/活動/媒體 | /admin/tribes, vocabulary, events, media | ✅ |
| 會員/留言/審核 | /admin/users, comments, approval | ✅ |
| Feature Flags / AI / 監控 | /admin/feature-flags, ai-tools, monitoring | ✅ |
| 操作日誌/匯出/設定 | /admin/audit-logs, exports, settings | ✅ |
| 文化景點 | /admin/cultural-sites | ✅ Phase 11 |
| AI Agents | /admin/agents | ✅ Phase 11 |
| 討論管理 | /admin/discussions | ✅ Phase 11 |
| 地圖標記 | /admin/map-markers | ✅ Phase 11 |
| 營收管理 | /admin/revenue | ✅ Phase 11 |

### Design System — v5.2 Cultural Solid (穩重文化感)
| Token | Value | Usage |
|-------|-------|-------|
| --red | #991b1b | 主色：按鈕、標題邊條、active 狀態 |
| --red-hover | #7f1d1d | 按鈕 hover |
| --yellow | #d97706 | 強調色：tag、分類標籤 |
| --green | #166534 | 成功色：狀態標籤 |
| --black | #111111 | 導覽列邊框、Banner 背景 |
| --cream | #f5f5f0 | 頁面底色 |
| --border | #e5e7eb | 卡片/元件邊框 |
| --radius-sm / --radius-md | 6px / 10px | 小圓角 token |
| --shadow-sm / --shadow-md | 0 2px 6px / 0 6px 18px | 陰影 token |
| --color-bar | linear-gradient(→ red, yellow, green) | 三色文化條 |

**CSS Classes**: `.card-solid`, `.glass`(backward compat), `.btn-brand`, `.btn-glass`, `.icon-brand`, `.navbar-solid`, `.banner-dark`, `.cta-gradient`, `.section-heading`, `.color-bar`, `.tag-red/.tag-yellow/.tag-green`, `.prose`

### API Connectivity
- Next.js `rewrites` proxy: 前端 `/api/*` → NestJS `http://localhost:3001/api/*`
- SSR 直接使用 `API_BACKEND_URL` 環境變數
- 瀏覽器使用相對路徑（由 Next.js proxy 轉發）

## Data Architecture
- **Database**: PostgreSQL 17.6 on Supabase (ap-southeast-1)
- **ORM**: Drizzle ORM v0.39
- **Tables (22)**: users, tribes, articles, vocabulary, events, media, comments, likes, bookmarks, tribe_follows, notifications, discussions, discussion_replies, discussion_likes, cultural_sites, event_registrations, article_versions, learning_records, learned_words, user_badges, approval_items, audit_logs

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

# PM2 (sandbox)
pm2 start ecosystem.config.cjs
```

## Deployment
- **Supabase PostgreSQL**: ✅ Connected (22 tables)
- **NestJS API (Render)**: ✅ Deployed
- **Next.js Frontend (Vercel)**: ⚠️ 需重新連結 GitHub 自動部署
- **GitHub**: ✅ https://github.com/fj5200-ui/pinuyumayan

## Progress
- **Phase 1-8** ✅ 核心功能 + DB 遷移 + 文章 v2 + SEO
- **Phase 9** ✅ 前端 UX 大升級 — 首頁v2 + Header v2 + Footer v2
- **Phase 10** ✅ 6 頁深度升級 + Glassmorphism CSS
- **Phase 11** ✅ 5 新 admin 頁面 + 構建優化
- **Phase 12** ✅ Cultural Solid 設計系統 — Header v4 + Footer v4 + globals.css
- **Phase 13** ✅ API proxy 修復 + 首頁 v3 + 全站 38 頁統一設計語言
- **Overall**: ~90% (38 routes, 19 API modules, 22 DB tables)

## Last Updated
2026-04-02 v5.2
