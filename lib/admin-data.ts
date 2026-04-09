import "server-only";

import { createHash, randomBytes, scryptSync } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const hashPassword = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

const generatePasswordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(password, salt)}`;
};

const hashOpaqueToken = (token: string) => createHash("sha256").update(token).digest("hex");

const syncStripeCustomer = async (customer: Awaited<ReturnType<typeof stripe.customers.list>>["data"][number]) => {
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
  const customers = await stripe.customers.list({
    limit: 100,
  });

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
