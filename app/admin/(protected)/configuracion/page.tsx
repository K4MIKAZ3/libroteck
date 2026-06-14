import { cookies } from "next/headers";
import { getSettings } from "@/lib/db/queries";
import SettingsPageWrapper from "@/components/admin/settings-form";
import {
  decodeSettingsFlash,
  SETTINGS_FLASH_COOKIE,
} from "@/lib/settings/flash-cookie";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const flashValue = cookieStore.get(SETTINGS_FLASH_COOKIE)?.value;
  const flashSettings = flashValue ? decodeSettingsFlash(flashValue) : null;

  let settings = await getSettings();

  if (params.saved === "1" && flashSettings) {
    settings = {
      id: 1,
      whatsappNumber: flashSettings.whatsappNumber,
      storeName: flashSettings.storeName,
      welcomeMessage: flashSettings.welcomeMessage,
    };
    cookieStore.delete(SETTINGS_FLASH_COOKIE);
  }

  return <SettingsPageWrapper settings={settings} />;
}
