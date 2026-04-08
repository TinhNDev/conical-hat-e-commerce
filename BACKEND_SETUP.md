# Backend Setup

## 1. Environment

Copy values from `.env.example` and provide at least:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/conical_hat_ecommerce?schema=public"
SESSION_SECRET="change-me-to-a-long-random-secret"
ADMIN_EMAILS="admin@atelier.store"
```

## 2. Start PostgreSQL

```bash
npm run db:up
```

## 3. Generate Prisma client

```bash
npm run db:generate
```

## 4. Run migrations

```bash
npm run db:migrate -- --name init_auth
```

## 5. Seed the first admin user

Optional overrides:

```bash
ADMIN_SEED_EMAIL="admin@atelier.store"
ADMIN_SEED_PASSWORD="admin123456"
ADMIN_SEED_NAME="System Admin"
ADMIN_SEED_STUDENT_ID="ADMIN-0001"
```

Run:

```bash
npm run db:seed
```

## 6. Reset database

```bash
npm run db:reset
```

After reset, run migrations and seed again.

## 7. Open Prisma Studio

```bash
npm run db:studio
```
