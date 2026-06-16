import { redirect } from "next/navigation";
import { getAdminCapabilities } from "@/lib/auth/capabilities";
import { getAdminSession } from "@/lib/auth/session";

export async function getAdminPageContext() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return {
    session,
    capabilities: getAdminCapabilities(session.role),
  };
}
