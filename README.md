# LibroTeck

Catálogo de cursos y libros con precios por país y checkout por WhatsApp.

## Demo en vivo

- **Tienda:** https://libroteck.vercel.app
- **Admin:** https://libroteck.vercel.app/admin/login
- **Contraseña:** `admin123`

## Inicio rápido

```bash
npm install
npm run db:setup
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Admin

- URL: `/admin/login`
- Contraseña por defecto: `admin123`

Desde el panel puedes:

- Crear y editar productos
- Subir portadas
- Configurar precios por país (MXN, COP, ARS, PEN, USD)
- Cambiar el número de WhatsApp

## Variables de entorno

Copia `.env.example` a `.env.local`:

```env
ADMIN_PASSWORD=admin123
ADMIN_SECRET=una-clave-secreta-larga
WHATSAPP_NUMBER=5212345678900
BLOB_READ_WRITE_TOKEN=
```

- `BLOB_READ_WRITE_TOKEN`: opcional. Si no está, las imágenes se guardan en `public/uploads/`.
- Para producción en Vercel con Neon Postgres, define `DATABASE_URL`.

## Scripts

- `npm run db:migrate` — aplica migraciones SQLite
- `npm run db:seed` — carga productos demo
- `npm run db:setup` — migrate + seed
- `npm run build` — build de producción

## Despliegue en Vercel

1. Sube el repo a GitHub
2. Importa en Vercel
3. Configura variables de entorno
4. Para imágenes en producción, activa Vercel Blob
5. Para base de datos persistente en serverless, usa Neon Postgres con `DATABASE_URL`

## Flujo de compra

1. El cliente elige su país
2. Ve precios en su moneda
3. Añade productos al carrito
4. Pulsa **Ordenar por WhatsApp**
5. Se abre WhatsApp con el pedido formateado para pago externo
