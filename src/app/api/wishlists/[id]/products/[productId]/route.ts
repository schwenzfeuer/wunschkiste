import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, products } from "@/lib/db";
import { verifyWishlistAccess } from "@/lib/wishlist-access";

const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  imageUrl: z.string().url().optional().nullable(),
  price: z.string().optional().nullable(),
  currency: z.string().optional(),
  shopName: z.string().optional().nullable(),
  priority: z.number().int().min(1).max(3).nullable().optional(),
  hidden: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string; productId: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id, productId } = await params;
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

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.wishlistId, id)));

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id, productId } = await params;
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
  const parsed = updateProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Swap logic: if setting a priority, clear it from any other product in same wishlist
  if (parsed.data.priority != null) {
    await db
      .update(products)
      .set({ priority: null, updatedAt: new Date() })
      .where(
        and(
          eq(products.wishlistId, id),
          eq(products.priority, parsed.data.priority),
          ne(products.id, productId)
        )
      );
  }

  const [product] = await db
    .update(products)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, productId), eq(products.wishlistId, id)))
    .returning();

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id, productId } = await params;
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

  const [deleted] = await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.wishlistId, id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
