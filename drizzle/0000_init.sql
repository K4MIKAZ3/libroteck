CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`cover_url` text DEFAULT '' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`is_new` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `product_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`country_code` text NOT NULL,
	`currency` text NOT NULL,
	`amount` real NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`whatsapp_number` text DEFAULT '5212345678900' NOT NULL,
	`store_name` text DEFAULT 'LibroTeck' NOT NULL,
	`welcome_message` text DEFAULT 'Cursos y libros digitales' NOT NULL
);
