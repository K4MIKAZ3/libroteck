import { getDb } from "../lib/db/index";
import { featureAllBundles } from "../lib/db/queries";

async function main() {
  const count = await featureAllBundles();
  console.log(`Marked ${count} packs as featured (shown first on the store).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
