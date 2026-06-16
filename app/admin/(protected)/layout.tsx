export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
