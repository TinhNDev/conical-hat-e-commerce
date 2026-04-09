import { NextResponse } from "next/server";
import { getProductReviewsByCatalogId, upsertProductReview } from "@/lib/account-data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reviews = await getProductReviewsByCatalogId(id);
    return NextResponse.json({ reviews });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load reviews.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      rating?: number;
      comment?: string;
    };

    if (!Number.isInteger(body.rating) || body.rating! < 1 || body.rating! > 5 || !body.comment?.trim()) {
      return NextResponse.json({ error: "A rating and comment are required." }, { status: 400 });
    }

    const reviews = await upsertProductReview({
      catalogId: id,
      rating: body.rating as number,
      comment: body.comment.trim(),
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit review.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
