import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, products, reservations } from "@/lib/db";
import { reservationStatusEnum } from "@/lib/db/schema";
import { ajReserve } from "@/lib/security/arcjet";

const reserveSchema = z.object({
  productId: z.string().uuid(),
  status: z.enum(reservationStatusEnum.enumValues).default("reserved"),
  message: z.string().max(500).optional(),
});

type RouteParams = { params: Promise<{ token: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;

  if (ajReserve) {
    const decision = await ajReserve.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reserveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [wishlist] = await db
    .select({ id: wishlists.id, userId: wishlists.userId })
    .from(wishlists)
    .where(and(eq(wishlists.shareToken, token), eq(wishlists.isPublic, true)));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (wishlist.userId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot reserve on your own wishlist" },
      { status: 403 }
    );
  }

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

  const [reservation] = await db
    .insert(reservations)
    .values({
      productId: parsed.data.productId,
      userId: session.user.id,
      userName: session.user.name || "Anonym",
      status: parsed.data.status,
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

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const [wishlist] = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(eq(wishlists.shareToken, token));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [reservation] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.productId, productId));

  if (!reservation) {
    return NextResponse.json({ error: "No reservation found" }, { status: 404 });
  }

  if (reservation.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(reservations).where(eq(reservations.id, reservation.id));

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const productId = body.productId;

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const [wishlist] = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(eq(wishlists.shareToken, token));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [reservation] = await db
    .select()
    .from(reservations)
    .where(eq(reservations.productId, productId));

  if (!reservation) {
    return NextResponse.json({ error: "No reservation found" }, { status: 404 });
  }

  if (reservation.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (reservation.status !== "reserved") {
    return NextResponse.json(
      { error: "Can only upgrade from reserved to bought" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(reservations)
    .set({ status: "bought" })
    .where(eq(reservations.id, reservation.id))
    .returning();

  return NextResponse.json(updated);
}
