import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, products, reservations, users, savedWishlists } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      shareToken: wishlists.shareToken,
      ownerName: users.name,
      eventDate: wishlists.eventDate,
      myReservedCount: sql<number>`cast(count(${reservations.id}) filter (where ${reservations.status} = 'reserved') as int)`.as("my_reserved_count"),
      myBoughtCount: sql<number>`cast(count(${reservations.id}) filter (where ${reservations.status} = 'bought') as int)`.as("my_bought_count"),
    })
    .from(savedWishlists)
    .innerJoin(wishlists, eq(savedWishlists.wishlistId, wishlists.id))
    .innerJoin(users, eq(wishlists.userId, users.id))
    .leftJoin(products, eq(products.wishlistId, wishlists.id))
    .leftJoin(
      reservations,
      sql`${reservations.productId} = ${products.id} and ${reservations.userId} = ${savedWishlists.userId}`
    )
    .where(eq(savedWishlists.userId, session.user.id))
    .groupBy(wishlists.id, users.name);

  return NextResponse.json(result);
}
