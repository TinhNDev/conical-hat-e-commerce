# Deploy To Vercel

This project can be deployed to Vercel with PostgreSQL and Prisma.

## 1. Keep These Files In Git

Push these to GitHub:

- `app/`
- `components/`
- `lib/`
- `store/`
- `public/`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `package.json`
- `package-lock.json`
- `next.config.*`
- `tsconfig.json`
- `middleware.ts`
- `prisma.config.ts`

Do not ignore Prisma migrations. Vercel needs the schema and migration history.

## 2. Do Not Push These Files

These are local or generated artifacts and are already covered in `.gitignore`:

- `.env*`
- `.vercel/`
- `.next/`
- `generated/`
- `node_modules/`
- local SQL or SQLite files

## 3. Create A Production PostgreSQL Database

Use a hosted PostgreSQL provider such as:

- Neon
- Supabase
- Railway
- Render

Copy the production connection string.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"
```

## 4. Add Environment Variables In Vercel

In Vercel Project Settings -> Environment Variables, add:

```env
DATABASE_URL=
SESSION_SECRET=
ADMIN_EMAILS=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_BASE_URL=
```

Recommended values:

- `SESSION_SECRET`: a long random secret
- `ADMIN_EMAILS`: comma-separated admin emails, for example `admin@atelier.store`
- `NEXT_PUBLIC_BASE_URL`: your production domain, for example `https://your-project.vercel.app`

Add `STRIPE_WEBHOOK_SECRET` too if you use Stripe webhooks in production.

## 5. Import The Repo Into Vercel

1. Push the repo to GitHub.
2. Create a new Vercel project.
3. Import this repository.
4. Framework preset: `Next.js`
5. Root directory: repo root
6. Build command:

```bash
npm run build
```

7. Output directory: leave default

The build script already runs `prisma generate` before `next build`.

## 6. Run Prisma Migrations For Production

Before using the live app, apply migrations to the production database:

```bash
DATABASE_URL="your-production-database-url" npm run db:deploy
```

Then seed the first admin if needed:

```bash
DATABASE_URL="your-production-database-url" \
ADMIN_SEED_EMAIL="admin@atelier.store" \
ADMIN_SEED_PASSWORD="change-this-password" \
npm run db:seed
```

Do not keep the default seed password in production.

## 7. Redeploy

After migrations and env vars are ready:

1. Trigger a new deployment in Vercel.
2. Open the deployed app.
3. Test:
   - registration
   - login
   - admin page
   - Stripe checkout

## 8. Common Issues

### Prisma table does not exist

Run:

```bash
npm run db:deploy
```

against the production database.

### Prisma generate fails

Check that `DATABASE_URL` is set in Vercel.

### Admin page returns forbidden

Check that the signed-in email is listed in `ADMIN_EMAILS`.

### Stripe checkout fails

Check:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_BASE_URL`

## 9. Recommended GitHub Push Checklist

Before pushing:

```bash
npm run lint
npm run build
```

Make sure you are not committing:

- `.env.local`
- `.vercel/`
- `.next/`
- `generated/`

