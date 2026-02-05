import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, products, wishlists } from "@/lib/db";
import { createAffiliateUrl } from "@/lib/affiliate";

const createProductSchema = z.object({
  originalUrl: z.string().url(),
  title: z.string().min(1).max(200),
  imageUrl: z.string().url().optional().nullable(),
  price: z.string().optional().nullable(),
  currency: z.string().default("EUR"),
  shopName: z.string().optional().nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

async function verifyWishlistOwnership(
  wishlistId: string,
  userId: string
): Promise<boolean> {
  const [wishlist] = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(eq(wishlists.id, wishlistId), eq(wishlists.userId, userId)));
  return !!wishlist;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyWishlistOwnership(id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const wishlistProducts = await db
    .select()
    .from(products)
    .where(eq(products.wishlistId, id));

  return NextResponse.json(wishlistProducts);
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await verifyWishlistOwnership(id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const affiliateUrl = createAffiliateUrl(parsed.data.originalUrl);

  const [product] = await db
    .insert(products)
    .values({
      wishlistId: id,
      originalUrl: parsed.data.originalUrl,
      affiliateUrl: affiliateUrl !== parsed.data.originalUrl ? affiliateUrl : null,
      title: parsed.data.title,
      imageUrl: parsed.data.imageUrl,
      imageUrlOriginal: parsed.data.imageUrl,
      price: parsed.data.price,
      currency: parsed.data.currency,
      shopName: parsed.data.shopName,
    })
    .returning();

  return NextResponse.json(product, { status: 201 });
}
