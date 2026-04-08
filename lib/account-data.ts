import "server-only";

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import { OrderRecord, ProductReview, ShippingAddress } from "@/lib/ecommerce";
import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store/cart-store";

const requireAuthenticatedUser = async () => {
  const session = await getSessionFromCookies();

  if (!session.user?.email) {
    throw new Error("Unauthorized.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email.toLowerCase(),
    },
  });

  if (!user) {
    throw new Error("Unauthorized.");
  }

  return user;
};

const syncProductFromStripe = async (stripeProductId: string) => {
  const stripeProduct = await stripe.products.retrieve(stripeProductId, {
    expand: ["default_price"],
  });

  if (!("id" in stripeProduct) || stripeProduct.deleted) {
    throw new Error("Product not found.");
  }

  const defaultPrice =
    stripeProduct.default_price && typeof stripeProduct.default_price !== "string"
      ? stripeProduct.default_price
      : null;

  const syncedProduct = await prisma.product.upsert({
    where: {
      stripeProductId,
    },
    create: {
      stripeProductId: stripeProduct.id,
      slug: `${stripeProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || stripeProduct.id.toLowerCase()}-${stripeProduct.id.toLowerCase()}`,
      name: stripeProduct.name,
      description: stripeProduct.description ?? undefined,
      status: stripeProduct.active ? "active" : "archived",
      isFeatured: stripeProduct.metadata.featured === "true",
      currency: (defaultPrice?.currency ?? "usd").toLowerCase(),
      basePriceAmount:
        defaultPrice?.unit_amount != null ? defaultPrice.unit_amount / 100 : null,
      metadata: Object.keys(stripeProduct.metadata).length
        ? (Object.fromEntries(
            Object.entries(stripeProduct.metadata).map(([key, value]) => [key, value ?? ""])
          ) as Prisma.InputJsonObject)
        : undefined,
    },
    update: {
      name: stripeProduct.name,
      description: stripeProduct.description ?? undefined,
      status: stripeProduct.active ? "active" : "archived",
      isFeatured: stripeProduct.metadata.featured === "true",
      currency: (defaultPrice?.currency ?? "usd").toLowerCase(),
      basePriceAmount:
        defaultPrice?.unit_amount != null ? defaultPrice.unit_amount / 100 : null,
      metadata: Object.keys(stripeProduct.metadata).length
        ? (Object.fromEntries(
            Object.entries(stripeProduct.metadata).map(([key, value]) => [key, value ?? ""])
          ) as Prisma.InputJsonObject)
        : undefined,
    },
  });

  await prisma.productImage.deleteMany({
    where: {
      productId: syncedProduct.id,
    },
  });

  if (stripeProduct.images.length) {
    await prisma.productImage.createMany({
      data: stripeProduct.images.map((url, index) => ({
        productId: syncedProduct.id,
        url,
        altText: stripeProduct.name,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });
  }

  return prisma.product.findUniqueOrThrow({
    where: {
      id: syncedProduct.id,
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

const getProductByStripeId = async (stripeProductId: string) => {
  const product = await prisma.product.findUnique({
    where: {
      stripeProductId,
    },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (product) {
    return product;
  }

  return syncProductFromStripe(stripeProductId);
};

const toPublicOrder = (order: {
  orderNumber: string;
  createdAt: Date;
  paymentMethod: string | null;
  totalAmount: { toNumber: () => number };
  items: Array<{
    productName: string;
    imageUrl: string | null;
    quantity: number;
    unitPriceAmount: { toNumber: () => number };
  }>;
  shippingAddress: unknown;
  status: string;
}) =>
  ({
    id: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item, index) => ({
      id: `${order.orderNumber}-${index}`,
      name: item.productName,
      quantity: item.quantity,
      price: Math.round(item.unitPriceAmount.toNumber() * 100),
      imageUrl: item.imageUrl,
    })),
    subtotal: Math.round(order.items.reduce((sum, item) => sum + item.unitPriceAmount.toNumber() * item.quantity, 0) * 100),
    discountAmount: 0,
    total: Math.round(order.totalAmount.toNumber() * 100),
    paymentMethod:
      order.paymentMethod === "bank"
        ? "bank"
        : order.paymentMethod === "cod"
          ? "cod"
          : "card",
    shippingAddress: (order.shippingAddress ?? {}) as ShippingAddress,
    status:
      order.status === "delivered"
        ? "Delivered"
        : order.status === "processing"
          ? "Processing"
          : "Paid",
}) satisfies OrderRecord;

const toShippingAddressJson = (shippingAddress: ShippingAddress) =>
  ({
    fullName: shippingAddress.fullName,
    email: shippingAddress.email,
    phone: shippingAddress.phone,
    addressLine1: shippingAddress.addressLine1,
    addressLine2: shippingAddress.addressLine2 ?? "",
    city: shippingAddress.city,
    state: shippingAddress.state,
    postalCode: shippingAddress.postalCode,
    country: shippingAddress.country,
  }) satisfies Prisma.InputJsonObject;

const generateOrderNumber = () =>
  `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const getAccountData = async () => {
  const user = await requireAuthenticatedUser();

  const [wishlistItems, orders] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    wishlist: wishlistItems
      .map((item) => item.product.stripeProductId)
      .filter((value): value is string => Boolean(value)),
    orders: orders.map((order) => toPublicOrder(order)),
  };
};

export const toggleWishlistItem = async (stripeProductId: string) => {
  const user = await requireAuthenticatedUser();
  const product = await getProductByStripeId(stripeProductId);
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId: product.id,
      },
    },
  });

  if (existingItem) {
    await prisma.wishlistItem.delete({
      where: {
        id: existingItem.id,
      },
    });
  } else {
    await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId: product.id,
      },
    });
  }

  return getAccountData();
};

export const getProductReviewsByStripeId = async (stripeProductId: string) => {
  const product = await getProductByStripeId(stripeProductId);
  const reviews = await prisma.review.findMany({
    where: {
      productId: product.id,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews.map(
    (review) =>
      ({
        id: review.id,
        productId: stripeProductId,
        author: review.user.name,
        rating: review.rating,
        comment: review.comment ?? "",
        createdAt: review.createdAt.toISOString(),
      }) satisfies ProductReview
  );
};

export const upsertProductReview = async ({
  stripeProductId,
  rating,
  comment,
}: {
  stripeProductId: string;
  rating: number;
  comment: string;
}) => {
  const user = await requireAuthenticatedUser();
  const product = await getProductByStripeId(stripeProductId);

  await prisma.review.upsert({
    where: {
      productId_userId: {
        productId: product.id,
        userId: user.id,
      },
    },
    create: {
      productId: product.id,
      userId: user.id,
      rating,
      comment,
      status: "approved",
    },
    update: {
      rating,
      comment,
      status: "approved",
    },
  });

  return getProductReviewsByStripeId(stripeProductId);
};

export const createOrderForCurrentUser = async ({
  items,
  discountAmount,
  total,
  paymentMethod,
  shippingAddress,
}: {
  items: CartItem[];
  discountAmount: number;
  total: number;
  paymentMethod: OrderRecord["paymentMethod"];
  shippingAddress: ShippingAddress;
}) => {
  const user = await requireAuthenticatedUser();

  if (!items.length) {
    throw new Error("Your cart is empty.");
  }

  const productRecords = await Promise.all(items.map((item) => getProductByStripeId(item.id)));

  const productsByStripeId = new Map(
    productRecords
      .filter((product) => product.stripeProductId)
      .map((product) => [product.stripeProductId as string, product])
  );

  for (const item of items) {
    if (!productsByStripeId.has(item.id)) {
      throw new Error(`Product ${item.name} is unavailable.`);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const createdOrder = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: user.id,
      status: paymentMethod === "card" ? "paid" : "processing",
      paymentStatus: paymentMethod === "card" ? "paid" : "authorized",
      fulfillmentStatus: "processing",
      currency: "usd",
      subtotalAmount: subtotal / 100,
      discountAmount: discountAmount / 100,
      totalAmount: total / 100,
      paymentMethod,
      shippingAddress: toShippingAddressJson(shippingAddress),
      items: {
        create: items.map((item) => {
          const product = productsByStripeId.get(item.id)!;
          const primaryImage = product.images[0]?.url ?? item.imageUrl;

          return {
            productId: product.id,
            productName: item.name,
            imageUrl: primaryImage,
            quantity: item.quantity,
            unitPriceAmount: item.price / 100,
            totalPriceAmount: (item.price * item.quantity) / 100,
          };
        }),
      },
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return toPublicOrder({
    ...createdOrder,
    items: createdOrder.items,
  });
};
