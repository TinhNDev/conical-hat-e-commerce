"use server";

import { randomBytes, scryptSync } from "node:crypto";
import type { Prisma } from "@/generated/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import { uploadImages } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const toAdminUrl = ({
  type,
  message,
  view,
  productTab,
}: {
  type: "success" | "error";
  message: string;
  view?: "products" | "customers";
  productTab?: "create" | "catalog";
}) => {
  const searchParams = new URLSearchParams({
    type,
    message,
  });

  if (view) {
    searchParams.set("view", view);
  }

  if (productTab) {
    searchParams.set("productTab", productTab);
  }

  return `/admin?${searchParams.toString()}`;
};

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
  };
};

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

const getStoredImageUrls = (formData: FormData, key: string) =>
  getOptionalString(formData, key)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const collectImageUrls = async ({
  formData,
  fileKey,
  existingKey,
}: {
  formData: FormData;
  fileKey: string;
  existingKey: string;
}) => {
  const files = formData
    .getAll(fileKey)
    .filter((value): value is File => value instanceof File && value.size > 0);
  const uploadedImages = await uploadImages(files);

  return uploadedImages.length ? uploadedImages : getStoredImageUrls(formData, existingKey);
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
  let successMessage = "";

  try {
    await ensureAdminAccess();
    const name = getRequiredString(formData, "name");
    const description = getOptionalString(formData, "description");
    const images = await collectImageUrls({
      formData,
      fileKey: "imageFiles",
      existingKey: "existingImages",
    });
    const price = getPriceInput(getOptionalString(formData, "price"));
    const currency = getOptionalString(formData, "currency").toLowerCase() || "usd";
    const active = formData.get("active") === "on";
    const metadata = parseMetadata(getOptionalString(formData, "metadata"));
    const fallbackId = randomBytes(8).toString("hex");

    const product = await prisma.product.create({
      data: {
        slug: toUniqueSlug(name, fallbackId),
        name,
        description: description || undefined,
        status: active ? "active" : "archived",
        currency,
        basePriceAmount: price?.amount,
        metadata: metadata as Prisma.InputJsonValue,
        variants: price
          ? {
              create: {
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
    successMessage = `Created product ${name}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product.";
    redirect(toAdminUrl({ type: "error", message, view: "products", productTab: "create" }));
  }

  redirect(toAdminUrl({ type: "success", message: successMessage, view: "products", productTab: "create" }));
}

export async function createProductStateAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await ensureAdminAccess();
    const name = getRequiredString(formData, "name");
    const description = getOptionalString(formData, "description");
    const images = await collectImageUrls({
      formData,
      fileKey: "imageFiles",
      existingKey: "existingImages",
    });
    const price = getPriceInput(getOptionalString(formData, "price"));
    const currency = getOptionalString(formData, "currency").toLowerCase() || "usd";
    const active = formData.get("active") === "on";
    const metadata = parseMetadata(getOptionalString(formData, "metadata"));
    const fallbackId = randomBytes(8).toString("hex");

    const product = await prisma.product.create({
      data: {
        slug: toUniqueSlug(name, fallbackId),
        name,
        description: description || undefined,
        status: active ? "active" : "archived",
        currency,
        basePriceAmount: price?.amount,
        metadata: metadata as Prisma.InputJsonValue,
        variants: price
          ? {
              create: {
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

    return {
      status: "success",
      message: `Created product ${name}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to create product.",
    };
  }
}

export async function updateProductAction(formData: FormData) {
  const productId = getRequiredString(formData, "productId");
  let successMessage = "";

  try {
    await ensureAdminAccess();
    const name = getRequiredString(formData, "name");
    const description = getOptionalString(formData, "description");
    const images = await collectImageUrls({
      formData,
      fileKey: "imageFiles",
      existingKey: "existingImages",
    });
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

    const currentVariant = existingProduct.variants[0];

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

    if (!currentVariant && price) {
      await prisma.productVariant.create({
        data: {
          productId,
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
    successMessage = `Updated product ${name}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update product.";
    redirect(toAdminUrl({ type: "error", message, view: "products", productTab: "catalog" }));
  }

  redirect(toAdminUrl({ type: "success", message: successMessage, view: "products", productTab: "catalog" }));
}

export async function deleteProductAction(formData: FormData) {
  const productId = getRequiredString(formData, "productId");
  let successMessage = "";

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

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: "archived",
      },
    });

    revalidateCatalog();
    successMessage = `Archived product ${product.name}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove product.";
    redirect(toAdminUrl({ type: "error", message, view: "products", productTab: "catalog" }));
  }

  redirect(toAdminUrl({ type: "success", message: successMessage, view: "products", productTab: "catalog" }));
}

export async function createCustomerAction(formData: FormData) {
  let successMessage = "";

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
    successMessage = `Created customer ${email}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create customer.";
    redirect(toAdminUrl({ type: "error", message, view: "customers" }));
  }

  redirect(toAdminUrl({ type: "success", message: successMessage, view: "customers" }));
}

export async function updateCustomerAction(formData: FormData) {
  const customerId = getRequiredString(formData, "customerId");
  let successMessage = "";

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
    successMessage = `Updated customer ${email}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update customer.";
    redirect(toAdminUrl({ type: "error", message, view: "customers" }));
  }

  redirect(toAdminUrl({ type: "success", message: successMessage, view: "customers" }));
}

export async function deleteCustomerAction(formData: FormData) {
  const customerId = getRequiredString(formData, "customerId");
  let successMessage = "";

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
    successMessage = `Suspended customer ${user.email}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete customer.";
    redirect(toAdminUrl({ type: "error", message, view: "customers" }));
  }

  redirect(toAdminUrl({ type: "success", message: successMessage, view: "customers" }));
}
