import "server-only";

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { CatalogProduct } from "@/lib/ecommerce";

type ProductRecord = Prisma.ProductGetPayload<{
  include: {
    images: {
      orderBy: {
        sortOrder: "asc";
      };
    };
  };
}>;

const mapRecordToCatalogProduct = (product: NonNullable<ProductRecord>): CatalogProduct => ({
  id: product.id,
  name: product.name,
  description: product.description ?? null,
  images: product.images.map((image) => image.url),
  default_price: {
    unit_amount:
      product.basePriceAmount != null
        ? Math.round(Number(product.basePriceAmount) * 100)
        : null,
    currency: product.currency,
  },
  metadata:
    product.metadata && typeof product.metadata === "object" && !Array.isArray(product.metadata)
      ? Object.fromEntries(
          Object.entries(product.metadata as Record<string, unknown>).map(([key, value]) => [
            key,
            String(value ?? ""),
          ])
        )
      : {},
  active: product.status === "active",
});

export const getCatalogProductRecordById = async (catalogId: string) => {
  return prisma.product.findFirst({
    where: {
      OR: [{ id: catalogId }, { stripeProductId: catalogId }],
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
};

export const getCatalogProducts = async (limit = 18) => {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });

  return products.map((product) => mapRecordToCatalogProduct(product));
};

export const getCatalogProductById = async (catalogId: string) => {
  const product = await getCatalogProductRecordById(catalogId);

  if (!product) {
    throw new Error("Product not found.");
  }

  return mapRecordToCatalogProduct(product);
};
