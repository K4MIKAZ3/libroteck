ALTER TABLE "settings" ADD COLUMN "ads_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "adsense_client_id" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "ad_slot_top" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "ad_slot_left" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "ad_slot_right" text DEFAULT '' NOT NULL;
