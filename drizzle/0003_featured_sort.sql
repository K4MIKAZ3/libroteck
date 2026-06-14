ALTER TABLE "products" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;
