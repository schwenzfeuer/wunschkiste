import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db, chatReadCursors } from "@/lib/db";

const muteSchema = z.object({
  muted: z.boolean(),
});

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

  const body = await request.json();
  const parsed = muteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await db
    .insert(chatReadCursors)
    .values({
      wishlistId: id,
      userId: session.user.id,
      muted: parsed.data.muted,
    })
    .onConflictDoUpdate({
      target: [chatReadCursors.userId, chatReadCursors.wishlistId],
      set: { muted: parsed.data.muted },
    });

  return NextResponse.json({ ok: true });
}
