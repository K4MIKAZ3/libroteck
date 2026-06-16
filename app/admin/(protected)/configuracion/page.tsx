import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { createFormToken } from "@/lib/auth/form-token";
import { getAllProducts, getSettings, getStoreRecord } from "@/lib/db/queries";
import { getStoreSlug } from "@/lib/store/context";
import { SettingsFormClient } from "@/components/admin/settings-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const slug = await getStoreSlug();
  const [settings, store, products, saveToken] = await Promise.all([
    getSettings(),
    getStoreRecord(),
    getAllProducts(),
    createFormToken("settings"),
  ]);

  return (
    <AdminPageShell active="configuracion">
      <SettingsFormClient
        initialSettings={settings}
        initialStore={store}
        storeSlug={slug}
        catalogProducts={products}
        saveToken={saveToken}
      />
    </AdminPageShell>
  );
}
