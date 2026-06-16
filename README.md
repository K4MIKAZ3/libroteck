# LibroTeck

Catálogo de cursos y libros con precios por país y checkout por WhatsApp.

## Demo en vivo

- **Repositorio:** https://github.com/K4MIKAZ3/libroteck
- **Tienda:** https://libroteck.xyz/home
- **Admin:** https://libroteck.xyz/admin/login

Configura `ADMIN_PASSWORD` y `ADMIN_SECRET` en producción (mínimo 32 caracteres para el secret). No uses contraseñas por defecto en entornos públicos.

## Inicio rápido

1. Conecta una base de datos Neon Postgres (ver abajo).
2. Copia `.env.example` a `.env.local` y define `DATABASE_URL`.
3. Ejecuta:

```bash
npm install
npm run db:setup
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Admin

- URL: `/admin/login`
- Define `ADMIN_PASSWORD` en `.env.local` para desarrollo o guarda la contraseña desde **Admin → Seguridad** en producción.

Desde el panel puedes:

- Crear y editar productos
- Subir portadas
- Configurar precios por país (MXN, COP, ARS, PEN, USD)
- Cambiar el número de WhatsApp y mensaje de la tienda

## Variables de entorno

```env
ADMIN_PASSWORD=tu-contraseña-segura
ADMIN_SECRET=una-clave-secreta-larga-de-al-menos-32-caracteres
WHATSAPP_NUMBER=5212345678900
DATABASE_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=
```

- `DATABASE_URL`: **obligatoria**. Neon Postgres (local y producción).
- `BLOB_READ_WRITE_TOKEN`: opcional. Si no está, las imágenes se guardan en `public/uploads/`.

## Base de datos (Neon Postgres)

En Vercel:

```bash
npx vercel integration add neon -m region=iad1 -m auth=false --plan free_v3
```

Eso crea la base y configura `DATABASE_URL` automáticamente.

## Scripts

- `npm run db:migrate` — aplica migraciones Postgres
- `npm run db:seed` — carga productos demo
- `npm run db:setup` — migrate + seed
- `npm run build` — build de producción

## Despliegue en Vercel

1. Sube el repo a GitHub
2. Importa en Vercel
3. Conecta Neon Postgres (`vercel integration add neon`)
4. Configura `ADMIN_PASSWORD`, `ADMIN_SECRET` y `WHATSAPP_NUMBER`
5. Opcional: Vercel Blob para portadas en producción

## Flujo de compra

1. El cliente elige su país
2. Ve precios en su moneda
3. Añade productos al carrito
4. Pulsa **Ordenar por WhatsApp**
5. Se abre WhatsApp con el pedido formateado para pago externo
