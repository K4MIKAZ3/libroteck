import { execSync } from "child_process";

const ROOT = process.cwd();

const KEYS = [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "NEON_PROJECT_ID",
  "PGDATABASE",
  "PGHOST",
  "PGHOST_UNPOOLED",
  "PGPASSWORD",
  "PGUSER",
  "POSTGRES_DATABASE",
  "POSTGRES_HOST",
  "POSTGRES_PASSWORD",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
  "POSTGRES_USER",
];

for (const key of KEYS) {
  try {
    console.log(`Removing ${key}...`);
    execSync(`npx vercel env rm ${key} production --yes`, {
      cwd: ROOT,
      stdio: "inherit",
    });
  } catch {
    console.log(`  (skip ${key})`);
  }
}

console.log("Old database env vars removed.");
