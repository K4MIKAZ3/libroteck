import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";

const ROOT = process.cwd();

const SKIP_PREFIXES = ["VERCEL_", "TURBO_", "NX_"];
const PRODUCTION_ONLY = new Set([
  "ADMIN_PASSWORD",
  "ADMIN_SECRET",
  "WHATSAPP_NUMBER",
  "ADSENSE_CLIENT_ID",
]);

const FALLBACK: Record<string, string> = {
  ADSENSE_CLIENT_ID: "ca-pub-2874159185263006",
  GOOGLE_SITE_VERIFICATION: "cc_kj_ZBrn4TG1spcaj4fCBw7pMUsImOGodvMOsj7c4",
};

function parseEnvFile(filePath: string) {
  const vars: Record<string, string> = {};
  if (!existsSync(filePath)) return vars;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value) vars[key] = value;
  }

  return vars;
}

function shouldSkip(key: string) {
  return SKIP_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function addEnv(key: string, value: string, environment: string) {
  console.log(`  + ${key} → ${environment}`);
  const result = spawnSync(
    "npx",
    [
      "vercel",
      "env",
      "add",
      key,
      environment,
      "--yes",
      "--force",
      "--non-interactive",
    ],
    {
      cwd: ROOT,
      input: value,
      encoding: "utf8",
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    },
  );

  if (result.status !== 0) {
    throw new Error(`No se pudo subir ${key} (${environment})`);
  }
}

async function main() {
  const merged = {
    ...parseEnvFile(path.join(ROOT, ".env.local")),
    ...parseEnvFile(path.join(ROOT, ".env.vercel.production")),
    ...FALLBACK,
  };

  const keys = Object.keys(merged)
    .filter((key) => !shouldSkip(key))
    .sort();

  if (!merged.DATABASE_URL) {
    console.error("Falta DATABASE_URL en .env.local");
    process.exit(1);
  }

  console.log(`Subiendo ${keys.length} variables a Vercel...\n`);

  for (const key of keys) {
    const value = merged[key];
    if (!value) continue;

    const environments = ["production"];

    for (const environment of environments) {
      addEnv(key, value, environment);
    }
  }

  console.log("\nVariables listas.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
