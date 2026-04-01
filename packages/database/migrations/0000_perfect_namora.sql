CREATE TYPE "public"."article_category" AS ENUM('文化', '部落', '歷史', '音樂', '工藝', '信仰', '語言', '教育');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('祭典', '活動', '工作坊', '展覽', '其他');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('photo', 'video', 'audio');--> statement-breakpoint
CREATE TYPE "public"."notif_type" AS ENUM('comment', 'like', 'follow', 'article', 'system');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'user');--> statement-breakpoint
CREATE TYPE "public"."vocab_category" AS ENUM('問候', '親屬', '自然', '數字', '食物', '動物', '文化', '日常', '身體');--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"cover_image" text,
	"category" "article_category" DEFAULT '文化' NOT NULL,
	"tags" text,
	"published" boolean DEFAULT false NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"author_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"article_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "event_type" DEFAULT '活動' NOT NULL,
	"location" varchar(255),
	"start_date" varchar(20) NOT NULL,
	"end_date" varchar(20),
	"tribe_id" integer,
	"cover_image" text,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "media_type" DEFAULT 'photo' NOT NULL,
	"url" text,
	"thumbnail_url" text,
	"uploaded_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notif_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tribe_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tribe_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tribes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"traditional_name" varchar(100),
	"region" varchar(200),
	"description" text,
	"history" text,
	"latitude" double precision,
	"longitude" double precision,
	"cover_image" text,
	"population" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"tribe_id" integer,
	"avatar_url" text,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vocabulary" (
	"id" serial PRIMARY KEY NOT NULL,
	"puyuma_word" varchar(200) NOT NULL,
	"chinese_meaning" varchar(200) NOT NULL,
	"english_meaning" varchar(200),
	"pronunciation" varchar(200),
	"example_sentence" text,
	"example_chinese" text,
	"category" "vocab_category" DEFAULT '日常' NOT NULL,
	"audio_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_tribe_id_tribes_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tribe_follows" ADD CONSTRAINT "tribe_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tribe_follows" ADD CONSTRAINT "tribe_follows_tribe_id_tribes_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tribe_id_tribes_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_articles_slug" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_articles_category" ON "articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_articles_author" ON "articles" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bookmarks_unique" ON "bookmarks" USING btree ("user_id","article_id");--> statement-breakpoint
CREATE INDEX "idx_comments_article" ON "comments" USING btree ("article_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_likes_unique" ON "likes" USING btree ("article_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_notif_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notif_unread" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_follows_unique" ON "tribe_follows" USING btree ("user_id","tribe_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_vocab_category" ON "vocabulary" USING btree ("category");