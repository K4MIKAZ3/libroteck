CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_url" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"country_code" text NOT NULL,
	"currency" text NOT NULL,
	"amount" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"whatsapp_number" text DEFAULT '5212345678900' NOT NULL,
	"store_name" text DEFAULT 'LibroTeck' NOT NULL,
	"welcome_message" text DEFAULT 'Elige tu país y ordena por WhatsApp' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
