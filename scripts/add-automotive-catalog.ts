import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db/index";
import { productPrices, products } from "../lib/db/schema";
import { slugify } from "../lib/utils";

type ProductType = "course" | "book" | "bundle";

type CatalogItem = {
  name: string;
  type: ProductType;
  description: string;
  highlights: string[];
  priceTier: "pack" | "mega" | "course" | "budget";
  isNew?: boolean;
};

const PRICE_TIERS = {
  pack: { MX: 799, CO: 149000, AR: 79000, PE: 129, INT: 49.99 },
  mega: { MX: 1499, CO: 279000, AR: 149000, PE: 249, INT: 79.99 },
  course: { MX: 599, CO: 109000, AR: 59000, PE: 99, INT: 34.99 },
  budget: { MX: 199, CO: 35000, AR: 18000, PE: 39, INT: 12 },
} as const;

const CATALOG: CatalogItem[] = [
  {
    name: "Pack 50 Inmovilizadores y programación de llaves PDF",
    type: "bundle",
    description:
      "Pack de 50 manuales en PDF sobre inmovilizadores y programación de llaves. Actualizados, imprimibles y con acceso inmediato.",
    highlights: ["Actualizados", "Imprimibles", "Acceso inmediato"],
    priceTier: "pack",
  },
  {
    name: "Pack 50 Electricidad y Electrónica Automotriz PDF",
    type: "bundle",
    description:
      "Colección de 50 manuales en PDF de electricidad y electrónica automotriz. Material actualizado, imprimible y listo para descargar.",
    highlights: ["Actualizados", "Imprimibles", "Acceso inmediato"],
    priceTier: "pack",
  },
  {
    name: "Pack 50 Maquinaria Diesel",
    type: "bundle",
    description:
      "Manuales técnicos de maquinaria diesel: inyección Common Rail, motores y procedimientos de taller.",
    highlights: ["Inyección Common Rail", "Manuales de motores", "Procedimientos técnicos"],
    priceTier: "pack",
  },
  {
    name: "Biblioteca Online Automotriz (+300 GB)",
    type: "bundle",
    description:
      "Biblioteca automotriz con más de 300 GB: manuales, diagramas, pinouts y actualizaciones incluidas.",
    highlights: ["Acceso inmediato", "Manuales y diagramas", "Actualizaciones incluidas"],
    priceTier: "mega",
    isNew: true,
  },
  {
    name: "Pack Completo 24.000 libros, cursos y manuales automotrices",
    type: "bundle",
    description:
      "Megapack con 24.000 libros, video cursos, manuales y diagramas automotrices para mecánicos y entusiastas. Guías prácticas para reparar y mantener vehículos.",
    highlights: ["24.000 recursos", "Videos y manuales", "Guías prácticas"],
    priceTier: "mega",
    isNew: true,
  },
  {
    name: "Pack de Torques de Motores Pesados PDF",
    type: "book",
    description:
      "Más de 300 archivos técnicos en PDF con especificaciones de torque para motores pesados. Imprimibles y acceso inmediato.",
    highlights: ["+300 archivos técnicos", "Imprimibles", "Acceso inmediato"],
    priceTier: "pack",
  },
  {
    name: "Curso Virtual de Manejo y Aplicación del VAG-COM",
    type: "course",
    description:
      "Temario funcional de VAG-COM / VCDS para diagnóstico en VW, SEAT y Audi. Incluye documento con códigos de falla VW en español.",
    highlights: ["VAG-COM / VCDS", "VW, SEAT y Audi", "Códigos de falla en español"],
    priceTier: "course",
  },
  {
    name: "Sistemas Electrónicos y Fallas Comunes en Ford",
    type: "course",
    description:
      "ECM, correlación CKP/CMP en Ford Escape 2006 XLT 3.0L y línea de datos en Ford Escape 2007.",
    highlights: ["Módulo ECM", "Sensores CKP y CMP", "Línea de datos"],
    priceTier: "course",
  },
  {
    name: "Curso Virtual Reparación de Computadoras Automotrices Ford",
    type: "course",
    description:
      "Computadoras automotrices Ford, sistema eléctrico y la computadora EEC-V explicados paso a paso.",
    highlights: ["Computadoras Ford", "Sistema eléctrico", "Computadora EEC-V"],
    priceTier: "course",
  },
  {
    name: "Curso Avanzado de Electrónica en Chrysler, Jeep y Dodge",
    type: "course",
    description:
      "9 horas de capacitación: redes CAN, sistema Start-Stop y módulo TIPM en vehículos Chrysler, Jeep y Dodge.",
    highlights: ["9 horas", "Redes CAN", "Módulo TIPM"],
    priceTier: "course",
  },
  {
    name: "Curso Virtual Computadoras ECU Chrysler y Nissan",
    type: "course",
    description:
      "Ubicación y función de la ECU, estructura interna, banqueo de computadoras y análisis de componentes.",
    highlights: ["ECU Chrysler y Nissan", "Estructura interna", "Banqueo de ECU"],
    priceTier: "budget",
  },
  {
    name: "Prodemand Diagramas 2016-2021",
    type: "bundle",
    description:
      "20.5 GB en PDF con diagramas Prodemand. Descarga inmediata y modelos actualizados 2016-2021.",
    highlights: ["20.5 GB en PDF", "Descarga inmediata", "Modelos 2016-2021"],
    priceTier: "pack",
  },
  {
    name: "Sistemas Electrónicos y Fallas en Nissan",
    type: "course",
    description:
      "5 horas de capacitación con oscilogramas reales y casos de taller en sistemas electrónicos Nissan.",
    highlights: ["5 horas", "Oscilogramas", "Casos de taller"],
    priceTier: "course",
  },
  {
    name: "Curso de Diagnóstico Electrónico en Ford Escape",
    type: "course",
    description:
      "4 h 45 min de capacitación: redes de comunicación y el alternador digital en Ford Escape.",
    highlights: ["4 h 45 min", "Redes de comunicación", "Alternador digital"],
    priceTier: "course",
  },
  {
    name: "Curso Máster Reparación de Computadoras Chrysler, Dodge y Jeep (NGC y GPEC)",
    type: "course",
    description:
      "11 horas de formación avanzada. Enfoque en la computadora de 4 conectores NGC.",
    highlights: ["11 horas", "NGC y GPEC", "4 conectores NGC"],
    priceTier: "course",
  },
  {
    name: "Diagnóstico Avanzado del Estado Mecánico del Motor",
    type: "course",
    description:
      "6 h 20 min: pruebas con sensores, osciloscopio y pinza amperimétrica. Diagnóstico sin código de falla.",
    highlights: ["6 h 20 min", "Osciloscopio", "Sin código de falla"],
    priceTier: "course",
  },
  {
    name: "Sistemas Electrónicos y Fallas Comunes en Chrysler",
    type: "course",
    description:
      "Módulo TIPM en Chrysler: fallas frecuentes y alternadores inteligentes.",
    highlights: ["Módulo TIPM", "Fallas comunes", "Alternadores inteligentes"],
    priceTier: "course",
  },
  {
    name: "Diagnóstico Electrónico en Honda",
    type: "course",
    description:
      "5 horas de capacitación con oscilogramas reales y manuales PDF incluidos para Honda.",
    highlights: ["5 horas", "Oscilogramas reales", "Manuales PDF"],
    priceTier: "course",
  },
  {
    name: "Diagnóstico Electrónico en KIA",
    type: "course",
    description:
      "Redes de comunicación, inyección directa, ABS y sensores en vehículos KIA.",
    highlights: ["Redes de comunicación", "Inyección directa", "ABS y sensores"],
    priceTier: "course",
  },
  {
    name: "Sistemas Electrónicos y Fallas en VW",
    type: "course",
    description:
      "5 horas de capacitación: ABS, CAN Bus y boletines técnicos para Volkswagen.",
    highlights: ["5 horas", "ABS y CAN Bus", "Boletines técnicos"],
    priceTier: "course",
  },
  {
    name: "Redes Multiplexadas CAN Bus, LIN, Gateway",
    type: "course",
    description:
      "6 horas online con ejercicios prácticos y casos reales de taller en redes multiplexadas.",
    highlights: ["6 horas online", "Ejercicios prácticos", "Casos de taller"],
    priceTier: "course",
  },
];

const TYPE_LABEL: Record<ProductType, string> = {
  course: "CURSO",
  book: "LIBRO",
  bundle: "PACK",
};

function wrapTitle(text: string, maxChars = 28): string[] {
  const words = text.replace(/[^\w\sáéíóúñÁÉÍÓÚÑüÜ0-9+().,-]/g, "").split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function generateCoverSvg(name: string, type: ProductType, highlights: string[]) {
  const titleLines = wrapTitle(name);
  const badge = TYPE_LABEL[type];
  const featureLines = highlights.slice(0, 3);

  const titleYStart = 250 - titleLines.length * 14;
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="200" y="${titleYStart + i * 30}" text-anchor="middle" fill="#FAF7F2" font-family="Arial,sans-serif" font-size="16" font-weight="bold">${escapeXml(line)}</text>`,
    )
    .join("\n");

  const featureSvg = featureLines
    .map(
      (line, i) =>
        `<text x="200" y="${380 + i * 26}" text-anchor="middle" fill="#FAF7F2" font-family="Arial,sans-serif" font-size="12" opacity="0.85">${escapeXml(line)}</text>`,
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 533" fill="none">
  <rect width="400" height="533" fill="#1E3A5F"/>
  <rect x="0" y="0" width="400" height="8" fill="#C8956C"/>
  <rect x="130" y="60" width="140" height="32" rx="16" fill="#C8956C"/>
  <text x="200" y="82" text-anchor="middle" fill="#1E3A5F" font-family="Arial,sans-serif" font-size="14" font-weight="bold">${badge}</text>
  <circle cx="200" cy="165" r="48" fill="#2D5A8A"/>
  <path d="M175 155h50v35h-50z" fill="#FAF7F2" opacity="0.9"/>
  <path d="M185 165h30v15h-30z" fill="#1E3A5F"/>
  ${titleSvg}
  <rect x="50" y="360" width="300" height="1" fill="#C8956C" opacity="0.5"/>
  ${featureSvg}
  <text x="200" y="500" text-anchor="middle" fill="#C8956C" font-family="Arial,sans-serif" font-size="14" font-weight="bold" letter-spacing="2">LIBROTECK</text>
</svg>`;
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main() {
  const db = await getDb();
  const coversDir = path.join(process.cwd(), "public", "covers");
  mkdirSync(coversDir, { recursive: true });

  let created = 0;
  let skipped = 0;

  for (const item of CATALOG) {
    const slug = slugify(item.name);
    const coverFilename = `${slug}.svg`;
    const coverPath = path.join(coversDir, coverFilename);
    const coverUrl = `/covers/${coverFilename}`;

    writeFileSync(
      coverPath,
      generateCoverSvg(item.name, item.type, item.highlights),
      "utf8",
    );

    const existing = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Skip (exists): ${item.name}`);
      skipped++;
      continue;
    }

    const tier = PRICE_TIERS[item.priceTier];
    const [product] = await db
      .insert(products)
      .values({
        name: item.name,
        slug,
        type: item.type,
        description: item.description,
        coverUrl,
        isActive: true,
        isNew: item.isNew ?? false,
      })
      .returning();

    await db.insert(productPrices).values([
      { productId: product.id, countryCode: "MX", currency: "MXN", amount: tier.MX },
      { productId: product.id, countryCode: "CO", currency: "COP", amount: tier.CO },
      { productId: product.id, countryCode: "AR", currency: "ARS", amount: tier.AR },
      { productId: product.id, countryCode: "PE", currency: "PEN", amount: tier.PE },
      { productId: product.id, countryCode: "INT", currency: "USD", amount: tier.INT },
    ]);

    console.log(`Created #${product.id}: ${slug}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
