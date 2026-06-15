import { spawnSync } from "child_process";

const ROOT = process.cwd();

const VARS: Record<string, string> = {
  ADMIN_PASSWORD: "admin123",
  ADMIN_SECRET: "libroteck-prod-secret-2026-diego-castro",
  WHATSAPP_NUMBER: "59178928646",
};

function addEnv(key: string, value: string) {
  console.log(`+ ${key}`);
  const result = spawnSync(
    "npx",
    [
      "vercel",
      "env",
      "add",
      key,
      "production",
      "--value",
      value,
      "--yes",
      "--force",
      "--non-interactive",
    ],
    { cwd: ROOT, stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(1);
}

for (const [key, value] of Object.entries(VARS)) {
  addEnv(key, value);
}

console.log("Admin vars listas.");
