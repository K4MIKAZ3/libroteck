import Link from "next/link";
import { StoreShell } from "@/components/layout/store-shell";
import { getStoreContext } from "@/lib/store/context";
import { HOME_PATH } from "@/lib/routes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad y uso de cookies de LibroTeck.",
};

export default async function PrivacyPage() {
  const { store, settings, slug } = await getStoreContext();
  const storeName = settings.storeName || `${store.brandPrimary}${store.brandAccent}`;

  return (
    <StoreShell store={store} settings={settings} storeSlug={slug}>
      <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-[#f5d0d0] bg-white p-6 sm:p-10">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#dc2626]">
            Política de privacidad
          </h1>
          <p className="mt-2 text-sm text-[#1c0a0a]/60">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>

        <section className="space-y-3 text-[#1c0a0a]/80">
          <h2 className="text-lg font-semibold text-[#dc2626]">
            1. Responsable
          </h2>
          <p>
            {storeName} opera este sitio web de cursos y libros digitales. Los
            pedidos se gestionan por WhatsApp de forma externa.
          </p>
        </section>

        <section className="space-y-3 text-[#1c0a0a]/80">
          <h2 className="text-lg font-semibold text-[#dc2626]">
            2. Datos que recopilamos
          </h2>
          <p>
            Podemos almacenar preferencias locales en tu navegador (país
            seleccionado, carrito, cierre de banners). No vendemos datos
            personales.
          </p>
        </section>

        <section className="space-y-3 text-[#1c0a0a]/80">
          <h2 className="text-lg font-semibold text-[#dc2626]">
            3. Cookies y publicidad
          </h2>
          <p>
            Utilizamos cookies técnicas para el funcionamiento del sitio. Google
            AdSense y sus partners pueden usar cookies para mostrar anuncios
            personalizados según tus visitas anteriores.
          </p>
          <p>
            Puedes desactivar la publicidad personalizada en{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#dc2626] underline"
            >
              Configuración de anuncios de Google
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-[#1c0a0a]/80">
          <h2 className="text-lg font-semibold text-[#dc2626]">
            4. Terceros
          </h2>
          <p>
            Google AdSense puede recopilar datos de uso con fines publicitarios.
            Consulta la{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#dc2626] underline"
            >
              política de privacidad de Google
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-[#1c0a0a]/80">
          <h2 className="text-lg font-semibold text-[#dc2626]">5. Contacto</h2>
          <p>
            Para consultas sobre privacidad, contáctanos por WhatsApp desde el
            sitio.
          </p>
        </section>

        <Link
          href={HOME_PATH}
          className="inline-block text-sm font-medium text-[#dc2626] underline-offset-2 hover:underline"
        >
          Volver al catálogo
        </Link>
      </article>
    </StoreShell>
  );
}
