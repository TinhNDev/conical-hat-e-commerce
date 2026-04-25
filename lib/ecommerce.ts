export type PaymentMethod = "card" | "cod" | "bank";

export interface CatalogPrice {
  unit_amount: number | null;
  currency: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  default_price: CatalogPrice | null;
  metadata: Record<string, string>;
  active: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  studentId: string;
  role: "admin" | "manager" | "customer";
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl: string | null;
  }>;
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  status: "Paid" | "Processing" | "Delivered";
}

export interface EnrichedProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number | null;
  currency: string;
  category: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  discountPercentage: number;
  tags: string[];
  specs: Array<{ label: string; value: string }>;
}

const CATEGORY_PRESETS = [
  {
    name: "Phong dáng tối giản",
    accent:
      "Thiết kế gọn gàng, dễ phối và giữ được nét thanh lịch hiện đại.",
    tags: ["Tối giản", "Dễ phối", "Thanh lịch"],
  },
  {
    name: "Di chuyển mỗi ngày",
    accent:
      "Nhẹ, thoáng và linh hoạt cho những buổi dạo phố, du lịch hay chụp ảnh ngoài trời.",
    tags: ["Nhẹ", "Thoáng", "Linh hoạt"],
  },
  {
    name: "Điểm nhấn sáng tạo",
    accent:
      "Những mẫu nón lá có họa tiết và cảm hứng thiết kế nổi bật, khác biệt.",
    tags: ["Nổi bật", "Nghệ thuật", "Cao cấp"],
  },
  {
    name: "Nét Việt ứng dụng",
    accent:
      "Kết hợp chất liệu thủ công và tinh thần Việt trong những khoảnh khắc đời thường.",
    tags: ["Thủ công", "Truyền thống", "Đời sống"],
  },
];

const SPEC_LABELS = [
  "Material",
  "Finish",
  "Weight",
  "Warranty",
  "Origin",
];

const SPEC_VALUES = [
  ["Brushed alloy", "Matte linen", "920 g", "2 years", "Canada"],
  ["Soft-touch polymer", "Satin ivory", "640 g", "1 year", "Japan"],
  ["Engineered wood", "Walnut stain", "1.4 kg", "3 years", "Vietnam"],
  ["Recycled textile", "Natural sand", "480 g", "18 months", "Sweden"],
];

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: "review-1",
    productId: "seed-a",
    author: "Avery",
    rating: 5,
    comment: "Looks premium in person and feels more considered than most store demos.",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "review-2",
    productId: "seed-b",
    author: "Linh",
    rating: 4,
    comment: "Clean design, useful details, and the checkout flow is fast.",
    createdAt: "2026-03-12T08:30:00.000Z",
  },
];

export const DISCOUNT_CODES = {
  SAVE10: 10,
  WELCOME15: 15,
  STUDENT20: 20,
} as const;

export const blogPosts = [
  {
    slug: "building-a-calmer-storefront",
    title: "Building a Calmer Storefront",
    excerpt: "Why warmer neutrals and stronger hierarchy outperform generic ecommerce templates.",
    date: "April 2, 2026",
  },
  {
    slug: "what-makes-a-product-page-convert",
    title: "What Makes a Product Page Convert",
    excerpt: "A practical checklist for clarity, confidence, and lower decision friction.",
    date: "March 19, 2026",
  },
];

export const faqs = [
  {
    question: "How do you handle payments?",
    answer: "Stripe powers card checkout. Cash on delivery and bank transfer are also available as checkout payment options.",
  },
  {
    question: "Can I save products for later?",
    answer: "Yes. Wishlist data is tied to the authenticated account so shoppers can return and compare items later.",
  },
  {
    question: "Is this backed by a database?",
    answer: "Yes. Product data is stored in PostgreSQL, and product image URLs are stored there after upload to a hosted media service.",
  },
];

export const teamMembers = [
  {
    name: "Thanh Tinh",
    role: "Software Engineer",
  }
];

const hashString = (value: string) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

export const formatPrice = (amount: number | null | undefined, currency = "vnd") => {
  if (amount == null) {
    return "Gia lien he";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const highlightText = (text: string, query: string) => {
  if (!query.trim()) {
    return [{ text, match: false }];
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");

  return text.split(regex).filter(Boolean).map((part) => {
    const partRegex = new RegExp(`^${escaped}$`, "i");
    return {
      text: part,
      match: partRegex.test(part),
    };
  });
};

export const getProductCategory = (product: CatalogProduct) => {
  const index = hashString(product.id) % CATEGORY_PRESETS.length;
  return CATEGORY_PRESETS[index];
};

export const getProductRating = (product: CatalogProduct) => {
  const base = 3.8 + (hashString(product.id) % 12) / 10;
  return Number(Math.min(base, 4.9).toFixed(1));
};

export const getProductReviewCount = (product: CatalogProduct) =>
  12 + (hashString(product.id) % 120);

export const getProductDiscount = (product: CatalogProduct) => {
  const hash = hashString(product.id);
  return hash % 3 === 0 ? 15 : hash % 5 === 0 ? 10 : 0;
};

export const getProductSpecs = (product: CatalogProduct) => {
  const index = hashString(product.id) % SPEC_VALUES.length;
  return SPEC_LABELS.map((label, specIndex) => ({
    label,
    value: SPEC_VALUES[index][specIndex],
  }));
};

export const enrichProduct = (product: CatalogProduct): EnrichedProduct => {
  const price = product.default_price;
  const category = getProductCategory(product);

  return {
    id: product.id,
    name: product.name,
    description:
      product.description ||
      "A curated product with a cleaner presentation, practical details, and a stronger visual hierarchy.",
    images: product.images ?? [],
    price: price?.unit_amount ?? null,
    currency: price?.currency ?? "vnd",
    category: category.name,
    rating: getProductRating(product),
    reviewCount: getProductReviewCount(product),
    featured: hashString(product.id) % 2 === 0,
    discountPercentage: getProductDiscount(product),
    tags: category.tags,
    specs: getProductSpecs(product),
  };
};

export const getCategorySummary = (products: CatalogProduct[]) => {
  const counts = new Map<string, { name: string; accent: string; count: number }>();

  products.filter(product => product.active === true).forEach((product) => {
    const category = getProductCategory(product);
    const existing = counts.get(category.name);
    counts.set(category.name, {
      name: category.name,
      accent: category.accent,
      count: existing ? existing.count + 1 : 1,
    });
  });

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
};

export const getRelatedProducts = (currentProduct: CatalogProduct, products: CatalogProduct[]) => {
  const currentCategory = getProductCategory(currentProduct).name;

  return products
    .filter((product) => product.id !== currentProduct.id)
    .sort((a, b) => {
      const aScore = getProductCategory(a).name === currentCategory ? 1 : 0;
      const bScore = getProductCategory(b).name === currentCategory ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, 3);
};

export const getProductReviews = (productId: string, storedReviews: ProductReview[]) => {
  const seeded = DEFAULT_REVIEWS.map((review, index) => ({
    ...review,
    id: `${productId}-seed-${index}`,
    productId,
  }));

  return [...seeded, ...storedReviews.filter((review) => review.productId === productId)];
};
