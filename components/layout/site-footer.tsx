import { CreditCard, Landmark, Wallet } from "lucide-react";

const PAYMENT_METHODS = [
  {
    name: "Binance",
    description: "USDT y criptomonedas",
    icon: Wallet,
  },
  {
    name: "PayPal",
    description: "Pagos internacionales",
    icon: CreditCard,
  },
  {
    name: "Bancos de Bolivia",
    description: "Transferencia bancaria",
    icon: Landmark,
  },
  {
    name: "Nequi",
    description: "Colombia",
    icon: Wallet,
  },
  {
    name: "Bancolombia",
    description: "Colombia",
    icon: Landmark,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#E8E0D5] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <p className="font-literata text-xs uppercase tracking-[0.2em] text-[#C8956C]">
            Métodos de pago
          </p>
          <h2 className="font-heading mt-2 text-xl font-bold text-[#1E3A5F] sm:text-2xl">
            Aceptamos los siguientes medios
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#1A1A2E]/60">
            Al ordenar por WhatsApp te indicamos los datos para completar tu pago
            de forma segura.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.name}
              className="flex flex-col items-center rounded-2xl border border-[#E8E0D5] bg-[#FAF7F2] px-4 py-5 text-center transition-shadow hover:shadow-md"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">
                <method.icon className="size-5" />
              </div>
              <p className="mt-3 font-semibold text-[#1A1A2E]">{method.name}</p>
              <p className="mt-1 text-xs text-[#1A1A2E]/55">
                {method.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[#1A1A2E]/45">
          © {new Date().getFullYear()} LibroTeck — Cursos y libros digitales
          {" · "}
          <a href="/privacidad" className="underline-offset-2 hover:underline">
            Privacidad
          </a>
        </p>
      </div>
    </footer>
  );
}
