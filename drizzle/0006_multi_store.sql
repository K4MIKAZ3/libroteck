CREATE TABLE "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand_primary" text NOT NULL,
	"brand_accent" text NOT NULL,
	"footer_tagline" text DEFAULT '' NOT NULL,
	"hero_badge" text DEFAULT '' NOT NULL,
	"hero_offer_title" text DEFAULT '' NOT NULL,
	"hero_offer_subtitle" text DEFAULT '' NOT NULL,
	"catalog_title" text DEFAULT 'Catálogo destacado' NOT NULL,
	"catalog_subtitle" text DEFAULT '' NOT NULL,
	"search_placeholder" text DEFAULT '' NOT NULL,
	CONSTRAINT "stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "stores" (
	"slug",
	"brand_primary",
	"brand_accent",
	"footer_tagline",
	"hero_badge",
	"hero_offer_title",
	"hero_offer_subtitle",
	"catalog_title",
	"catalog_subtitle",
	"search_placeholder"
) VALUES
(
	'libroteck',
	'Libro',
	'Teck',
	'Cursos y libros digitales',
	'LibroTeck Latam',
	'Cursos desde $3.99',
	'Packs completos desde $6.00',
	'Catálogo destacado',
	'Elige tu próximo curso o pack y empieza a aprender hoy.',
	'Buscar cursos, packs o libros…'
),
(
	'streaming',
	'XCON',
	'DEF',
	'Cuentas premium de streaming',
	'XCONDEF',
	'Netflix desde $3.99',
	'Disney+, HBO Max y más plataformas',
	'Catálogo streaming',
	'Elige tu plataforma favorita y ordena por WhatsApp.',
	'Buscar Netflix, Disney+, HBO…'
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "store_id" integer;
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "store_id" integer;
--> statement-breakpoint
UPDATE "products" SET "store_id" = 1 WHERE "store_id" IS NULL;
--> statement-breakpoint
UPDATE "settings" SET "store_id" = 1 WHERE "store_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "store_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "store_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_slug_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX "products_store_slug_unique" ON "products" ("store_id", "slug");
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "settings_store_id_unique" ON "settings" ("store_id");
--> statement-breakpoint
INSERT INTO "settings" (
	"store_id",
	"whatsapp_number",
	"store_name",
	"welcome_message",
	"admin_password_hash",
	"promo_enabled",
	"promo_title",
	"promo_message",
	"promo_link",
	"promo_button_label",
	"ads_enabled",
	"adsense_client_id",
	"ad_slot_top",
	"ad_slot_left",
	"ad_slot_right"
)
SELECT
	2,
	"whatsapp_number",
	'XCONDEF',
	'Cuentas premium de streaming al mejor precio',
	"admin_password_hash",
	false,
	'',
	'',
	'',
	'Ver promoción',
	false,
	'',
	'',
	'',
	''
FROM "settings"
WHERE "store_id" = 1
LIMIT 1;
