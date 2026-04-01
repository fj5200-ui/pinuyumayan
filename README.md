# Pinuyumayan 卑南族入口網 v4.0

## Project Overview
- **Name**: Pinuyumayan (卑南族入口網)
- **Goal**: 保存與推廣卑南族（Puyuma）語言、文化與傳統知識的數位平台
- **Tech Stack**: TypeScript + Next.js 16 + NestJS 10 + PostgreSQL (Supabase) + Drizzle ORM + Tailwind CSS

## URLs
- **Frontend**: https://3000-ih1azl11kr64zoz11zsb2-2e77fc33.sandbox.novita.ai
- **API**: https://3001-ih1azl11kr64zoz11zsb2-2e77fc33.sandbox.novita.ai
- **Swagger Docs**: https://3001-ih1azl11kr64zoz11zsb2-2e77fc33.sandbox.novita.ai/api/docs
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
└── supabase/         # Supabase CLI 設定
```

### Backend — NestJS API (12 Modules)
| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | POST /register, /login, GET /me, PUT /me | JWT 認證 |
| Tribes | GET /, /:id | 卑南八社資料 |
| Articles | GET /, /:slug, POST /, PUT /:id, DELETE /:id | 文化誌文章 CRUD |
| Language | GET /vocabulary, /daily, /categories, POST/PUT/DELETE | 族語詞彙 |
| Events | GET /, /:id, POST /, PUT /:id, DELETE /:id | 活動祭典 |
| Media | GET /, /:id, POST /, DELETE /:id | 媒體庫 |
| Comments | GET /article/:id, POST /article/:id, DELETE /:id, POST /like | 留言與按讚 |
| Bookmarks | GET /, POST /:articleId, GET /check/:articleId | 文章收藏 |
| Follows | GET /, POST /:tribeId, GET /check/:tribeId, GET /count | 部落追蹤 |
| Notifications | GET /, GET /unread-count, PUT /read-all, PUT /:id/read, DELETE /:id | 通知系統 |
| Search | GET /?q=keyword | 全站搜尋 |
| Admin | GET /users, PUT /users/:id/role, GET /comments, DELETE /comments/:id | 管理後台 |

### Frontend — Next.js Pages (13 Pages)
| Page | Path | Description |
|------|------|-------------|
| 首頁 | / | Hero + 部落/文章/族語/活動摘要 |
| 部落列表 | /tribes | 卑南八社一覽 |
| 部落詳情 | /tribes/[id] | 部落歷史、地圖、人口 |
| 文化誌 | /articles | 文章列表 (分類篩選) |
| 文章詳情 | /articles/[slug] | 文章全文、標籤 |
| 族語學習 | /language | 詞彙分類瀏覽、發音 |
| 活動祭典 | /events | 活動列表 (類型篩選) |
| 媒體庫 | /media | 照片/影片/音檔 |
| 搜尋 | /search | 全站搜尋 |
| 登入 | /login | JWT 登入 |
| 註冊 | /register | 帳號註冊 |
| 個人資料 | /profile | 使用者資料、收藏 |
| 管理後台 | /admin | 用戶管理、留言管理 |
| 關於 | /about | 平台介紹 |

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

# Database
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:seed        # Seed data

# Start API (port 3001)
cd apps/api && npx nest start --watch

# Start Frontend (port 3000)
cd apps/web && npx next dev

# Or with PM2
pm2 start "node dist/apps/api/src/main.js" --name api --cwd apps/api
pm2 start "npx next start -p 3000 -H 0.0.0.0" --name web --cwd apps/web
```

## Deployment Status
- **Supabase PostgreSQL**: ✅ Connected (uzwuqythcvqyhhxvqpzf)
- **NestJS API**: ✅ Running (sandbox port 3001)
- **Next.js Frontend**: ✅ Running (sandbox port 3000)
- **Cloudflare Pages**: ⏳ Pending (requires API token permissions)

## Last Updated
2026-04-01
