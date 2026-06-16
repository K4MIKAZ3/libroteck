CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" serial PRIMARY KEY NOT NULL,
  "store_id" integer NOT NULL REFERENCES "stores"("id") ON DELETE cascade,
  "username" text NOT NULL,
  "password_hash" text NOT NULL,
  "role" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_store_username_unique"
  ON "admin_users" ("store_id", "username");
--> statement-breakpoint
INSERT INTO "admin_users" ("store_id", "username", "password_hash", "role")
SELECT s."store_id", 'admin', s."admin_password_hash", 'superadmin'
FROM "settings" s
WHERE s."admin_password_hash" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "admin_users" au
    WHERE au."store_id" = s."store_id"
      AND au."username" = 'admin'
  );
