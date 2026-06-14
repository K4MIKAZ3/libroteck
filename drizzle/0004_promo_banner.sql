ALTER TABLE "settings" ADD COLUMN "promo_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "promo_title" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "promo_message" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "promo_link" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "promo_button_label" text DEFAULT 'Ver promoción' NOT NULL;
