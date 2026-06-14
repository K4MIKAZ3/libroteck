import { getSettings } from "@/lib/db/queries";
import SettingsPageWrapper from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    passwordSaved?: string;
    passwordError?: string;
  }>;
}) {
  const params = await searchParams;
  const settings = await getSettings();

  return (
    <SettingsPageWrapper
      settings={settings}
      saved={params.saved === "1"}
      error={params.error ?? null}
      passwordSaved={params.passwordSaved === "1"}
      passwordError={params.passwordError ?? null}
    />
  );
}
