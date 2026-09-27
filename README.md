# Seicho Life

Next.js (App Router) eCommerce app built with TypeScript, Tailwind CSS, Better Auth, Drizzle ORM and Postgres on Neon.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env example and fill in the values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: the pooled connection string from your Neon project
   - `BETTER_AUTH_SECRET`: generate one with `npx auth secret`

3. Generate the Better Auth tables into the Drizzle schema, then push them to the database:

   ```bash
   npm run auth:generate
   npm run db:push
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

| Script                  | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Start the dev server                                 |
| `npm run build`         | Production build                                     |
| `npm run lint`          | Run ESLint                                           |
| `npm run typecheck`     | Type-check with `tsc`                                |
| `npm run auth:generate` | Generate Better Auth tables into `src/db/schema.ts`  |
| `npm run db:generate`   | Generate SQL migrations from the schema              |
| `npm run db:migrate`    | Apply migrations                                     |
| `npm run db:push`       | Push the schema directly to the database (dev)       |
| `npm run db:studio`     | Open Drizzle Studio                                  |

## Structure

```
src/
  app/
    api/auth/[...all]/route.ts  # Better Auth route handler
    layout.tsx
    page.tsx
  db/
    index.ts                    # Drizzle client (Neon HTTP driver)
    schema.ts                   # Drizzle table definitions
  lib/
    auth.ts                     # Better Auth server config
    auth-client.ts              # Better Auth React client
drizzle.config.ts               # Drizzle Kit config
```
