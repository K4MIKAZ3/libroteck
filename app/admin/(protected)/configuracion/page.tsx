import { createFormToken } from "@/lib/auth/form-token";
import { getSettings } from "@/lib/db/queries";
import { SettingsFormClient } from "@/components/admin/settings-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [settings, saveToken] = await Promise.all([
    getSettings(),
    createFormToken("settings"),
  ]);

  return (
    <SettingsFormClient initialSettings={settings} saveToken={saveToken} />
  );
}
