import { NextRequest, NextResponse } from "next/server";
import { eq, and, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, products, reservations, users, savedWishlists, chatMessages, chatReadCursors } from "@/lib/db";

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
      role: savedWishlists.role,
      myReservedCount: sql<number>`cast(count(${reservations.id}) filter (where ${reservations.status} = 'reserved') as int)`.as("my_reserved_count"),
      myBoughtCount: sql<number>`cast(count(${reservations.id}) filter (where ${reservations.status} = 'bought') as int)`.as("my_bought_count"),
    })
    .from(savedWishlists)
    .innerJoin(wishlists, eq(savedWishlists.wishlistId, wishlists.id))
    .innerJoin(users, eq(wishlists.userId, users.id))
    .leftJoin(products, sql`${products.wishlistId} = ${wishlists.id} and ${products.hidden} = false`)
    .leftJoin(
      reservations,
      sql`${reservations.productId} = ${products.id} and ${reservations.userId} = ${savedWishlists.userId}`
    )
    .where(eq(savedWishlists.userId, session.user.id))
    .groupBy(wishlists.id, users.name, savedWishlists.role);

  const wishlistIds = result.map((r) => r.id);

  const unreadCounts =
    wishlistIds.length > 0
      ? await db
          .select({
            wishlistId: chatMessages.wishlistId,
            unreadCount: sql<number>`cast(count(${chatMessages.id}) as int)`.as("unread_count"),
          })
          .from(chatMessages)
          .leftJoin(
            chatReadCursors,
            and(
              eq(chatReadCursors.wishlistId, chatMessages.wishlistId),
              eq(chatReadCursors.userId, sql`${session.user.id}::uuid`)
            )
          )
          .where(
            and(
              inArray(chatMessages.wishlistId, wishlistIds),
              sql`(${chatReadCursors.lastReadAt} IS NULL OR ${chatMessages.createdAt} > ${chatReadCursors.lastReadAt})`,
              sql`(${chatReadCursors.muted} IS NULL OR ${chatReadCursors.muted} = false)`
            )
          )
          .groupBy(chatMessages.wishlistId)
      : [];

  const withUnread = result.map((r) => ({
    ...r,
    unreadChatCount: unreadCounts.find((u) => u.wishlistId === r.id)?.unreadCount ?? 0,
  }));

  return NextResponse.json(withUnread);
}
