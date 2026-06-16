ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "hero_offer_background_image_url" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "hero_offer_service_name" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "hero_offer_price" text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE "stores"
SET
	"hero_offer_service_name" = split_part("hero_offer_title", ' desde ', 1),
	"hero_offer_price" = split_part("hero_offer_title", ' desde ', 2)
WHERE "hero_offer_title" LIKE '% desde %'
	AND ("hero_offer_service_name" = '' OR "hero_offer_service_name" IS NULL);
