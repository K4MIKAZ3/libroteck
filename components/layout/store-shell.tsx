import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AdSenseUnit } from "@/components/ads/ad-unit";
import type { Settings } from "@/lib/db/schema";
import { getAdConfig } from "@/lib/ads/config";
import { shouldShowAdUnits } from "@/lib/ads/client-id";
import { cn } from "@/lib/utils";

export function StoreShell({
  settings,
  children,
}: {
  settings: Settings;
  children: React.ReactNode;
}) {
  const ads = getAdConfig(settings);
  const showUnits = shouldShowAdUnits(settings);

  return (
    <div className="min-h-screen">
        {showUnits && ads.top && (
          <div className="border-b border-[#e8ecff] bg-white/90">
            <div className="mx-auto max-w-[728px] px-4 py-2">
              <AdSenseUnit
                clientId={ads.clientId}
                slotId={ads.top}
                format="horizontal"
                minHeight={72}
              />
            </div>
          </div>
        )}

        <SiteHeader />

        <div
          className={cn(
            "mx-auto flex w-full justify-center gap-4 px-4 py-8 sm:gap-6 sm:px-6 sm:py-10",
            showUnits && (ads.left || ads.right) ? "max-w-[1500px]" : "max-w-7xl",
          )}
        >
          {showUnits && ads.left && (
            <aside className="hidden w-[160px] shrink-0 2xl:block">
              <div className="sticky top-28">
                <AdSenseUnit
                  clientId={ads.clientId}
                  slotId={ads.left}
                  format="vertical"
                  minHeight={600}
                />
              </div>
            </aside>
          )}

          <main className="min-w-0 flex-1">{children}</main>

          {showUnits && ads.right && (
            <aside className="hidden w-[160px] shrink-0 xl:block">
              <div className="sticky top-28">
                <AdSenseUnit
                  clientId={ads.clientId}
                  slotId={ads.right}
                  format="vertical"
                  minHeight={600}
                />
              </div>
            </aside>
          )}
        </div>

        <SiteFooter />
      </div>
  );
}
