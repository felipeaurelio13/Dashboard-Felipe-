# Ritual OS (PWA mobile-first)

Sistema de gestión semanal/mensual para reemplazar planillas, con foco en **cero fricción** y **cero sorpresas**.

## Stack
- Next.js 14 + TypeScript + Tailwind.
- Supabase (Auth magic link + Postgres + RLS).
- Prisma para esquema reproducible.
- IndexedDB outbox para offline queue.
- Vitest + Playwright.
- Sentry + logging estructurado.

## Setup local
1. `npm install`
2. Copiar `.env.example` a `.env.local` y completar variables.
3. Crear proyecto Supabase y ejecutar `supabase/migrations/001_init.sql`.
4. `npm run dev`

## Scripts
- `npm run db:migrate`
- `npm run db:reset` (solo local)
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Auth + RLS
- Login por email magic link en `/auth`.
- Todas las tablas tienen `user_id` y política RLS `auth.uid() = user_id`.

## Offline/outbox
- Si no hay conexión, los cambios críticos se encolan en IndexedDB.
- Al recuperar red, se sincroniza con reintentos exponenciales.
- UI superior indica estado `Conectado` u `Offline: cambios en cola`.

## PWA
- `public/manifest.webmanifest`.
- `public/sw.js` cachea rutas principales.
- Instalable en móvil (standalone).

## Deploy en GitHub Pages
El repo ya queda listo para desplegar estático en Pages:

1. Ir a **Settings → Pages** y seleccionar **Source: GitHub Actions**.
2. Agregar estos secrets en el repositorio:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SENTRY_DSN` (opcional)
3. Hacer push a `main`. El workflow `.github/workflows/deploy-pages.yml` compila y publica `out/` automáticamente.
4. Para repositorios de proyecto (`owner/repo`), el build setea `basePath` automáticamente para servir desde `/<repo>`.

> Nota: para usar route handlers server-side, recomienda Vercel/Fly. Para Pages, prioriza flujo client-side con Supabase directo (ya soportado en este repo).

## Seed opcional (no automático)
- No hay mock data en la app.
- Si quieres datos de desarrollo, crea un SQL de seed local y ejecútalo manualmente.

## Definition of Done checklist
- [x] PWA instalable (manifest + service worker).
- [x] Outbox offline y sincronización al volver internet.
- [x] UI mobile-first con bottom nav y controles >= 44px.
- [x] Validación Zod en flujos críticos (daily + pipeline).
- [x] RLS por usuario en todas las tablas.
- [x] Tests unitarios + e2e base.
- [x] Empty states útiles (sin pantallas vacías).
