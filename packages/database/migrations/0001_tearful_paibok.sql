CREATE TYPE "public"."cultural_site_type" AS ENUM('集會所', '祭祀場', '會所', '獵場', '文化區', '遺址', '工藝', '祭典場', '其他');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TABLE "article_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"version" integer NOT NULL,
	"edited_by" integer,
	"edited_by_name" varchar(100),
	"change_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cultural_sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" "cultural_site_type" DEFAULT '其他' NOT NULL,
	"description" text,
	"latitude" double precision,
	"longitude" double precision,
	"tribe_id" integer,
	"tribe_name" varchar(100),
	"images" text,
	"tags" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussion_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussion_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"content" text NOT NULL,
	"author_id" integer,
	"author_name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discussions" (
	"id" serial PRIMARY KEY NOT NULL,
	"board" varchar(50) DEFAULT 'general' NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"author_id" integer,
	"author_name" varchar(100) NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"user_name" varchar(100) NOT NULL,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_versions" ADD CONSTRAINT "article_versions_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_sites" ADD CONSTRAINT "cultural_sites_tribe_id_tribes_id_fk" FOREIGN KEY ("tribe_id") REFERENCES "public"."tribes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_versions_article" ON "article_versions" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "idx_sites_type" ON "cultural_sites" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_sites_tribe" ON "cultural_sites" USING btree ("tribe_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_disc_likes_unique" ON "discussion_likes" USING btree ("discussion_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_replies_discussion" ON "discussion_replies" USING btree ("discussion_id");--> statement-breakpoint
CREATE INDEX "idx_discussions_board" ON "discussions" USING btree ("board");--> statement-breakpoint
CREATE INDEX "idx_discussions_author" ON "discussions" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_reg_unique" ON "event_registrations" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_reg_event" ON "event_registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_reg_user" ON "event_registrations" USING btree ("user_id");