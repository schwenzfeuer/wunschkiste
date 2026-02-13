import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, products, reservations, savedWishlists } from "@/lib/db";

const leaveSchema = z.object({
  wishlistId: z.string().uuid(),
});

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = leaveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { wishlistId } = parsed.data;

  const [wishlist] = await db
    .select({ userId: wishlists.userId })
    .from(wishlists)
    .where(eq(wishlists.id, wishlistId));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (wishlist.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot leave own wishlist" }, { status: 400 });
  }

  const productIds = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.wishlistId, wishlistId));

  if (productIds.length > 0) {
    await db
      .delete(reservations)
      .where(
        and(
          eq(reservations.userId, session.user.id),
          inArray(reservations.productId, productIds.map((p) => p.id))
        )
      );
  }

  await db
    .delete(savedWishlists)
    .where(
      and(
        eq(savedWishlists.userId, session.user.id),
        eq(savedWishlists.wishlistId, wishlistId)
      )
    );

  return new NextResponse(null, { status: 200 });
}
