import { NextRequest, NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, products, reservations, users, savedWishlists } from "@/lib/db";

type RouteParams = { params: Promise<{ token: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;

  const session = await auth.api.getSession({
    headers: request.headers,
  }).catch(() => null);

  const [wishlist] = await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      description: wishlists.description,
      theme: wishlists.theme,
      isPublic: wishlists.isPublic,
      ownerName: users.name,
      ownerId: wishlists.userId,
      eventDate: wishlists.eventDate,
      ownerVisibility: wishlists.ownerVisibility,
    })
    .from(wishlists)
    .innerJoin(users, eq(users.id, wishlists.userId))
    .where(eq(wishlists.shareToken, token));

  if (!wishlist || !wishlist.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = session?.user?.id === wishlist.ownerId;
  const isLoggedIn = !!session?.user;
  const currentUserId = session?.user?.id;

  let isEditor = false;

  if (isLoggedIn && !isOwner) {
    await db.insert(savedWishlists)
      .values({ userId: currentUserId!, wishlistId: wishlist.id })
      .onConflictDoNothing();

    const [editorCheck] = await db
      .select({ role: savedWishlists.role })
      .from(savedWishlists)
      .where(
        and(
          eq(savedWishlists.wishlistId, wishlist.id),
          eq(savedWishlists.userId, currentUserId!),
          eq(savedWishlists.role, "editor")
        )
      );
    isEditor = !!editorCheck;
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
            userId: reservations.userId,
            userName: reservations.userName,
            status: reservations.status,
          })
          .from(reservations)
          .where(inArray(reservations.productId, productIds))
      : [];

  if (isOwner && wishlist.ownerVisibility === "surprise") {
    const claimedCount = productReservations.length;
    const productsPlain = wishlistProducts.map((product) => ({
      ...product,
      status: "available" as const,
      claimedByMe: false,
      claimedByName: null,
    }));

    return NextResponse.json({
      id: wishlist.id,
      title: wishlist.title,
      description: wishlist.description,
      theme: wishlist.theme,
      ownerName: wishlist.ownerName,
      eventDate: wishlist.eventDate,
      ownerVisibility: wishlist.ownerVisibility,
      isOwner,
      isEditor,
      isLoggedIn,
      claimedCount,
      totalCount: wishlistProducts.length,
      products: productsPlain,
    });
  }

  const productsWithReservation = wishlistProducts.map((product) => {
    const reservation = productReservations.find((r) => r.productId === product.id);

    let status: "available" | "reserved" | "bought" = "available";
    let claimedByMe = false;
    let claimedByName: string | null = null;

    if (reservation) {
      status = reservation.status;
      claimedByMe = currentUserId === reservation.userId;

      if (!isOwner || wishlist.ownerVisibility === "full") {
        claimedByName = reservation.userName;
      }
    }

    return {
      ...product,
      status,
      claimedByMe,
      claimedByName,
    };
  });

  return NextResponse.json({
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    theme: wishlist.theme,
    ownerName: wishlist.ownerName,
    eventDate: wishlist.eventDate,
    ownerVisibility: wishlist.ownerVisibility,
    isOwner,
    isEditor,
    isLoggedIn,
    products: productsWithReservation,
  });
}
