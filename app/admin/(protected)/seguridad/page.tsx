import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { SecurityPanel } from "@/components/admin/security-panel";
import { createFormToken } from "@/lib/auth/form-token";
import { getAdminPageContext } from "@/lib/auth/page-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSecurityPage() {
  const { session, capabilities } = await getAdminPageContext();
  const saveToken = await createFormToken("password");

  return (
    <AdminPageShell active="seguridad" capabilities={capabilities}>
      <SecurityPanel
        saveToken={saveToken}
        capabilities={capabilities}
        currentUserId={session.userId}
        currentUsername={session.username}
      />
    </AdminPageShell>
  );
}
