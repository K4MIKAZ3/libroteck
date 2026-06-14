import SecurityPageWrapper from "@/components/admin/security-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <SecurityPageWrapper
      saved={params.saved === "1"}
      error={params.error ?? null}
    />
  );
}
