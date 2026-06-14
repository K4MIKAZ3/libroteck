import { getSettings } from "@/lib/db/queries";
import SettingsPageWrapper from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <SettingsPageWrapper settings={settings} />;
}
