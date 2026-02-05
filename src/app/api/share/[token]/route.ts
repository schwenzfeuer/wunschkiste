import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db, wishlists, products, reservations, users } from "@/lib/db";

type RouteParams = { params: Promise<{ token: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;

  const [wishlist] = await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      description: wishlists.description,
      theme: wishlists.theme,
      isPublic: wishlists.isPublic,
      ownerName: users.name,
    })
    .from(wishlists)
    .innerJoin(users, eq(users.id, wishlists.userId))
    .where(eq(wishlists.shareToken, token));

  if (!wishlist || !wishlist.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const wishlistProducts = await db
    .select({
      id: products.id,
      title: products.title,
      originalUrl: products.originalUrl,
      affiliateUrl: products.affiliateUrl,
      imageUrl: products.imageUrl,
      price: products.price,
      currency: products.currency,
      shopName: products.shopName,
    })
    .from(products)
    .where(eq(products.wishlistId, wishlist.id));

  const productIds = wishlistProducts.map((p) => p.id);

  const productReservations =
    productIds.length > 0
      ? await db
          .select({
            productId: reservations.productId,
            reservedByName: reservations.reservedByName,
            reservedAt: reservations.reservedAt,
          })
          .from(reservations)
          .where(inArray(reservations.productId, productIds))
      : [];

  const productsWithReservation = wishlistProducts.map((product) => ({
    ...product,
    isReserved: productReservations.some((r) => r.productId === product.id),
  }));

  return NextResponse.json({
    ...wishlist,
    products: productsWithReservation,
  });
}
