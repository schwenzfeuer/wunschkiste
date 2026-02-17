import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, chatReadCursors } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
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

  await db
    .insert(chatReadCursors)
    .values({
      wishlistId: id,
      userId: session.user.id,
      lastReadAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [chatReadCursors.userId, chatReadCursors.wishlistId],
      set: { lastReadAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}
