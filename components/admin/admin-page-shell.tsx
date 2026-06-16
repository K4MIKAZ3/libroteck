import { AdminNav } from "@/components/admin/admin-nav";
import { getStoreContext } from "@/lib/store/context";

type AdminPageShellProps = {
  active?: "productos" | "configuracion" | "seguridad";
  children: React.ReactNode;
};

export async function AdminPageShell({
  active,
  children,
}: AdminPageShellProps) {
  const { store, slug } = await getStoreContext();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <AdminNav
        active={active}
        brandPrimary={store.brandPrimary}
        brandAccent={store.brandAccent}
        storeSlug={slug}
      />
      {children}
    </div>
  );
}
