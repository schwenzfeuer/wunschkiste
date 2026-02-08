import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, savedWishlists, users } from "@/lib/db";

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

  const [wishlist] = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participants = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
    })
    .from(savedWishlists)
    .innerJoin(users, eq(users.id, savedWishlists.userId))
    .where(eq(savedWishlists.wishlistId, id));

  return NextResponse.json(participants);
}
