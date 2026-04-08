"use server";

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

const getAmountInCents = (amount: string) => {
  if (!amount.trim()) {
    return null;
  }

  const normalized = Number(amount);

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error("Price must be a valid positive number.");
  }

  return Math.round(normalized * 100);
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

    return Object.fromEntries(
      Object.entries(parsed).map(([key, metadataValue]) => [key, String(metadataValue)])
    );
  } catch {
    throw new Error("Metadata must be valid JSON.");
  }
};

const revalidateCatalog = (productId?: string) => {
  revalidatePath("/admin");
  revalidatePath("/products");

  if (productId) {
    revalidatePath(`/products/${productId}`);
  }
};

export async function createProductAction(formData: FormData) {
  try {
    const name = getRequiredString(formData, "name");
    const description = getOptionalString(formData, "description");
    const images = parseImages(getOptionalString(formData, "images"));
    const amount = getAmountInCents(getOptionalString(formData, "price"));
    const currency = getOptionalString(formData, "currency").toLowerCase() || "usd";
    const active = formData.get("active") === "on";
    const metadata = parseMetadata(getOptionalString(formData, "metadata"));

    const product = await stripe.products.create({
      name,
      description: description || undefined,
      images,
      active,
      metadata,
    });

    if (amount != null) {
      const price = await stripe.prices.create({
        currency,
        unit_amount: amount,
        product: product.id,
      });

      await stripe.products.update(product.id, {
        default_price: price.id,
      });
    }

    revalidateCatalog(product.id);
    redirect(toAdminUrl("success", `Created product ${name}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product.";
    redirect(toAdminUrl("error", message));
  }
}

export async function updateProductAction(formData: FormData) {
  const productId = getRequiredString(formData, "productId");

  try {
    const name = getRequiredString(formData, "name");
    const description = getOptionalString(formData, "description");
    const images = parseImages(getOptionalString(formData, "images"));
    const active = formData.get("active") === "on";
    const metadata = parseMetadata(getOptionalString(formData, "metadata"));
    const requestedAmount = getAmountInCents(getOptionalString(formData, "price"));
    const requestedCurrency = getOptionalString(formData, "currency").toLowerCase() || "usd";

    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });

    await stripe.products.update(productId, {
      name,
      description: description || undefined,
      images,
      active,
      metadata,
    });

    const currentPrice =
      product.default_price && typeof product.default_price !== "string"
        ? product.default_price
        : null;

    const shouldReplacePrice =
      requestedAmount != null &&
      (!currentPrice ||
        currentPrice.unit_amount !== requestedAmount ||
        currentPrice.currency !== requestedCurrency);

    if (shouldReplacePrice) {
      const newPrice = await stripe.prices.create({
        currency: requestedCurrency,
        unit_amount: requestedAmount,
        product: productId,
      });

      await stripe.products.update(productId, {
        default_price: newPrice.id,
      });
    }

    revalidateCatalog(productId);
    redirect(toAdminUrl("success", `Updated product ${name}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update product.";
    redirect(toAdminUrl("error", message));
  }
}

export async function deleteProductAction(formData: FormData) {
  const productId = getRequiredString(formData, "productId");

  try {
    const product = await stripe.products.retrieve(productId);
    await stripe.products.del(productId);
    revalidateCatalog(productId);
    redirect(toAdminUrl("success", `Deleted product ${product.name}.`));
  } catch {
    try {
      const product = await stripe.products.retrieve(productId);
      await stripe.products.update(productId, { active: false });
      revalidateCatalog(productId);
      redirect(
        toAdminUrl(
          "success",
          `Archived product ${product.name}. Stripe products with prices usually cannot be permanently deleted.`
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove product.";
      redirect(toAdminUrl("error", message));
    }
  }
}

export async function createCustomerAction(formData: FormData) {
  try {
    const name = getRequiredString(formData, "name");
    const email = getRequiredString(formData, "email");
    const phone = getOptionalString(formData, "phone");
    const notes = getOptionalString(formData, "notes");

    await stripe.customers.create({
      name,
      email,
      phone: phone || undefined,
      description: notes || undefined,
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
    const name = getRequiredString(formData, "name");
    const email = getRequiredString(formData, "email");
    const phone = getOptionalString(formData, "phone");
    const notes = getOptionalString(formData, "notes");

    await stripe.customers.update(customerId, {
      name,
      email,
      phone: phone || undefined,
      description: notes || undefined,
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
    await stripe.customers.del(customerId);
    revalidatePath("/admin");
    redirect(toAdminUrl("success", `Deleted customer ${customerId}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete customer.";
    redirect(toAdminUrl("error", message));
  }
}
