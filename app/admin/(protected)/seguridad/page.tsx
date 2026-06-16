import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { createFormToken } from "@/lib/auth/form-token";
import { SecurityFormClient } from "@/components/admin/security-form-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSecurityPage() {
  const saveToken = await createFormToken("password");

  return (
    <AdminPageShell active="seguridad">
      <SecurityFormClient saveToken={saveToken} />
    </AdminPageShell>
  );
}
