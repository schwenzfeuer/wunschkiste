import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, products, wishlists, reservations } from "@/lib/db";
import { createAffiliateUrl } from "@/lib/affiliate";
import { verifyWishlistAccess } from "@/lib/wishlist-access";
import { notifyWishlistRoom } from "@/lib/realtime/notify";

const createProductSchema = z.object({
  originalUrl: z.string().url(),
  resolvedUrl: z.string().url().optional().nullable(),
  title: z.string().min(1).max(200),
  imageUrl: z.string().url().optional().nullable(),
  price: z.string().optional().nullable(),
  currency: z.string().default("EUR"),
  shopName: z.string().optional().nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

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

  const { role } = await verifyWishlistAccess(id, session.user.id);
  if (!role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [wishlistData] = await db
    .select({ ownerVisibility: wishlists.ownerVisibility })
    .from(wishlists)
    .where(eq(wishlists.id, id));

  const wishlistProducts = await db
    .select()
    .from(products)
    .where(eq(products.wishlistId, id));

  const productIds = wishlistProducts.map((p) => p.id);
  const productReservations =
    productIds.length > 0
      ? await db
          .select({
            productId: reservations.productId,
            userName: reservations.userName,
            status: reservations.status,
          })
          .from(reservations)
          .where(inArray(reservations.productId, productIds))
      : [];

  const visibility = wishlistData?.ownerVisibility ?? "partial";

  const productsWithReservations = wishlistProducts.map((product) => {
    const reservation = productReservations.find((r) => r.productId === product.id);

    if (!reservation || visibility === "surprise") {
      return { ...product, reservationStatus: null, reservedByName: null };
    }

    return {
      ...product,
      reservationStatus: reservation.status,
      reservedByName: visibility === "full" ? reservation.userName : null,
    };
  });

  return NextResponse.json(productsWithReservations);
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

  const { role } = await verifyWishlistAccess(id, session.user.id);
  if (!role) {
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

  const urlForAffiliate = parsed.data.resolvedUrl || parsed.data.originalUrl;
  const affiliateUrl = createAffiliateUrl(urlForAffiliate);

  const [product] = await db
    .insert(products)
    .values({
      wishlistId: id,
      originalUrl: parsed.data.originalUrl,
      affiliateUrl: affiliateUrl !== urlForAffiliate ? affiliateUrl : null,
      title: parsed.data.title,
      imageUrl: parsed.data.imageUrl,
      imageUrlOriginal: parsed.data.imageUrl,
      price: parsed.data.price,
      currency: parsed.data.currency,
      shopName: parsed.data.shopName,
    })
    .returning();

  await notifyWishlistRoom(id);

  return NextResponse.json(product, { status: 201 });
}
