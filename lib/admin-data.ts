import "server-only";

import { createHash, randomBytes, scryptSync } from "node:crypto";
import type { Prisma } from "@/generated/prisma";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toUniqueSlug = (name: string, fallback: string) => {
  const base = slugify(name) || fallback.toLowerCase();
  return `${base}-${fallback.toLowerCase()}`;
};

const hashPassword = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

const generatePasswordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(password, salt)}`;
};

const hashOpaqueToken = (token: string) => createHash("sha256").update(token).digest("hex");

const toStripeMetadataJson = (
  metadata: Stripe.Metadata | null | undefined
): Prisma.InputJsonValue | undefined => {
  if (!metadata) {
    return undefined;
  }

  const entries = Object.entries(metadata).filter(([, value]) => value != null);
  return entries.length ? (Object.fromEntries(entries) as Prisma.InputJsonValue) : undefined;
};

const syncStripeProduct = async (product: Stripe.Product) => {
  const defaultPrice =
    product.default_price && typeof product.default_price !== "string"
      ? product.default_price
      : null;

  const synced = await prisma.product.upsert({
    where: {
      stripeProductId: product.id,
    },
    create: {
      stripeProductId: product.id,
      slug: toUniqueSlug(product.name, product.id),
      name: product.name,
      description: product.description ?? undefined,
      status: product.active ? "active" : "archived",
      isFeatured: product.metadata.featured === "true",
      currency: (defaultPrice?.currency ?? "usd").toLowerCase(),
      basePriceAmount:
        defaultPrice?.unit_amount != null ? defaultPrice.unit_amount / 100 : null,
      metadata: toStripeMetadataJson(product.metadata),
    },
    update: {
      name: product.name,
      description: product.description ?? undefined,
      status: product.active ? "active" : "archived",
      isFeatured: product.metadata.featured === "true",
      currency: (defaultPrice?.currency ?? "usd").toLowerCase(),
      basePriceAmount:
        defaultPrice?.unit_amount != null ? defaultPrice.unit_amount / 100 : null,
      metadata: toStripeMetadataJson(product.metadata),
    },
  });

  await prisma.productImage.deleteMany({
    where: {
      productId: synced.id,
    },
  });

  if (product.images.length) {
    await prisma.productImage.createMany({
      data: product.images.map((url, index) => ({
        productId: synced.id,
        url,
        altText: product.name,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });
  }
};

const syncStripeCustomer = async (customer: Stripe.Customer) => {
  if (!customer.email) {
    return;
  }

  const role = customer.metadata.role === "admin" ? "admin" : customer.metadata.role === "manager" ? "manager" : "customer";
  const studentId =
    customer.metadata.studentId?.trim() || `STRIPE-${customer.id.slice(-8).toUpperCase()}`;

  await prisma.user.upsert({
    where: {
      email: customer.email.toLowerCase(),
    },
    create: {
      name: customer.name?.trim() || customer.email,
      email: customer.email.toLowerCase(),
      passwordHash: generatePasswordHash(randomBytes(24).toString("hex")),
      studentId,
      phone: customer.phone ?? undefined,
      role,
      status: "invited",
      stripeCustomerId: customer.id,
      notes: customer.description ?? undefined,
    },
    update: {
      name: customer.name?.trim() || customer.email,
      phone: customer.phone ?? undefined,
      studentId,
      role,
      stripeCustomerId: customer.id,
      notes: customer.description ?? undefined,
    },
  });
};

export const syncAdminDataFromStripe = async () => {
  const [products, customers] = await Promise.all([
    stripe.products.list({
      expand: ["data.default_price"],
      limit: 100,
    }),
    stripe.customers.list({
      limit: 100,
    }),
  ]);

  await Promise.all(products.data.map((product) => syncStripeProduct(product)));
  await Promise.all(customers.data.map((customer) => syncStripeCustomer(customer)));
};

export const getAdminProducts = async () =>
  prisma.product.findMany({
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      _count: {
        select: {
          orderItems: true,
          reviews: true,
          wishlistItems: true,
        },
      },
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
  });

export const getAdminCustomers = async () =>
  prisma.user.findMany({
    where: {
      role: {
        not: "admin",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

export const buildMetadataHash = (value: unknown) =>
  hashOpaqueToken(JSON.stringify(value ?? {})).slice(0, 16);
