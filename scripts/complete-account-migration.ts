import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const PROD_URL = "https://libroteck-five.vercel.app";
const NEON_CMD =
  "npx vercel integration add neon --non-interactive -m region=iad1 -m auth=false --plan free_v3 -e production -e preview -e development --format json";

function runWithEnv(envFile: string, command: string) {
  const env = parseEnvFile(path.join(ROOT, envFile));
  console.log(`\n> ${command}`);
  execSync(command, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...env },
  });
}

function runCapture(command: string) {
  return execSync(command, { cwd: ROOT, encoding: "utf8", shell: true });
}

function parseEnvFile(filePath: string) {
  const vars: Record<string, string> = {};
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
    vars[key] = value;
  }
  return vars;
}

async function callMigrationApi(route: "import" | "covers", secret: string) {
  const response = await fetch(`${PROD_URL}/api/migrate/${route}`, {
    method: "POST",
    headers: { "x-migrate-secret": secret },
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${route} failed (${response.status}): ${body}`);
  }
  console.log(body);
}

async function main() {
  console.log("1/6 Instalando Neon en diego-castro...");
  const neonResult = runCapture(NEON_CMD);
  if (neonResult.includes("integration_terms_acceptance_required")) {
    console.error(
      "\nAcepta los términos aquí y vuelve a ejecutar este script:\n" +
        "https://vercel.com/diego-castro/~/integrations/accept-terms/neon?source=cli\n",
    );
    process.exit(1);
  }
  console.log(neonResult);

  console.log("\n2/6 Descargando variables de producción...");
  execSync("npx vercel env pull .env.migration --environment production --yes", {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  });

  const env = parseEnvFile(path.join(ROOT, ".env.migration"));
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL vacío tras instalar Neon.");
  }

  console.log("\n3/6 Migrando schema localmente...");
  runWithEnv(".env.migration", "npx tsx scripts/migrate.ts");

  console.log("\n4/6 Importando snapshot localmente...");
  runWithEnv(".env.migration", "npx tsx scripts/import-db-snapshot.ts");

  console.log("\n5/6 Migrando portadas al Blob nuevo...");
  runWithEnv(".env.migration", "npx tsx scripts/migrate-covers-to-blob.ts");

  console.log("\n6/6 Desplegando a producción...");
  execSync("npx vercel --prod --yes", { cwd: ROOT, stdio: "inherit", shell: true });

  const secret = env.ADMIN_SECRET;
  if (secret) {
    console.log("\nVerificando import en producción (API)...");
    await callMigrationApi("import", secret);
    await callMigrationApi("covers", secret);
  }

  console.log("\nMigración completa. Elimina app/api/migrate/* y redeploy.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
