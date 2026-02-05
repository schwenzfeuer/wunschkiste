import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, products, reservations } from "@/lib/db";

const reserveSchema = z.object({
  productId: z.string().uuid(),
  reservedByName: z.string().min(1).max(100).optional(),
  message: z.string().max(500).optional(),
});

type RouteParams = { params: Promise<{ token: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const body = await request.json();
  const parsed = reserveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verify wishlist exists and is public
  const [wishlist] = await db
    .select({ id: wishlists.id, userId: wishlists.userId })
    .from(wishlists)
    .where(and(eq(wishlists.shareToken, token), eq(wishlists.isPublic, true)));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify product belongs to this wishlist
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(
        eq(products.id, parsed.data.productId),
        eq(products.wishlistId, wishlist.id)
      )
    );

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check if already reserved
  const [existingReservation] = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(eq(reservations.productId, parsed.data.productId));

  if (existingReservation) {
    return NextResponse.json(
      { error: "Product already reserved" },
      { status: 409 }
    );
  }

  // Create reservation
  const [reservation] = await db
    .insert(reservations)
    .values({
      productId: parsed.data.productId,
      reservedByUserId: session?.user?.id ?? null,
      reservedByName: parsed.data.reservedByName ?? session?.user?.name ?? "Anonym",
      message: parsed.data.message,
    })
    .returning();

  return NextResponse.json(reservation, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  // Verify wishlist exists
  const [wishlist] = await db
    .select({ id: wishlists.id, userId: wishlists.userId })
    .from(wishlists)
    .where(eq(wishlists.shareToken, token));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get the reservation
  const [reservation] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.productId, productId));

  if (!reservation) {
    return NextResponse.json({ error: "No reservation found" }, { status: 404 });
  }

  // Only allow deletion by the person who reserved or the wishlist owner
  const isOwner = session?.user?.id === wishlist.userId;
  const isReserver = session?.user?.id === reservation.reservedByUserId;

  if (!isOwner && !isReserver) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(reservations).where(eq(reservations.id, reservation.id));

  return new NextResponse(null, { status: 204 });
}
