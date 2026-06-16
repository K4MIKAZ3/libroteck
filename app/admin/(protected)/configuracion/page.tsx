import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { createFormToken } from "@/lib/auth/form-token";
import { getSettings, getStoreRecord } from "@/lib/db/queries";
import { SettingsFormClient } from "@/components/admin/settings-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [settings, store, saveToken] = await Promise.all([
    getSettings(),
    getStoreRecord(),
    createFormToken("settings"),
  ]);

  return (
    <AdminPageShell active="configuracion">
      <SettingsFormClient
        initialSettings={settings}
        initialStore={store}
        saveToken={saveToken}
      />
    </AdminPageShell>
  );
}
