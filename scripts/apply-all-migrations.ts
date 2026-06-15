import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "fs";
import path from "path";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const dir = path.join(process.cwd(), "drizzle");
  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const content = readFileSync(path.join(dir, file), "utf8");
    const statements = content
      .split("--> statement-breakpoint")
      .map((part) => part.trim())
      .filter(Boolean);

    console.log(`Applying ${file}...`);
    for (const statement of statements) {
      try {
        await sql.query(statement);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("already exists") || message.includes("duplicate")) {
          console.log(`  skip: ${message.split("\n")[0]}`);
          continue;
        }
        throw error;
      }
    }
  }

  console.log("All migration SQL applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
