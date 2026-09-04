# Time

App de gestión de agenda para negocios (peluquerías, restaurantes, sastrerías...). Los clientes finales reservan su propia cita sin intervención humana, por dos vías:

1. **WhatsApp** — hablan con un bot conectado al número del negocio (WhatsApp Cloud API de Meta).
2. **Llamada telefónica** — de momento el empleado que atiende la llamada mete la cita a mano en el panel (`channel = call`). A futuro (una vez haya clientes de pago) se ofrecerá elegir entre hablar con persona o con un bot de voz automático — proveedor de voz aún sin decidir. No construir integración de telefonía todavía (YAGNI hasta que exista ese plan de pago).

## Roles y multi-tenancy

Multi-tenant: un mismo Admin puede dar de alta **varios negocios** (p. ej. tiene una peluquería, un restaurante y una sastrería a la vez).

- **Admin**: control total, crea negocios, tiene vistas propias (gestión de negocios, vista cruzada) además de las de staff.
- **Supervisor** y **Empleado**: limitados a **un único negocio** (columna `business_id` en `users`, sin tabla pivote — no hace falta pertenecer a varios).

Autorización con Laravel Policies + campo `role` en `User` (enum: `admin`, `supervisor`, `employee`). Nada de paquete de permisos (spatie/...) — 3 roles fijos no lo justifican.

## Arquitectura

Decisión explícita del usuario: **Clean Architecture ligera** en el backend (no CQRS completo — sin bus de comandos/queries, sin event sourcing; eso resuelve un problema de escala que este proyecto no tiene). Para atomicidad real se usa `DB::transaction()` dentro de las Actions, no separación de comandos/queries.

Backend (`backend/app/`):
```
Domain/<Entidad>/            entidad de dominio en PHP puro + interface de repositorio (sin Eloquent)
Application/<Entidad>/       una clase Action por caso de uso (p. ej. BookAppointment.php)
Infrastructure/Persistence/  modelos Eloquent (en Eloquent/) + implementación de los repositorios
Http/Controllers/            controladores finos, delegan a Application/
```
`User` es la excepción: vive en `app/Models/User.php` como Eloquent `Authenticatable` nativo — abstraerlo del framework de auth no aporta nada real.

Las interfaces de repositorio se bindean en `app/Providers/AppServiceProvider.php`.

Frontend (`frontend/src/`): **Screaming Architecture** — carpetas por dominio/feature (`features/auth`, `features/dashboard`, futuros `features/appointments`, `features/businesses`, `features/whatsapp`...), nunca por tipo (`components/`, `views/`, `store/` a nivel raíz).

## Stack

- **Backend**: Laravel 11 + PostgreSQL, Sanctum (auth por token, no cookies SPA), PHP.
- **Frontend**: Vue 3 + TypeScript + Vite, Vue Router, Pinia, Tailwind CSS v4, componentes **shadcn-vue** (estilo `reka-nova`, iconos Phosphor — no Lucide). Alias `@` → `src/`.
- Cliente HTTP compartido en `frontend/src/shared/http.ts` (fetch nativo con Bearer token de `localStorage`, sin axios).

## Diseño visual

Dirección estética deliberada, no genérica: paleta cálida "papel + tinta + terracota" (variables `--paper`, `--ink`, `--rust` en `frontend/src/style.css`), tipografía **Fraunces** (titulares, display) + **Geist** (cuerpo/UI). Nada de morado/azul IA genérico, nada de Inter/system-ui como fuente principal. Layouts asimétricos (split-screen), no heroes centrados.

## Modelo de datos (estado actual)

- `users`: `role`, `business_id` (nullable, null para Admin o para staff desasignado), `dni` (único, nullable), `employee_number` (único, autogenerado — ver abajo, nullable), `created_by` (FK a `users.id`: qué Admin dio de alta a ese usuario; independiente de `business_id`, así el empleado sigue siendo localizable aunque quede desasignado).
- `businesses`: `owner_id` → user Admin dueño, `name`.
- `appointments`: `business_id`, `customer_name`, `customer_phone`, `starts_at`, `ends_at`, `channel` (`whatsapp`/`call`/`manual`), `status` (`scheduled`/`cancelled`/`completed`).
- `employee_number_counters`: tabla auxiliar de solo autoincremento (sin columnas propias) para generar `employee_number` de forma atómica y portable (Postgres y SQLite en tests) — formato `EMP-00001`. No usar `CREATE SEQUENCE` nativo de Postgres porque los tests corren en SQLite.

**"Eliminar" un empleado nunca borra el registro**: el botón "Eliminar" del listado de empleados en realidad **desasigna** (`business_id = null`), conservando DNI, número de empleado y demás datos por si se le vuelve a contratar. El modal de confirmación es deliberadamente disuasorio y aclara esto. Ver `POST /api/users/{id}/unassign`.

## Endpoints actuales

- `POST /api/login`, `POST /api/logout` (Sanctum token)
- `GET /api/user`
- `GET|POST /api/businesses`, `GET|DELETE /api/businesses/{id}` (solo Admin dueño; al borrar un negocio, sus citas se eliminan en cascada y el staff asignado queda con `business_id = null`)
- `POST /api/appointments`
- `GET|POST /api/users` (alta/listado de staff, solo Admin; el listado se filtra por `created_by`, no por `business_id`, para incluir también al staff desasignado)
- `PUT /api/users/{id}` (editar staff que el Admin creó)
- `POST /api/users/{id}/unassign` (desasignar, no borra — ver arriba)

## Convenciones de trabajo

- YAGNI por defecto: no añadir abstracciones, tablas o dependencias especulativas "por si acaso" — el usuario prefiere justificar cada capa nueva con una necesidad real, aunque quiere la base arquitectónica (Clean Architecture, Screaming Architecture) sólida desde el día 0 precisamente para evitar reescrituras costosas más adelante.
- Antes de dar por terminado un cambio de frontend, arrancar el dev server y verificar visualmente (Playwright/chromium-cli), no solo comprobar que compila.
- **Al terminar cada feature, escribir tests tanto de backend (PHPUnit/Pest en `backend/tests/`) como de frontend (Vitest + @vue/test-utils en `frontend/src/**/*.test.ts`)** — no dar una feature por cerrada sin su cobertura de test en ambos lados. Cadencia mensual acordada con el usuario: cada mes que se cierre una feature, debe llevar sus tests.
  - Backend: `cd backend && php artisan test`
  - Frontend: `cd frontend && npm run test`
  - Gotcha: Node ≥22 trae un `localStorage` global experimental que pisa el de jsdom y rompe los tests que lo usan (`localStorage.clear is not a function`). El script `npm run test` ya lo desactiva con `NODE_OPTIONS=--no-webstorage`; si se añade otro entrypoint de test hay que repetir ese flag.
