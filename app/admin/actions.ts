"use server";

import { randomBytes, scryptSync } from "node:crypto";
import type { Prisma } from "@/generated/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const toAdminUrl = (type: "success" | "error", message: string) =>
  `/admin?type=${type}&message=${encodeURIComponent(message)}`;

const getRequiredString = (formData: FormData, key: string) => {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
};

const getOptionalString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const getPriceInput = (amount: string) => {
  if (!amount.trim()) {
    return null;
  }

  const normalized = Number(amount);

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error("Price must be a valid positive number.");
  }

  return {
    amount: Number(normalized.toFixed(2)),
    amountInCents: Math.round(normalized * 100),
  };
};

const parseImages = (value: string) =>
  value
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean);

const parseMetadata = (value: string) => {
  if (!value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error("Metadata must be a JSON object.");
    }

    return parsed as Record<string, unknown>;
  } catch {
    throw new Error("Metadata must be valid JSON.");
  }
};

const toStripeMetadata = (metadata: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, String(value)]));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toUniqueSlug = (name: string, fallback: string) =>
  `${slugify(name) || fallback.toLowerCase()}-${fallback.toLowerCase().slice(0, 8)}`;

const hashPassword = (password: string, salt: string) =>
  scryptSync(password, salt, 64).toString("hex");

const generatePasswordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(password, salt)}`;
};

const revalidateCatalog = () => {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/products");
};

const ensureAdminAccess = async () => {
  const session = await getSessionFromCookies();

  if (!session.isAdmin) {
    throw new Error("Unauthorized.");
  }
};

const replaceProductImages = async (productId: string, name: string, images: string[]) => {
  await prisma.productImage.deleteMany({
    where: {
      productId,
    },
  });

  if (!images.length) {
    return;
  }

  await prisma.productImage.createMany({
    data: images.map((url, index) => ({
      productId,
      url,
      altText: name,
      sortOrder: index,
      isPrimary: index === 0,
    })),
  });
};

export async function createProductAction(formData: FormData) {
  try {
    await ensureAdminAccess();
    const name = getRequiredString(formData, "name");
    const description = getOptionalString(formData, "description");
    const images = parseImages(getOptionalString(formData, "images"));
    const price = getPriceInput(getOptionalString(formData, "price"));
    const currency = getOptionalString(formData, "currency").toLowerCase() || "usd";
    const active = formData.get("active") === "on";
    const metadata = parseMetadata(getOptionalString(formData, "metadata"));

    const stripeProduct = await stripe.products.create({
      name,
      description: description || undefined,
      images,
      active,
      metadata: toStripeMetadata(metadata),
    });

    let stripePriceId: string | undefined;

    if (price) {
      const stripePrice = await stripe.prices.create({
        currency,
        unit_amount: price.amountInCents,
        product: stripeProduct.id,
      });

      stripePriceId = stripePrice.id;

      await stripe.products.update(stripeProduct.id, {
        default_price: stripePrice.id,
      });
    }

    const product = await prisma.product.create({
      data: {
        stripeProductId: stripeProduct.id,
        slug: toUniqueSlug(name, stripeProduct.id),
        name,
        description: description || undefined,
        status: active ? "active" : "archived",
        currency,
        basePriceAmount: price?.amount,
        metadata: metadata as Prisma.InputJsonValue,
        variants: stripePriceId
          ? {
              create: {
                stripePriceId,
                name: "Default",
                priceAmount: price?.amount,
                currency,
                isActive: active,
              },
            }
          : undefined,
      },
    });

    await replaceProductImages(product.id, name, images);

    revalidateCatalog();
    redirect(toAdminUrl("success", `Created product ${name}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product.";
    redirect(toAdminUrl("error", message));
  }
}

export async function updateProductAction(formData: FormData) {
  const productId = getRequiredString(formData, "productId");

  try {
    await ensureAdminAccess();
    const name = getRequiredString(formData, "name");
    const description = getOptionalString(formData, "description");
    const images = parseImages(getOptionalString(formData, "images"));
    const active = formData.get("active") === "on";
    const metadata = parseMetadata(getOptionalString(formData, "metadata"));
    const price = getPriceInput(getOptionalString(formData, "price"));
    const currency = getOptionalString(formData, "currency").toLowerCase() || "usd";

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    if (existingProduct.stripeProductId) {
      await stripe.products.update(existingProduct.stripeProductId, {
        name,
        description: description || undefined,
        images,
        active,
        metadata: toStripeMetadata(metadata),
      });
    }

    const currentVariant = existingProduct.variants[0];
    const shouldReplacePrice =
      price &&
      (!currentVariant ||
        Number(currentVariant.priceAmount ?? 0) !== price.amount ||
        currentVariant.currency !== currency);

    let newStripePriceId: string | undefined;

    if (shouldReplacePrice && existingProduct.stripeProductId) {
      const stripePrice = await stripe.prices.create({
        currency,
        unit_amount: price.amountInCents,
        product: existingProduct.stripeProductId,
      });

      newStripePriceId = stripePrice.id;

      await stripe.products.update(existingProduct.stripeProductId, {
        default_price: stripePrice.id,
      });
    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        description: description || undefined,
        status: active ? "active" : "archived",
        currency,
        basePriceAmount: price?.amount ?? null,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    if (newStripePriceId) {
      await prisma.productVariant.create({
        data: {
          productId,
          stripePriceId: newStripePriceId,
          name: "Default",
          priceAmount: price?.amount,
          currency,
          isActive: active,
        },
      });
    } else if (currentVariant) {
      await prisma.productVariant.update({
        where: {
          id: currentVariant.id,
        },
        data: {
          priceAmount: price?.amount ?? null,
          currency,
          isActive: active,
        },
      });
    }

    await replaceProductImages(productId, name, images);

    revalidateCatalog();
    redirect(toAdminUrl("success", `Updated product ${name}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update product.";
    redirect(toAdminUrl("error", message));
  }
}

export async function deleteProductAction(formData: FormData) {
  const productId = getRequiredString(formData, "productId");

  try {
    await ensureAdminAccess();
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    if (product.stripeProductId) {
      try {
        await stripe.products.del(product.stripeProductId);
      } catch {
        await stripe.products.update(product.stripeProductId, {
          active: false,
        });
      }
    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: "archived",
      },
    });

    revalidateCatalog();
    redirect(toAdminUrl("success", `Archived product ${product.name}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove product.";
    redirect(toAdminUrl("error", message));
  }
}

export async function createCustomerAction(formData: FormData) {
  try {
    await ensureAdminAccess();
    const name = getRequiredString(formData, "name");
    const email = getRequiredString(formData, "email").toLowerCase();
    const studentId = getRequiredString(formData, "studentId");
    const phone = getOptionalString(formData, "phone");
    const notes = getOptionalString(formData, "notes");

    const customer = await stripe.customers.create({
      name,
      email,
      phone: phone || undefined,
      description: notes || undefined,
      metadata: {
        studentId,
        role: "customer",
      },
    });

    await prisma.user.upsert({
      where: {
        email,
      },
      create: {
        name,
        email,
        passwordHash: generatePasswordHash(randomBytes(24).toString("hex")),
        studentId,
        phone: phone || undefined,
        role: "customer",
        status: "invited",
        stripeCustomerId: customer.id,
        notes: notes || undefined,
      },
      update: {
        name,
        studentId,
        phone: phone || undefined,
        stripeCustomerId: customer.id,
        notes: notes || undefined,
      },
    });

    revalidatePath("/admin");
    redirect(toAdminUrl("success", `Created customer ${email}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create customer.";
    redirect(toAdminUrl("error", message));
  }
}

export async function updateCustomerAction(formData: FormData) {
  const customerId = getRequiredString(formData, "customerId");

  try {
    await ensureAdminAccess();
    const name = getRequiredString(formData, "name");
    const email = getRequiredString(formData, "email").toLowerCase();
    const studentId = getRequiredString(formData, "studentId");
    const phone = getOptionalString(formData, "phone");
    const notes = getOptionalString(formData, "notes");

    const user = await prisma.user.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!user) {
      throw new Error("Customer not found.");
    }

    if (user.stripeCustomerId) {
      await stripe.customers.update(user.stripeCustomerId, {
        name,
        email,
        phone: phone || undefined,
        description: notes || undefined,
        metadata: {
          studentId,
          role: user.role,
        },
      });
    }

    await prisma.user.update({
      where: {
        id: customerId,
      },
      data: {
        name,
        email,
        studentId,
        phone: phone || undefined,
        notes: notes || undefined,
      },
    });

    revalidatePath("/admin");
    redirect(toAdminUrl("success", `Updated customer ${email}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update customer.";
    redirect(toAdminUrl("error", message));
  }
}

export async function deleteCustomerAction(formData: FormData) {
  const customerId = getRequiredString(formData, "customerId");

  try {
    await ensureAdminAccess();
    const user = await prisma.user.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!user) {
      throw new Error("Customer not found.");
    }

    if (user.stripeCustomerId) {
      await stripe.customers.del(user.stripeCustomerId);
    }

    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: {
        id: customerId,
      },
      data: {
        status: "suspended",
      },
    });

    revalidatePath("/admin");
    redirect(toAdminUrl("success", `Suspended customer ${user.email}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete customer.";
    redirect(toAdminUrl("error", message));
  }
}
