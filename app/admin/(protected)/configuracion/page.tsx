import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { createFormToken } from "@/lib/auth/form-token";
import { getAdminPageContext } from "@/lib/auth/page-context";
import { getAllProducts, getSettings, getStoreRecord } from "@/lib/db/queries";
import { getStoreSlug } from "@/lib/store/context";
import { SettingsFormClient } from "@/components/admin/settings-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const { capabilities } = await getAdminPageContext();
  const slug = await getStoreSlug();
  const [settings, store, products, saveToken] = await Promise.all([
    getSettings(),
    getStoreRecord(),
    getAllProducts(),
    createFormToken("settings"),
  ]);

  return (
    <AdminPageShell active="configuracion" capabilities={capabilities}>
      <SettingsFormClient
        initialSettings={settings}
        initialStore={store}
        storeSlug={slug}
        catalogProducts={products}
        saveToken={saveToken}
        canWriteSettings={capabilities.canWriteSettings}
        canWriteHero={capabilities.canWriteHero}
        readOnly={capabilities.readOnly}
      />
    </AdminPageShell>
  );
}
