import Link from "next/link";
import { StoreShell } from "@/components/layout/store-shell";
import { getStoreContext } from "@/lib/store/context";
import { HOME_PATH } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { store, settings, slug } = await getStoreContext();
  const storeName = settings.storeName || `${store.brandPrimary}${store.brandAccent}`;
  const isStreaming = slug === "streaming";

  return {
    title: "Sobre nosotros",
    description: isStreaming
      ? `${storeName}: más de 10 años vendiendo libros, cursos y cuentas de streaming con atención por WhatsApp.`
      : `${storeName}: más de 10 años vendiendo libros digitales, cursos y streaming con atención por WhatsApp.`,
  };
}

export default async function AboutPage() {
  const { store, settings, slug } = await getStoreContext();
  const storeName = settings.storeName || `${store.brandPrimary}${store.brandAccent}`;
  const isStreaming = slug === "streaming";

  return (
    <StoreShell store={store} settings={settings} storeSlug={slug}>
      <article className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            Quiénes somos
          </p>
          <h1 className="font-heading mt-3 text-3xl font-bold text-[var(--primary)] sm:text-4xl">
            Sobre nosotros
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--foreground)]/80">
            En {storeName} llevamos{" "}
            <strong>más de 10 años vendiendo libros, cursos y streaming</strong>{" "}
            a clientes de distintos países. Empezamos compartiendo material
            digital de forma directa y, con el tiempo, fuimos ampliando el
            catálogo y mejorando la forma de comprar.
          </p>
        </div>

        <section className="space-y-3 text-[var(--foreground)]/80">
          <h2 className="text-lg font-semibold text-[var(--primary)]">
            Qué ofrecemos
          </h2>
          {isStreaming ? (
            <p>
              En esta tienda encontrarás perfiles y packs de plataformas de
              streaming, además de acceso a contenido de IA y herramientas de
              panel. Trabajamos con precios claros por país y pedidos sencillos
              por WhatsApp.
            </p>
          ) : (
            <p>
              Aquí reunimos cursos digitales, libros y material técnico en
              distintas categorías. También seguimos atendiendo clientes que
              buscan streaming y combos, siempre con la misma trayectoria de
              más de una década en el sector.
            </p>
          )}
          <ul className="list-disc space-y-2 pl-5">
            <li>Libros y material digital en distintos formatos</li>
            <li>Cursos y packs formativos para aprender a tu ritmo</li>
            <li>Cuentas y perfiles de streaming con soporte directo</li>
            <li>Precios adaptados a tu país y pago por WhatsApp</li>
          </ul>
        </section>

        <section className="space-y-3 text-[var(--foreground)]/80">
          <h2 className="text-lg font-semibold text-[var(--primary)]">
            Cómo comprar
          </h2>
          <p>
            Navega el catálogo, elige tu país para ver el precio en tu moneda y
            arma tu pedido. Cuando estés listo, envías el resumen por WhatsApp y
            te confirmamos el pago y la entrega. Sin registros complicados ni
            procesos largos.
          </p>
        </section>

        <section className="space-y-3 text-[var(--foreground)]/80">
          <h2 className="text-lg font-semibold text-[var(--primary)]">
            Compromiso
          </h2>
          <p>
            Nuestra prioridad es ofrecer un catálogo útil, precios transparentes
            y atención personal. Llevamos más de diez años en esto porque
            confiamos en lo que vendemos y en la relación directa con quien
            compra.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 border-t border-[var(--border)] pt-6">
          <Link
            href={HOME_PATH}
            className="inline-flex rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Ver catálogo
          </Link>
          <Link
            href="/privacidad"
            className="inline-flex items-center text-sm font-medium text-[var(--primary)] underline-offset-2 hover:underline"
          >
            Política de privacidad
          </Link>
        </div>
      </article>
    </StoreShell>
  );
}
