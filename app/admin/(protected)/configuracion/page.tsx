import { getSettings } from "@/lib/db/queries";
import SettingsPageWrapper from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <SettingsPageWrapper settings={settings} />;
}
